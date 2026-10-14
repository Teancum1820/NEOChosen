const { test } = require("node:test");
const assert = require("node:assert/strict");
const vm = require("node:vm");
const fs = require("node:fs");
const source = fs.readFileSync(
  __dirname + "/../breakfast/breakfast.js",
  "utf8",
);
async function submit({
  status = 201,
  result = { ok: true, id: "local-record" },
  valid = true,
  endpoint = "/api/breakfast-requests",
} = {}) {
  const events = [],
    handlers = {},
    errors = {};
  let requests = 0;
  const control = {
    name: "email",
    required: true,
    value: "analytics-qa@example.com",
    validity: { valid, typeMismatch: !valid },
    addEventListener() {},
    setAttribute() {},
    removeAttribute() {},
    hasAttribute() {
      return false;
    },
    focus() {},
    dispatchEvent() {},
  };
  const button = { disabled: false };
  const statusElement = { hidden: true, dataset: {}, focus() {} };
  const form = {
    dataset: { endpoint },
    elements: { namedItem: () => control },
    querySelector: () => button,
    querySelectorAll: () => [control],
    addEventListener: (name, fn) => (handlers[name] = fn),
    setAttribute() {},
    removeAttribute() {},
    reset() {
      control.value = "";
    },
  };
  const document = {
    getElementById: (id) =>
      id === "breakfast-request-form"
        ? form
        : id === "request-status"
          ? statusElement
          : (errors[id] ??= {}),
    querySelectorAll: () => [],
    dispatchEvent: (event) => events.push(event),
  };
  const context = {
    document,
    AbortController,
    FormData: class {},
    CustomEvent: class {
      constructor(type, options) {
        this.type = type;
        this.detail = options.detail;
      }
    },
    setTimeout,
    clearTimeout,
    fetch: async () => {
      requests++;
      return { status, json: async () => result };
    },
  };
  vm.runInNewContext(source, context);
  await handlers.submit({ preventDefault() {} });
  return { events, requests, state: statusElement.dataset.state, button, form };
}
test("actual breakfast script emits no saved-lead event for invalid, disabled, failed or ambiguous submissions", async () => {
  for (const opts of [
    { valid: false },
    { endpoint: "" },
    { status: 500 },
    { status: 200 },
    { result: { ok: false, id: "local-record" } },
    { result: { ok: true, id: "" } },
    { result: null },
  ]) {
    const r = await submit(opts);
    assert.equal(r.events.length, 0);
    if (opts.valid === false || opts.endpoint === "")
      assert.equal(r.requests, 0);
  }
});
test("actual breakfast success callback emits one non-personal saved-lead acknowledgement after HTTP 201", async () => {
  const r = await submit();
  assert.equal(r.requests, 1);
  assert.equal(r.state, "success");
  assert.equal(r.events.length, 1);
  assert.equal(r.events[0].type, "khg:form-success");
  assert.deepEqual(JSON.parse(JSON.stringify(r.events[0].detail)), {
    form_type: "breakfast_invitation",
    submission_key: "local-record",
  });
  assert.equal(r.button.disabled, true);
  assert.equal(r.form.elements.namedItem("email").disabled, true);
});
