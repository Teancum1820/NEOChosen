import "../site.css";
import "../sponsor-system.css";
import "../homepage.css";
import "../sponsors/sponsors.css";
import "../stories/workshop.css";
import homepage from "../dist/index.html?raw";
import directory from "../dist/sponsors/index.html?raw";

// The production site keeps page CSS inline. Reuse those exact rules in the
// development-only canvas so captured fragments reflect current components.
for (const source of [homepage, directory]) {
  const page = new DOMParser().parseFromString(source, "text/html");
  for (const original of page.querySelectorAll("style")) {
    const style = document.createElement("style");
    style.textContent = original.textContent;
    document.head.append(style);
  }
}

export default {
  parameters: {
    layout: "fullscreen",
    backgrounds: {
      default: "dark",
      values: [
        { name: "dark", value: "#070604" },
        { name: "light", value: "#f5efe0" },
      ],
    },
  },
};
