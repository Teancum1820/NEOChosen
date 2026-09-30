// Full print decks load only when their desktop preview approaches the viewport.
// Direct open/download links remain available at every screen size and without JS.
const pdfPreviews = document.querySelectorAll("[data-pdf-src]");
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting && matchMedia("(min-width: 801px)").matches) {
          entry.target.setAttribute(
            "data",
            entry.target.getAttribute("data-pdf-src"),
          );
          observer.unobserve(entry.target);
        }
      }
    },
    { rootMargin: "250px" },
  );
  pdfPreviews.forEach((object) => observer.observe(object));
}
