(() => {
  const form = document.getElementById("breakfast-request-form");
  if (!form) return;
  const endpoint = form.dataset.endpoint;
  const submit = form.querySelector('button[type="submit"]');
  const status = document.getElementById("request-status");
  const controls = [
    ...form.querySelectorAll('input:not([name="website"]), select, textarea'),
  ];
  const gathering = form.elements.namedItem("gathering");
  let busy = false;
  form.noValidate = true;

  document.querySelectorAll("[data-gathering]").forEach((link) => {
    link.addEventListener("click", () => {
      gathering.value = link.dataset.gathering;
      gathering.dispatchEvent(new Event("change"));
      requestAnimationFrame(() => gathering.focus({ preventScroll: true }));
    });
  });
  const showStatus = (message, state) => {
    status.hidden = false;
    status.dataset.state = state;
    status.textContent = message;
  };
  const check = (control) => {
    const error = document.getElementById(`error-${control.name}`);
    const empty = control.required && !control.value.trim();
    const invalid = empty || !control.validity.valid;
    error.hidden = !invalid;
    error.textContent = empty
      ? "Please complete this field."
      : control.validity.typeMismatch
        ? "Enter a valid email address."
        : "Please check this field.";
    if (invalid) control.setAttribute("aria-invalid", "true");
    else control.removeAttribute("aria-invalid");
    return !invalid;
  };
  controls.forEach((control) => {
    control.addEventListener("blur", () => check(control));
    control.addEventListener("input", () => {
      if (control.hasAttribute("aria-invalid")) check(control);
    });
    control.addEventListener("change", () => check(control));
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (busy) return;
    if (!endpoint) {
      showStatus(
        "Invitation requests are not open yet. No information has been sent.",
        "unavailable",
      );
      return;
    }
    const invalid = controls.filter((control) => !check(control));
    if (invalid.length) {
      showStatus(
        "Please complete the highlighted fields before requesting an invitation.",
        "error",
      );
      invalid[0].focus();
      return;
    }
    const data = new FormData(form);
    busy = true;
    submit.disabled = true;
    form.setAttribute("aria-busy", "true");
    showStatus("Sending your invitation request…", "loading");
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        body: data,
        credentials: "same-origin",
        signal: controller.signal,
      });
      const result = await response.json().catch(() => null);
      // Receipt requires the configured receiver's explicit saved-record acknowledgement.
      if (
        response.status !== 201 ||
        result?.ok !== true ||
        typeof result.id !== "string" ||
        !result.id.trim()
      )
        throw Error("Receipt was not confirmed.");
      showStatus(
        "Your invitation request has been received. Attendance is not yet confirmed. We will follow up directly with invitation and RSVP information.",
        "success",
      );
      form.reset();
      controls.forEach((control) => {
        control.disabled = true;
      });
      status.focus();
    } catch {
      showStatus(
        "We could not confirm receipt of your invitation request. Your information is still in the form. If you lost connection, the request may have reached us; please wait before trying again.",
        "error",
      );
      status.focus();
    } finally {
      clearTimeout(timeout);
      busy = false;
      form.removeAttribute("aria-busy");
      submit.disabled = status.dataset.state === "success";
    }
  });
})();
