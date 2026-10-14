/* Promo link pages (/<video number>/, /tt/ /yt/ /ig/ /fb/ /x/, /free/, /go/?c=N).
   Built by scripts/build_promo.py from promo/links.json; see README "Promo links".
   The inline head script has already settled `via` (window.__promoVia) and written it into the
   URL, so GA4's page_view carries ?via=. This file picks the store flow for the device, fills the
   tracked store links and sends the promo_* events. Without JavaScript the page still shows both
   plain store buttons. */
(() => {
  "use strict";
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const node = $("#promo-data");
  if (!node) return;
  const data = JSON.parse(node.textContent);
  const params = new URLSearchParams(location.search);
  const via = window.__promoVia || "direct";
  const VIA_OK = /^[a-z0-9-]{1,24}$/;

  let code = data.code || null;
  if (data.kind === "dynamic") {
    const raw = (params.get("c") || "").replace(/^vg-?/i, "").replace(/\D/g, "");
    code = raw && raw.length <= 6 && Number(raw) > 0 ? String(Number(raw)) : null;
  }

  const ua = navigator.userAgent || "";
  // Local preview only (python3 -m http.server): ?preview_os=ios|android|desktop and ?preview_reward=1.
  const local = /^(127\.0\.0\.1|localhost)$/.test(location.hostname);
  const previewOs = local ? params.get("preview_os") : null;
  const os = /^(ios|android|desktop)$/.test(previewOs || "")
    ? previewOs
    : /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)
      ? "ios"
      : /Android/i.test(ua)
        ? "android"
        : "desktop";
  const inApp = /BytedanceWebview|musical_ly|TikTok|Instagram|FBAN|FBAV|FB_IAB|Twitter|Snapchat|Reddit/i.test(ua);

  // A reward code is live when it is set and today is inside its optional starts/ends (inclusive).
  const today = new Date().toISOString().slice(0, 10);
  const reward = { ...(data.reward || {}) };
  if (local && params.get("preview_reward") === "1") {
    reward.apple_code = reward.apple_code || "PREVIEWCODE";
    reward.android_code = reward.android_code || "PREVIEWCODE";
  }
  const inWindow = (!reward.starts || reward.starts <= today) && (!reward.ends || today <= reward.ends);
  const appleLive = Boolean(reward.apple_code) && inWindow;
  const androidLive = Boolean(reward.android_code) && inWindow;
  const liveHere = os === "ios" ? appleLive : os === "android" ? androidLive : appleLive || androidLive;

  const campaign = code ? `v${code}` : "bio";
  const apple = data.apple || {};
  const appleStore = apple.pt
    ? `https://apps.apple.com/app/apple-store/id${apple.app_id}?pt=${encodeURIComponent(apple.pt)}` +
      `&ct=${encodeURIComponent(`${campaign}-${via}`.slice(0, 40))}&mt=8`
    : apple.store_url;
  const appleRedeem = `https://apps.apple.com/redeem?ctx=offercodes&id=${apple.app_id}` +
    `&code=${encodeURIComponent(reward.apple_code || "")}`;
  const referrer = `utm_source=${via}&utm_medium=${code ? "video" : "bio"}&utm_campaign=${campaign}`;
  const play = `https://play.google.com/store/apps/details?id=${data.play.package}` +
    `&referrer=${encodeURIComponent(referrer)}`;
  const hrefs = { apple_offer: appleRedeem, app_store: appleStore, google_play: play };

  const base = { promo_code: code || "none", promo_via: via, promo_os: os, promo_kind: data.kind };
  const track = (name, extra = {}) => {
    if (typeof window.gtag === "function") {
      window.gtag("event", name, { ...base, ...extra, transport_type: "beacon" });
    }
  };

  // Show the panel for this device and the live/off variant of each reward block.
  document.documentElement.dataset.promoOs = os;
  $$("[data-os]").forEach((el) => {
    el.hidden = el.dataset.os !== os;
  });
  const state = {
    "apple-live": appleLive,
    "apple-off": !appleLive,
    "android-live": androidLive,
    "android-off": !androidLive,
    "reward-here": liveHere,
    "no-reward-here": !liveHere,
    "has-code": Boolean(code),
    "no-code": !code,
  };
  $$("[data-when]").forEach((el) => {
    el.hidden = !el.dataset.when.split(" ").every((key) => state[key]);
  });
  $$("[data-claim]").forEach((link) => {
    link.href = hrefs[link.dataset.claim] || link.href;
    link.addEventListener("click", () => track("promo_claim", { promo_target: link.dataset.claim }));
  });
  $$("[data-code-number]").forEach((el) => {
    el.textContent = code || "";
  });
  $$("[data-reward-code]").forEach((el) => {
    el.textContent = reward.android_code || "";
  });
  $$("[data-copy-field]").forEach((el) => {
    el.value = reward.android_code || "";
  });
  if (data.kind === "dynamic" && code) {
    document.title = `Video #${code} · Civic Watch`;
  }

  // Android: the reward code to type into the game.
  $$("[data-copy]").forEach((button) => {
    button.addEventListener("click", async () => {
      const text = reward.android_code || "";
      let ok = false;
      try {
        await navigator.clipboard.writeText(text);
        ok = true;
      } catch (error) {
        const field = $("[data-copy-field]");
        if (field) {
          field.select();
          ok = document.execCommand && document.execCommand("copy");
        }
      }
      button.textContent = ok ? "COPIED" : "SELECT + COPY";
      track("promo_copy");
    });
  });

  // Desktop: a QR code for this same page, keeping the source.
  const qr = $("[data-qr]");
  if (qr && os === "desktop" && window.CivicQR) {
    const target = new URL(location.pathname, location.origin);
    if (code && data.kind === "dynamic") target.searchParams.set("c", code);
    target.searchParams.set("via", via === "direct" ? "qr" : via);
    qr.innerHTML = window.CivicQR.svg(target.toString());
    const svg = qr.querySelector("svg");
    if (svg) svg.setAttribute("aria-label", "QR code for this page");
  }

  // Bio pages: "Saw a number in a video?" sends the visitor to that video's page.
  const form = $("[data-code-form]");
  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const input = $("input", form);
      const raw = (input.value || "").replace(/^vg-?/i, "").replace(/\D/g, "");
      const error = $("[data-code-error]", form);
      if (!raw || raw.length > 6 || Number(raw) <= 0) {
        if (error) error.hidden = false;
        input.focus();
        return;
      }
      const number = String(Number(raw));
      track("promo_code_entered", { promo_entered: number });
      const from = VIA_OK.test(via) ? via : "direct";
      location.href = `/go/?c=${number}&via=${encodeURIComponent(from)}`;  // works before the page for that number is built
    });
  }

  track("promo_view", { promo_inapp: inApp ? "yes" : "no", promo_reward: liveHere ? "yes" : "no" });
})();
