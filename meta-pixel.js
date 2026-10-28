(() => {
  "use strict";

  const pixelId = "1860136745126437";
  const consentKey = "khg_meta_tracking_consent_v1";
  let pixelStarted = false;

  function getConsent() {
    try { return window.localStorage.getItem(consentKey); } catch { return null; }
  }

  function startPixel() {
    if (pixelStarted || getConsent() !== "allow") return;
    pixelStarted = true;

    if (!window.fbq) {
      const fbq = window.fbq = function () {
        fbq.callMethod ? fbq.callMethod.apply(fbq, arguments) : fbq.queue.push(arguments);
      };
      if (!window._fbq) window._fbq = fbq;
      fbq.push = fbq;
      fbq.loaded = true;
      fbq.version = "2.0";
      fbq.queue = [];
      const script = document.createElement("script");
      script.async = true;
      script.src = "https://connect.facebook.net/en_US/fbevents.js";
      document.head.appendChild(script);
    }

    window.fbq("init", pixelId);
    window.fbq("track", "PageView");
  }

  function setConsent(value) {
    try { window.localStorage.setItem(consentKey, value); } catch { /* Keep optional tracking off if storage is unavailable. */ }
    if (value === "allow") startPixel();
    closeBanner();
  }

  let banner;
  function closeBanner() {
    if (banner) banner.hidden = true;
  }

  function openBanner() {
    if (!banner) createBanner();
    banner.hidden = false;
    const firstButton = banner.querySelector("[data-meta-reject]");
    if (firstButton) firstButton.focus();
  }

  function createBanner() {
    banner = document.createElement("section");
    banner.className = "meta-consent-banner";
    banner.setAttribute("aria-label", "Optional Meta tracking choice");
    banner.setAttribute("role", "region");
    banner.innerHTML = '<div class="meta-consent-copy"><p><strong>Optional social-media measurement</strong><br>With your permission, Meta may receive page views and clicks on The Piano Guys ticket link. This helps Kirtland Heritage Group measure interest. Ticket purchase details are not tracked here. <a href="/privacy/">Privacy &amp; tracking details</a>.</p></div><div class="meta-consent-actions"><button type="button" data-meta-reject>Reject optional tracking</button><button type="button" data-meta-allow>Allow Meta tracking</button></div>';
    banner.querySelector("[data-meta-reject]").addEventListener("click", () => setConsent("reject"));
    banner.querySelector("[data-meta-allow]").addEventListener("click", () => setConsent("allow"));
    document.body.appendChild(banner);
  }

  document.addEventListener("click", event => {
    const settings = event.target.closest("[data-meta-consent-open]");
    if (settings) {
      event.preventDefault();
      openBanner();
      return;
    }

    if (getConsent() !== "allow" || !window.fbq) return;
    const link = event.target.closest("a[href]");
    if (!link) return;
    let destination;
    try { destination = new URL(link.href); } catch { return; }

    if (destination.hostname !== "www.ticketmaster.com" && destination.hostname !== "ticketmaster.com") return;
    if (destination.pathname !== "/event/05006538EC473EB4") return;

    window.fbq("trackCustom", "TicketClick", {
      event_name: "The Piano Guys",
      destination: "Ticketmaster"
    });
  });

  if (getConsent() === "allow") startPixel();
  else if (!getConsent()) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", openBanner, { once: true });
    else openBanner();
  }
})();