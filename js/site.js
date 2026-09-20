(() => {
  "use strict";
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  // Content remains visible when JavaScript is unavailable.
  if ("IntersectionObserver" in window) {
    document.documentElement.classList.add("js");
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.08 },
    );
    $$(".reveal").forEach((el) => observer.observe(el));
  }
  const menu = $(".menu-toggle");
  const navigation = $("#navigation");
  function closeMenu() {
    navigation.classList.remove("open");
    menu.setAttribute("aria-expanded", "false");
    menu.setAttribute("aria-label", "Open navigation");
  }
  menu?.addEventListener("click", () => {
    const open = menu.getAttribute("aria-expanded") !== "true";
    navigation.classList.toggle("open", open);
    menu.setAttribute("aria-expanded", String(open));
    menu.setAttribute(
      "aria-label",
      open ? "Close navigation" : "Open navigation",
    );
  });
  $$("a", navigation).forEach((a) => a.addEventListener("click", closeMenu));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && navigation.classList.contains("open")) {
      closeMenu();
      menu.focus();
    }
  });
  matchMedia("(min-width: 901px)").addEventListener("change", (e) => {
    if (e.matches) closeMenu();
  });
  const heroImages = [
    [
      "73_pearl_brenda_hank_watch",
      "Pearl, Brenda and Hank organize neighborhood supplies and weapons on a Fairview street",
    ],
    [
      "68_rook_viper_street",
      "Rook and Viper on a street in Fairview, illustrated loading artwork",
    ],
    [
      "69_rico_lola_driveway",
      "Rico and Lola in a Fairview driveway, illustrated loading artwork",
    ],
  ];
  let heroRequest = 0;
  $$("[data-hero]").forEach((button) =>
    button.addEventListener("click", () => {
      const [file, alt] = heroImages[Number(button.dataset.hero)];
      const request = ++heroRequest;
      const img = new Image();
      img.onload = () => {
        if (request !== heroRequest) return;
        $("#hero-art").src = img.src;
        $("#hero-art").alt = alt;
        if (!reduced.matches)
          $("#hero-art").animate([{ opacity: 0.4 }, { opacity: 1 }], {
            duration: 450,
          });
        $$("[data-hero]").forEach((b) =>
          b.setAttribute("aria-pressed", String(b === button)),
        );
      };
      img.src = `assets/loading/${file}.webp`;
    }),
  );
  let opener;
  function showDialog(dialog, from) {
    opener = from;
    dialog.showModal();
    document.body.style.overflow = "hidden";
  }
  $$("dialog").forEach((dialog) => {
    $(".dialog-close", dialog).addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", (e) => {
      const box = dialog.getBoundingClientRect();
      if (
        e.target === dialog &&
        (e.clientX < box.left ||
          e.clientX > box.right ||
          e.clientY < box.top ||
          e.clientY > box.bottom)
      )
        dialog.close();
    });
    dialog.addEventListener("close", () => {
      document.body.style.overflow = "";
      opener?.focus({ preventScroll: true });
    });
  });
  const cards = $$(".character");
  let filter = "all",
    expanded = false;
  const more = $("#more-characters");
  const search = $("#character-search");
  function renderRoster() {
    const query = search.value.trim().toLowerCase();
    const matches = cards.filter(
      (card) =>
        (filter === "all" ||
          (filter === "bot") === (card.dataset.bot === "true")) &&
        `${card.dataset.name} ${card.dataset.role}`
          .toLowerCase()
          .includes(query),
    );
    const showAll = expanded || query.length > 0 || filter === "bot";
    cards.forEach((card) => {
      card.hidden =
        !matches.includes(card) || (!showAll && matches.indexOf(card) >= 8);
    });
    more.hidden = showAll || matches.length <= 8;
    $(".empty-state").hidden = matches.length > 0;
    $("#roster-count").textContent =
      `${showAll ? matches.length : Math.min(8, matches.length)} of ${matches.length} dossiers · ${filter === "bot" ? "Bot opponents" : "29 selectable locals + 2 bot rivals"}`;
  }
  if (cards.length) {
    renderRoster();
    search.addEventListener("input", renderRoster);
    more.addEventListener("click", () => {
      expanded = true;
      renderRoster();
      cards.filter((c) => !c.hidden)[8]?.focus({ preventScroll: true });
    });
    $$("[data-filter]").forEach((button) =>
      button.addEventListener("click", () => {
        filter = button.dataset.filter;
        expanded = false;
        $$("[data-filter]").forEach((b) =>
          b.setAttribute("aria-pressed", String(b === button)),
        );
        renderRoster();
      }),
    );
    cards.forEach((card) =>
      card.addEventListener("click", () => {
        $("#dossier-name").textContent = card.dataset.name;
        $("#dossier-role").textContent = card.dataset.role;
        $("#dossier-bio").textContent = card.dataset.bio;
        $("#dossier-image").src =
          `assets/portraits/${card.dataset.character}.webp`;
        $("#dossier-image").alt = `${card.dataset.name} character portrait`;
        $(".dossier-status").textContent =
          card.dataset.bot === "true"
            ? "BOT OPPONENT / Not selectable"
            : "SELECTABLE OPERATIVE / Shared combat stats";
        showDialog($("#dossier"), card);
      }),
    );
    $("#dossier-join").addEventListener("click", () => $("#dossier").close());
  }
  $$("[data-map]").forEach((button) =>
    button.addEventListener("click", () => {
      $$("[data-map]").forEach((b) =>
        b.setAttribute("aria-pressed", String(b === button)),
      );
      $("#arena-image").src = `assets/maps/${button.dataset.map}.webp`;
      $("#arena-image").alt = `${button.dataset.title} in-game arena preview`;
      $("#arena-title").textContent = button.dataset.title;
      $("#arena-description").textContent = button.dataset.blurb;
      if (!reduced.matches)
        $(".arena-preview").animate([{ opacity: 0.4 }, { opacity: 1 }], {
          duration: 300,
        });
    }),
  );
  $$("[data-lightbox]").forEach((link) =>
    link.addEventListener("click", (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0)
        return;
      e.preventDefault();
      $("#lightbox-image").src = link.href;
      $("#lightbox-image").alt = $("img", link).alt;
      $("#lightbox-caption").textContent = $("img", link).alt;
      showDialog($("#lightbox"), link);
    }),
  );
})();
