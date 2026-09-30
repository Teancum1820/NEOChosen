const escape = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ],
  );

// Static-site image helper for future components. Explicit dimensions reserve
// layout space; only a hero image may opt into eager/high-priority loading.
export function renderImage({
  src,
  alt,
  width,
  height,
  srcSet = [],
  sizes,
  priority = false,
  eager = false,
  className = "",
  position = "center",
}) {
  if (
    !src ||
    alt === undefined ||
    !Number.isInteger(width) ||
    !Number.isInteger(height) ||
    width < 1 ||
    height < 1
  ) {
    throw Error("Image requires src, alt, and positive integer width/height");
  }
  if (!/^[\w\s.%+-]+$/.test(position)) throw Error("Unsafe object position");
  const sources = srcSet.length
    ? ` srcset="${escape(srcSet.map((item) => `${item.src} ${item.width}w`).join(", "))}"`
    : "";
  return `<img${className ? ` class="${escape(className)}"` : ""} src="${escape(src)}" alt="${escape(alt)}" width="${width}" height="${height}"${sources}${sizes ? ` sizes="${escape(sizes)}"` : ""} loading="${priority || eager ? "eager" : "lazy"}" decoding="async"${priority ? ' fetchpriority="high"' : ""} style="object-position:${escape(position)}">`;
}
