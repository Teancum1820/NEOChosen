import home from "../dist/index.html?raw";
import sponsors from "../dist/sponsors/index.html?raw";

const pages = {
  home: new DOMParser().parseFromString(home, "text/html"),
  sponsors: new DOMParser().parseFromString(sponsors, "text/html"),
};

export function existing(page, selector) {
  const element = pages[page].querySelector(selector);
  if (!element)
    throw Error(`Missing current-site fragment: ${page} ${selector}`);
  return element.outerHTML;
}

export function sponsor(id) {
  return existing("sponsors", `[data-sponsor="${id}"]`);
}
