/* ==========================================================
   AlyKraft: site behaviour
   ========================================================== */
(() => {
  "use strict";

  const LINKS = {
    messenger: "https://m.me/61564199488772",
    instagram: "https://ig.me/m/alykraft.v",
    facebook: "https://www.facebook.com/profile.php?id=61564199488772",
  };
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { /* storage blocked */ } },
  };

  /* ---------------- Product data ---------------- */
  const CAT = { bouquet: "Bouquet", stem: "Single stem", gift: "Gift box", doll: "Doll & plushie", charm: "Keychain & pouch" };

  const FLOWERS = [
    ["Black tulip stems", "stem"], ["Lavender lily", "stem"], ["Red lily", "stem"], ["Pink tulip bouquet", "bouquet"],
    ["Little bunch of forever blooms", "bouquet"], ["Sunflower & rose bouquet", "bouquet"], ["Blue lily bouquet", "bouquet"],
    ["Blue blooms bouquet", "bouquet"], ["Lilac lily bouquet", "bouquet"], ["Sunflower duo", "bouquet"],
    ["Sunflower gift crate", "gift"], ["Blue tulip", "stem"], ["Fuchsia & white bouquet", "bouquet"],
    ["Sunshine sunflower bouquet", "bouquet"], ["Pink blossom", "stem"], ["Purple dahlia bouquet", "bouquet"],
    ["Pastel tulip bouquet", "bouquet"], ["Lily flower pots", "gift"], ["Blue tulip basket", "gift"],
    ["Golden sunflower bouquet", "bouquet"], ["Pink tulip bouquet", "bouquet"], ["Sunflower in kraft wrap", "bouquet"],
    ["Blue rose bouquet", "bouquet"], ["Red blossom", "stem"], ["Pink rose", "stem"], ["Purple tulip", "stem"],
    ["Sky blue lily bouquet", "bouquet"], ["Mini sunflower gifts", "gift"], ["Framed mini flowers", "gift"],
    ["Pink lily bouquet", "bouquet"], ["Framed sunflowers", "gift"], ["Red rose bouquet", "bouquet"],
    ["Hot pink lily bouquet", "bouquet"], ["Blush lily bouquet", "bouquet"], ["Red rose posy", "bouquet"],
    ["Sunflower gift box", "gift"], ["Tulip light-up box", "gift"], ["Pink rose dome bouquet", "bouquet"],
    ["Lily & tulip bouquet", "bouquet"], ["Sunflower bouquet", "bouquet"], ["Yellow lily bouquet", "bouquet"],
    ["Pink tulip bouquet", "bouquet"], ["Pink lily bouquet", "bouquet"], ["Rosy tulip bouquet", "bouquet"],
    ["Magenta tulip bouquet", "bouquet"], ["Single blossom bouquet", "stem"], ["Blue lily & tulip bouquet", "bouquet"],
    ["Royal blue rose bouquet", "bouquet"], ["Purple tulip bouquet", "bouquet"], ["Lily & sunflower bouquet", "bouquet"],
  ].map(([title, cat], i) => ({ title, cat, src: `assets/img/flowers/flower-${String(i + 1).padStart(2, "0")}.jpg` }));

  const WORKS = [
    ["Lollipop keychain", "charm"], ["Masked spirit plush", "doll"], ["Fuzzy spider plush", "doll"],
    ["Soot buddy keychains", "charm"], ["Little friends gift box", "charm"], ["Forest friend & sunflower", "doll"],
    ["Forest friend cutie", "doll"], ["Bear in a hoodie charm", "charm"], ["Sunflower charm", "charm"],
    ["Sunflower buddy", "charm"], ["Headphone bear", "doll"], ["Headphone bear gift box", "doll"],
    ["Custom mini-me doll", "doll"], ["Mini doll keychains", "charm"], ["Mermaid doll keychains", "charm"],
    ["Octopus keychains", "charm"], ["Seahorse keychains", "charm"], ["Coconut pouches", "charm"], ["Fishy pouches", "charm"],
  ].map(([title, cat], i) => ({ title, cat, src: `assets/img/works/work-${String(i + 1).padStart(2, "0")}.jpg` }));

  // Mix flowers and crochet works so "All" shows variety: one work after every ~2-3 flowers.
  const ITEMS = [];
  {
    let w = 0;
    FLOWERS.forEach((f, i) => {
      ITEMS.push(f);
      if (i % 3 === 1 && w < WORKS.length) ITEMS.push(WORKS[w++]);
    });
    while (w < WORKS.length) ITEMS.push(WORKS[w++]);
  }

  const VIDEOS = [
    ["Bouquet magic", "Featured"], ["Behind the stitches", ""], ["Fresh from the hook", ""],
    ["Wrapped with love", ""], ["Little details", ""], ["Ready to gift", ""],
  ].map(([title, badge], i) => ({ title, badge, src: `assets/video/video-${String(i + 1).padStart(2, "0")}.mp4` }));

  /* ---------------- Toast & clipboard ---------------- */
  const toastEl = $("#toast");
  let toastTimer;
  function toast(msg, ms = 3600) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), ms);
  }

  // Synchronous copy first (keeps working when a new tab steals focus right after), async API as backup.
  function copyText(text) {
    let ok = false;
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.cssText = "position:fixed;top:0;left:0;opacity:0;";
      document.body.appendChild(ta);
      ta.select();
      ta.setSelectionRange(0, text.length);
      ok = document.execCommand("copy");
      ta.remove();
    } catch { ok = false; }
    if (!ok && navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).catch(() => {});
      ok = true;
    }
    return ok;
  }

  function openChat(channel, message) {
    const copied = copyText(message);
    window.open(LINKS[channel] || LINKS.messenger, "_blank", "noopener");
    toast(copied
      ? "Message copied ♡ Paste it in the chat and hit send!"
      : "Chat opened. Please type your order in the chat ♡");
  }

  /* ---------------- Loader & hero intro ---------------- */
  function ready() {
    $("#loader").classList.add("done");
    document.body.classList.add("ready");
  }
  // The script is at the end of <body>, so the DOM is ready; wait for fonts briefly, never for the map or videos.
  Promise.race([document.fonts ? document.fonts.ready : Promise.resolve(), new Promise((r) => setTimeout(r, 1500))])
    .then(() => setTimeout(ready, 300));

  $("#year").textContent = new Date().getFullYear();

  /* ---------------- Header, progress, back-to-top ---------------- */
  const header = $("#header"), progress = $("#progress"), toTop = $("#toTop");
  const bgFlowers = $$(".bg-flower");
  function onScroll() {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - innerHeight;
    header.classList.toggle("scrolled", y > 30);
    toTop.classList.toggle("show", y > innerHeight * .8);
    progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    if (!reduceMotion && y < innerHeight * 1.2) {
      bgFlowers.forEach((el, i) => { el.style.translate = `0 ${y * (0.12 + i * 0.08)}px`; });
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }));

  // Logo follows the pointer a little (desktop only)
  const bloom = $(".hero-bloom img");
  if (!reduceMotion && matchMedia("(hover: hover)").matches) {
    $(".hero-card").addEventListener("pointermove", (e) => {
      const r = e.currentTarget.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      bloom.style.transform = `translate(${x * 18}px, ${y * 18}px) rotate(${x * 6}deg)`;
    });
    $(".hero-card").addEventListener("pointerleave", () => { bloom.style.transform = ""; });
    bloom.style.transition = "transform .6s cubic-bezier(.22,1,.36,1)";
  }

  /* ---------------- Menu ---------------- */
  const menu = $("#menu"), menuBtn = $("#menuBtn");
  function setMenu(open) {
    menu.classList.toggle("open", open);
    menu.setAttribute("aria-hidden", String(!open));
    menuBtn.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("no-scroll", open);
    if (open) $("#menuClose").focus();
  }
  menuBtn.addEventListener("click", () => setMenu(true));
  $("#menuClose").addEventListener("click", () => { setMenu(false); menuBtn.focus(); });
  $$(".menu-links a").forEach((a) => a.addEventListener("click", () => setMenu(false)));

  // Active nav link
  const navLinks = $$(".nav-link");
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      navLinks.forEach((l) => l.classList.toggle("active", l.getAttribute("href") === `#${en.target.id}`));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  $$("main section[id]").forEach((s) => spy.observe(s));

  /* ---------------- Reveal on scroll ---------------- */
  const revealer = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      en.target.classList.add("in");
      revealer.unobserve(en.target);
      const counter = en.target.querySelector("[data-count]");
      if (counter) countUp(counter);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

  function observeReveal(root = document) {
    // stagger siblings that share a parent
    const groups = new Map();
    $$(".reveal:not(.in), .item:not(.in):not(.hide)", root).forEach((el) => {
      const p = el.parentElement;
      const n = groups.get(p) || 0;
      groups.set(p, n + 1);
      el.style.setProperty("--d", `${Math.min(n, 8) * 0.07}s`);
      revealer.observe(el);
    });
  }

  function countUp(el) {
    const end = +el.dataset.count;
    const plain = el.hasAttribute("data-plain");
    const start = plain ? end - 24 : 0;
    if (reduceMotion) { el.textContent = end; return; }
    const t0 = performance.now(), dur = 1600;
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / dur);
      el.textContent = Math.round(start + (end - start) * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  /* ---------------- Shop grid ---------------- */
  const grid = $("#grid"), loadMore = $("#loadMore");
  const PAGE = 16;
  let filter = "all", shown = PAGE, visible = [];

  grid.innerHTML = ITEMS.map((it, i) => `
    <article class="item" data-cat="${it.cat}" data-index="${i}">
      <img src="${it.src}" alt="${it.title}, handmade by AlyKraft" loading="lazy" width="206" height="206" />
      <button class="item-open" type="button" aria-label="View ${it.title}"></button>
      <div class="item-info">
        <b>${it.title}</b>
        <button class="ask-btn" type="button" data-ask="${i}">Ask price</button>
      </div>
    </article>`).join("");
  const cards = $$(".item", grid);

  // Counts on filter chips
  $$(".chip").forEach((c) => {
    const f = c.dataset.filter;
    const n = f === "all" ? ITEMS.length : ITEMS.filter((it) => it.cat === f).length;
    c.insertAdjacentHTML("beforeend", `<span class="count">${n}</span>`);
  });

  function renderGrid() {
    visible = [];
    let count = 0;
    cards.forEach((card) => {
      const match = filter === "all" || card.dataset.cat === filter;
      const show = match && count < shown;
      if (match) count++;
      card.classList.toggle("hide", !show);
      if (show) visible.push(+card.dataset.index);
    });
    loadMore.parentElement.classList.toggle("gone", count <= shown);
    loadMore.textContent = `Show more works (${count - Math.min(count, shown)} more)`;
    observeReveal(grid);
  }

  $$(".chip").forEach((chip) => chip.addEventListener("click", () => {
    $$(".chip").forEach((c) => { c.classList.toggle("active", c === chip); c.setAttribute("aria-selected", String(c === chip)); });
    filter = chip.dataset.filter;
    shown = PAGE;
    cards.forEach((c) => c.classList.remove("in"));
    renderGrid();
  }));
  loadMore.addEventListener("click", () => { shown += PAGE; renderGrid(); });

  grid.addEventListener("click", (e) => {
    const ask = e.target.closest("[data-ask]");
    if (ask) { askPrice(ITEMS[+ask.dataset.ask]); return; }
    const card = e.target.closest(".item");
    if (card) openLightbox(+card.dataset.index);
  });

  function askPrice(item) {
    openChat("messenger", `Hi AlyKraft! ♡ How much is the "${item.title}" (${CAT[item.cat]}) I saw on your website? Thank you!`);
  }

  /* ---------------- Lightbox ---------------- */
  const lb = $("#lightbox"), lbImg = $("#lbImg");
  let lbPos = 0, lastFocus = null;

  function showLb() {
    const it = ITEMS[visible[lbPos]];
    lbImg.src = it.src;
    lbImg.alt = `${it.title}, handmade by AlyKraft`;
    $("#lbTitle").textContent = it.title;
    $("#lbCat").textContent = CAT[it.cat];
  }
  function openLightbox(index) {
    lbPos = Math.max(0, visible.indexOf(index));
    showLb();
    lastFocus = document.activeElement;
    openModal(lb);
  }
  const stepLb = (d) => { lbPos = (lbPos + d + visible.length) % visible.length; showLb(); };
  $("#lbPrev").addEventListener("click", () => stepLb(-1));
  $("#lbNext").addEventListener("click", () => stepLb(1));
  $("#lbAsk").addEventListener("click", () => askPrice(ITEMS[visible[lbPos]]));
  $("#lbCustom").addEventListener("click", () => {
    const it = ITEMS[visible[lbPos]];
    closeModal(lb);
    const typeFor = { bouquet: "Flower bouquet", gift: "Flower bouquet", stem: "Single stem flower", doll: "Crochet doll / plushie", charm: "Keychain / charm" };
    const radio = $(`input[name="type"][value="${typeFor[it.cat]}"]`);
    if (radio) radio.checked = true;
    const desc = $("#fDesc");
    desc.value = `Something like your "${it.title}", but `;
    updatePreview();
    $("#order").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
    setTimeout(() => { desc.focus({ preventScroll: true }); desc.setSelectionRange(desc.value.length, desc.value.length); }, 700);
  });

  // swipe in lightbox
  let tx = null;
  lb.addEventListener("touchstart", (e) => { tx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend", (e) => {
    if (tx === null) return;
    const dx = e.changedTouches[0].clientX - tx;
    if (Math.abs(dx) > 50) stepLb(dx < 0 ? 1 : -1);
    tx = null;
  });

  /* ---------------- Modals (shared) ---------------- */
  const vmodal = $("#vmodal"), vPlayer = $("#vPlayer");
  function openModal(m) {
    m.classList.add("open");
    m.setAttribute("aria-hidden", "false");
    document.body.classList.add("no-scroll");
    $(".lb-close", m).focus();
  }
  function closeModal(m) {
    m.classList.remove("open");
    m.setAttribute("aria-hidden", "true");
    document.body.classList.remove("no-scroll");
    if (m === vmodal) { vPlayer.pause(); vPlayer.removeAttribute("src"); vPlayer.load(); }
    if (lastFocus) lastFocus.focus({ preventScroll: true });
  }
  [lb, vmodal].forEach((m) => m.addEventListener("click", (e) => {
    if (e.target === m || e.target.closest("[data-close]")) closeModal(m);
  }));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (lb.classList.contains("open")) closeModal(lb);
      else if (vmodal.classList.contains("open")) closeModal(vmodal);
      else if (menu.classList.contains("open")) { setMenu(false); menuBtn.focus(); }
    }
    if (lb.classList.contains("open")) {
      if (e.key === "ArrowRight") stepLb(1);
      if (e.key === "ArrowLeft") stepLb(-1);
    }
  });

  /* ---------------- Videos ---------------- */
  const reels = $("#reels");
  reels.innerHTML = VIDEOS.map((v, i) => `
    <button class="reel reveal" type="button" data-video="${i}" aria-label="Play video: ${v.title}">
      <video muted loop playsinline preload="none" data-src="${v.src}#t=0.1"></video>
      ${v.badge ? `<span class="reel-badge">${v.badge}</span>` : ""}
      <span class="reel-play" aria-hidden="true"></span>
      <span class="reel-label"><b>${v.title}</b><span>Tap to watch with sound</span></span>
    </button>`).join("");

  // Load each preview when it comes near, play muted while on screen, pause when off.
  const vidObs = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      const vid = en.target.querySelector("video");
      if (en.isIntersecting) {
        if (!vid.src) { vid.src = vid.dataset.src; vid.preload = "metadata"; }
        if (en.intersectionRatio > 0.55 && !reduceMotion) vid.play().catch(() => {});
      } else {
        vid.pause();
      }
    });
  }, { threshold: [0, 0.6], rootMargin: "0px 200px" });
  $$(".reel", reels).forEach((r) => vidObs.observe(r));

  reels.addEventListener("click", (e) => {
    const r = e.target.closest(".reel");
    if (!r) return;
    $$("video", reels).forEach((v) => v.pause());
    lastFocus = r;
    vPlayer.src = VIDEOS[+r.dataset.video].src;
    openModal(vmodal);
    vPlayer.muted = false;
    vPlayer.play().catch(() => {});
  });

  const reelStep = () => ($(".reel", reels).getBoundingClientRect().width + 24);
  $("#reelPrev").addEventListener("click", () => reels.scrollBy({ left: -reelStep(), behavior: "smooth" }));
  $("#reelNext").addEventListener("click", () => reels.scrollBy({ left: reelStep(), behavior: "smooth" }));

  /* ---------------- Custom order form ---------------- */
  const form = $("#orderForm"), preview = $("#msgPreview"), err = $("#formError");

  function buildMessage() {
    const d = new FormData(form);
    const val = (k) => String(d.get(k) || "").trim();
    const date = val("date")
      ? new Date(val("date") + "T00:00").toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })
      : "";
    const lines = [
      "Hi AlyKraft! ♡ I'd like to order:",
      `• Item: ${val("type")}`,
      `• Description: ${val("desc") || "(describe your doll or flowers)"}`,
    ];
    if (val("colors")) lines.push(`• Colours: ${val("colors")}`);
    lines.push(`• Quantity: ${val("qty") || 1}`);
    if (date) lines.push(`• Needed by: ${date}`);
    lines.push(`• Receive via: ${val("get")}`);
    lines.push("", `How much would it be? Thank you!${val("name") ? ` — ${val("name")}` : ""}`);
    return lines.join("\n");
  }
  function updatePreview() { preview.textContent = buildMessage(); }
  form.addEventListener("input", (e) => { e.target.classList.remove("invalid"); err.textContent = ""; updatePreview(); });
  form.addEventListener("change", updatePreview);
  updatePreview();

  // Minimum date = today
  const dateInput = $("#fDate");
  const t = new Date();
  dateInput.min = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;

  function validate() {
    const bad = [];
    [["#fName", "your name"], ["#fDesc", "a short description"]].forEach(([sel, label]) => {
      const el = $(sel);
      const empty = !el.value.trim();
      el.classList.toggle("invalid", empty);
      if (empty) bad.push(label);
    });
    if (bad.length) {
      err.textContent = `Please add ${bad.join(" and ")} so I know what to make ♡`;
      $(".invalid", form).focus();
      return false;
    }
    return true;
  }

  let lastChannel = "messenger";
  $$("[data-channel]", form).forEach((b) => b.addEventListener("click", () => { lastChannel = b.dataset.channel; }));
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const channel = (e.submitter && e.submitter.dataset.channel) || lastChannel;
    if (!validate()) return;
    openChat(channel, buildMessage());
  });
  $("#copyMsg").addEventListener("click", () => {
    if (!validate()) return;
    toast(copyText(buildMessage()) ? "Copied! Paste it in a DM to AlyKraft ♡" : "Couldn't copy. Please select the preview text and copy it.");
  });

  /* ---------------- Falling petals ---------------- */
  const canvas = $("#petals"), ctx = canvas.getContext("2d");
  const toggles = [$("#petalToggle"), $("#petalToggleMenu")];
  let petals = [], W = 0, H = 0, dpr = 1, raf = null;
  const saved = store.get("alykraft-petals");
  let petalsOn = saved ? saved === "on" : !reduceMotion;
  const COLORS = [["#ffd1e3", "#f48fb8"], ["#ffc2da", "#e2588f"], ["#ffe3ee", "#f7a8c8"], ["#fbd0e6", "#d96aa0"]];

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const target = Math.round(Math.min(46, Math.max(16, W / 32)));
    while (petals.length < target) petals.push(makePetal(true));
    petals.length = target;
  }
  function makePetal(anywhere) {
    const s = 7 + Math.random() * 9;
    return {
      x: Math.random() * W, y: anywhere ? Math.random() * H : -20 - Math.random() * 60,
      s, vy: .45 + Math.random() * .9 + s * .03, vx: -.3 + Math.random() * .8,
      rot: Math.random() * Math.PI * 2, vr: (-.5 + Math.random()) * .03,
      flip: Math.random() * Math.PI * 2, vf: .02 + Math.random() * .03,
      sway: Math.random() * Math.PI * 2, c: COLORS[(Math.random() * COLORS.length) | 0],
    };
  }
  function drawPetal(p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.scale(1, Math.abs(Math.cos(p.flip)) * .8 + .2); // 3D-ish flutter
    const g = ctx.createLinearGradient(0, -p.s, 0, p.s);
    g.addColorStop(0, p.c[0]); g.addColorStop(1, p.c[1]);
    ctx.fillStyle = g;
    ctx.globalAlpha = .85;
    ctx.beginPath();
    ctx.moveTo(0, p.s);
    ctx.bezierCurveTo(p.s * .9, p.s * .4, p.s * .7, -p.s * .8, 0, -p.s * .55); // notched petal top
    ctx.bezierCurveTo(-p.s * .7, -p.s * .8, -p.s * .9, p.s * .4, 0, p.s);
    ctx.fill();
    ctx.restore();
  }
  function frame() {
    ctx.clearRect(0, 0, W, H);
    for (const p of petals) {
      p.sway += .012;
      p.x += p.vx + Math.sin(p.sway) * .6;
      p.y += p.vy;
      p.rot += p.vr;
      p.flip += p.vf;
      if (p.y > H + 20 || p.x < -30 || p.x > W + 30) Object.assign(p, makePetal(false));
      drawPetal(p);
    }
    raf = requestAnimationFrame(frame);
  }
  function setPetals(on) {
    petalsOn = on;
    store.set("alykraft-petals", on ? "on" : "off");
    toggles.forEach((b) => { b.querySelector("b").textContent = on ? "On" : "Off"; });
    cancelAnimationFrame(raf);
    raf = null;
    if (on && !document.hidden) frame(); else ctx.clearRect(0, 0, W, H);
  }
  toggles.forEach((b) => b.addEventListener("click", () => setPetals(!petalsOn)));
  window.addEventListener("resize", resize);
  document.addEventListener("visibilitychange", () => setPetals(petalsOn)); // pause when the tab is hidden
  resize();
  setPetals(petalsOn);

  /* ---------------- Background song ---------------- */
  // Browsers block sound until the visitor interacts, so try right away and
  // otherwise start on the first tap, click, key press or scroll.
  const song = $("#bgSong"), musicBtn = $("#musicBtn");
  song.volume = 0.5;
  let userMuted = store.get("alykraft-music") === "off";
  function syncMusicBtn() {
    const on = !song.paused;
    musicBtn.classList.toggle("playing", on);
    musicBtn.setAttribute("aria-pressed", String(on));
    musicBtn.setAttribute("aria-label", on ? "Pause music" : "Play music");
  }
  song.addEventListener("play", syncMusicBtn);
  song.addEventListener("pause", syncMusicBtn);
  const START_EVENTS = ["pointerdown", "keydown", "touchstart", "wheel"];
  function startOnInteraction(e) {
    if (e && e.target.closest && e.target.closest("#musicBtn")) return; // the button handles itself
    START_EVENTS.forEach((ev) => window.removeEventListener(ev, startOnInteraction));
    if (!userMuted) song.play().catch(() => {});
  }
  if (!userMuted) {
    song.play().catch(() => START_EVENTS.forEach((ev) => window.addEventListener(ev, startOnInteraction, { passive: true })));
  }
  musicBtn.addEventListener("click", () => {
    if (song.paused) { userMuted = false; song.play().catch(() => {}); }
    else { userMuted = true; song.pause(); }
    store.set("alykraft-music", userMuted ? "off" : "on");
  });
  // Pause the song while a video plays with sound, then resume it
  vPlayer.addEventListener("play", () => { if (!song.paused) { song.pause(); song.dataset.resume = "1"; } });
  vPlayer.addEventListener("pause", () => { if (song.dataset.resume && !userMuted) { delete song.dataset.resume; song.play().catch(() => {}); } });

  /* ---------------- Go ---------------- */
  renderGrid();
  observeReveal();
})();
