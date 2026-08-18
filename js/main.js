/* ======================================================================
   MAIN.JS — site behavior. You shouldn't need to edit this file to
   change content — see content.js for all the editable text/data.
   ====================================================================== */

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------------------------------------------------------------------
   Helpers: HTML escaping + placeholder photo generator
   --------------------------------------------------------------------- */
function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
}
function escapeXml(str) {
  return String(str).replace(/[&<>]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[ch]));
}

const PLACEHOLDER_PAIRS = [
  ["#F3DCDD", "#E4D2A8"], ["#E7C3C6", "#F6EBE0"], ["#F6EBE0", "#E7C3C6"],
  ["#E4D2A8", "#F3DCDD"], ["#EAD9CE", "#E7C3C6"], ["#F0DCC9", "#EBD0D3"],
];
function makePlaceholder(seed, label) {
  const s = String(seed || "photo");
  let hash = 0;
  for (let i = 0; i < s.length; i++) hash = (hash * 31 + s.charCodeAt(i)) >>> 0;
  const [c1, c2] = PLACEHOLDER_PAIRS[hash % PLACEHOLDER_PAIRS.length];
  const safeLabel = escapeXml(label || "Add your photo");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs>
<rect width="800" height="600" fill="url(#g)"/>
<circle cx="400" cy="250" r="44" fill="rgba(107,31,43,0.16)"/>
<text x="400" y="266" font-family="Georgia, serif" font-size="42" fill="#6B1F2B" text-anchor="middle">&#10084;</text>
<text x="400" y="340" font-family="Georgia, serif" font-size="21" fill="#6B1F2B" text-anchor="middle" opacity="0.72">${safeLabel}</text>
</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/* ---------------------------------------------------------------------
   Ambient floating petals / hearts
   --------------------------------------------------------------------- */
function initPetals() {
  if (prefersReducedMotion) return;
  const wrap = $("#petals-bg");
  const symbols = ["❤", "❀", "✿"];
  const count = window.innerWidth < 640 ? 7 : 12;
  for (let i = 0; i < count; i++) {
    const el = document.createElement("span");
    el.className = "petal";
    el.textContent = symbols[i % symbols.length];
    el.style.left = Math.random() * 100 + "vw";
    el.style.fontSize = 12 + Math.random() * 14 + "px";
    el.style.animationDuration = 18 + Math.random() * 14 + "s";
    el.style.animationDelay = Math.random() * -25 + "s";
    wrap.appendChild(el);
  }
}

/* ---------------------------------------------------------------------
   Shared scroll-reveal
   --------------------------------------------------------------------- */
let revealObserver;
function initRevealObserver() {
  revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );
  $$(".reveal, #reasons-grid .reason-card, .gallery-item, .future-stage").forEach((el) => revealObserver.observe(el));
}

/* ---------------------------------------------------------------------
   ntfy.sh — push notifications to https://ntfy.sh/coupleday
   --------------------------------------------------------------------- */
const NTFY_TOPIC = "coupleday";
const NTFY_URL   = `https://ntfy.sh/${NTFY_TOPIC}`;

function sendNtfy({ title, message, tags = [], priority = 3 }) {
  fetch(NTFY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      topic:    NTFY_TOPIC,
      title:    title,
      message:  message,
      tags:     tags,
      priority: priority,
    }),
  }).catch(() => { /* silent fail — never break the experience */ });
}

/* ---------------------------------------------------------------------
   Landing / cover transition
   --------------------------------------------------------------------- */
function initLanding() {
  document.body.classList.add("locked");
  $("#open-story-btn").addEventListener("click", openStory);
}
function openStory() {
  $("#landing").classList.add("is-open");
  document.body.classList.remove("locked");
  $("#music-toggle").classList.remove("is-hidden");
  $("#side-nav").classList.remove("is-hidden");

  sendNtfy({
    title:   "💕 She opened Our Story!",
    message: "She's reading your story right now ❤️",
    tags:    ["heart", "couple"],
    priority: 4,
  });
}
function initRestart() {
  $("#restart-btn").addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
    const delay = prefersReducedMotion ? 50 : 900;
    setTimeout(() => {
      $("#landing").classList.remove("is-open");
      document.body.classList.add("locked");
    }, delay);
  });
}

/* ---------------------------------------------------------------------
   Side navigation
   --------------------------------------------------------------------- */
function initSideNav() {
  const links = $$("#side-nav a");
  links.forEach((a) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      const target = $(a.getAttribute("href"));
      target?.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
    });
  });
  const sections = links.map((a) => document.querySelector(a.getAttribute("href"))).filter(Boolean);
  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = "#" + entry.target.id;
          links.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === id));
        }
      });
    },
    { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
  );
  sections.forEach((s) => obs.observe(s));
}

/* ---------------------------------------------------------------------
   SECTION 1 — Timeline
   --------------------------------------------------------------------- */
function renderTimeline() {
  const wrap = $("#timeline-container");
  if (!wrap) return;
  timelineData.forEach((item, i) => {

    const el = document.createElement("div");
    el.className = "timeline-item";

    const node = document.createElement("div");
    node.className = "timeline-node";

    const card = document.createElement("div");
    card.className = "timeline-card reveal";
    card.innerHTML = `<span class="timeline-date">${escapeHtml(item.date || "")}</span><h3>${escapeHtml(item.label || "")}</h3><p>${escapeHtml(item.story || "")}</p>`;

    const photoWrap = document.createElement("div");
    photoWrap.className = "timeline-photo photo-frame reveal";
    const img = document.createElement("img");
    img.loading = "lazy";
    img.src = item.img || makePlaceholder(item.label || "t" + i, "Add a photo");
    img.alt = item.label || "A memory of us";
    photoWrap.appendChild(img);

    el.append(node, card, photoWrap);
    wrap.appendChild(el);
  });
}

/* ---------------------------------------------------------------------
   SECTION 2 — Reasons
   --------------------------------------------------------------------- */
function reasonCardEl(r, i) {
  const el = document.createElement("div");
  el.className = "reason-card";
  el.style.transitionDelay = `${(i % 4) * 80}ms`;
  el.innerHTML = `<div class="reason-icon">${r.icon || "❤"}</div><h3>${escapeHtml(r.title)}</h3><p>${escapeHtml(r.text)}</p>`;
  return el;
}
function renderReasons() {
  const grid = $("#reasons-grid");
  const extra = $("#reasons-grid-extra");
  if (!grid || !extra) return;
  reasonsData.core.forEach((r, i) => grid.appendChild(reasonCardEl(r, i)));
  reasonsData.more.forEach((r, i) => extra.appendChild(reasonCardEl(r, i)));

  const btn = $("#reveal-more-reasons");
  btn.addEventListener("click", () => {
    const expanded = extra.classList.toggle("expanded");
    if (expanded) {
      $$(".reason-card", extra).forEach((el) => el.classList.add("in-view"));
      btn.textContent = "...and I'm still not done ❤️";
    } else {
      btn.textContent = "There are actually too many to list...";
    }
  });
}

/* ---------------------------------------------------------------------
   SECTION 3 — Gallery + Lightbox
   --------------------------------------------------------------------- */
function galleryItemEl(item, i) {
  const el = document.createElement("figure");
  el.className = "gallery-item";
  el.dataset.category = item.category;
  el.style.transitionDelay = `${(i % 6) * 60}ms`;
  el.tabIndex = 0;
  el.setAttribute("role", "button");
  el.setAttribute("aria-label", `View photo: ${item.caption || "a memory of us"}`);

  const img = document.createElement("img");
  img.loading = "lazy";
  img.src = item.img || makePlaceholder(item.caption || "g" + i, "Add a photo");
  img.alt = item.caption || "A memory of us";
  el.appendChild(img);

  const cap = document.createElement("figcaption");
  cap.className = "gallery-caption";
  const meta = [item.date, item.location].filter(Boolean).join(" · ");
  cap.innerHTML = `<strong>${escapeHtml(item.caption || "")}</strong>${escapeHtml(meta)}`;
  el.appendChild(cap);

  const open = (e) => {
    openLightbox(item, img.src);
    const x = e.clientX || el.getBoundingClientRect().left + 20;
    const y = e.clientY || el.getBoundingClientRect().top + 20;
    spawnHeart(x, y);
  };
  el.addEventListener("click", open);
  el.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      open(e);
    }
  });
  return el;
}
function renderGallery() {
  const filtersWrap = $("#gallery-filters");
  const grid = $("#gallery-grid");
  if (!filtersWrap || !grid) return;
  galleryCategories.forEach((cat) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "gallery-filter-btn" + (cat.key === "all" ? " active" : "");
    btn.textContent = cat.label;
    btn.dataset.filter = cat.key;
    btn.addEventListener("click", () => setGalleryFilter(cat.key));
    filtersWrap.appendChild(btn);
  });
  galleryData.forEach((item, i) => grid.appendChild(galleryItemEl(item, i)));
}
function setGalleryFilter(key) {
  $$(".gallery-filter-btn").forEach((b) => b.classList.toggle("active", b.dataset.filter === key));
  $$(".gallery-item").forEach((el) => {
    const show = key === "all" || el.dataset.category === key;
    el.classList.toggle("filtered-out", !show);
  });
}

let lastFocusedEl = null;
function openLightbox(item, src) {
  const lb = $("#lightbox");
  $("#lightbox-img").src = src;
  $("#lightbox-img").alt = item.caption || "";
  const meta = [item.date, item.location].filter(Boolean).join(" · ");
  $("#lightbox-caption").textContent = [item.caption, meta].filter(Boolean).join(" — ");
  lastFocusedEl = document.activeElement;
  lb.hidden = false;
  requestAnimationFrame(() => lb.classList.add("is-open"));
  document.body.classList.add("locked");
  $("#lightbox-close").focus();
}
function closeLightbox() {
  const lb = $("#lightbox");
  lb.classList.remove("is-open");
  document.body.classList.remove("locked");
  setTimeout(() => (lb.hidden = true), 350);
  lastFocusedEl?.focus();
}
function initLightbox() {
  $("#lightbox-close").addEventListener("click", closeLightbox);
  $("#lightbox").addEventListener("click", (e) => {
    if (e.target.id === "lightbox") closeLightbox();
  });
}

function spawnHeart(x, y) {
  if (prefersReducedMotion) return;
  const el = document.createElement("div");
  el.className = "floating-heart";
  el.style.left = x + "px";
  el.style.top = y + "px";
  el.textContent = "❤";
  document.body.appendChild(el);
  el.addEventListener("animationend", () => el.remove());
}

/* ---------------------------------------------------------------------
   SECTION 4 — Countdown + Itinerary
   --------------------------------------------------------------------- */
function startCountdown() {
  const cdDays  = $("#cd-days");
  const cdHours = $("#cd-hours");
  const cdMins  = $("#cd-mins");
  const cdSecs  = $("#cd-secs");
  if (!cdDays || !cdHours || !cdMins || !cdSecs) return;

  const target = new Date(siteConfig.escapeStartDate).getTime();
  const labelEls = $$("#countdown .countdown-label");
  const arrivalLabel = labelEls[labelEls.length - 1];
  const originalLabel = arrivalLabel ? arrivalLabel.textContent : "";

  function tick() {
    let diff = target - Date.now();
    if (diff <= 0) {
      cdDays.textContent = cdHours.textContent = cdMins.textContent = cdSecs.textContent = "00";
      if (arrivalLabel) arrivalLabel.textContent = siteConfig.escapeArrivedMessage;
      return false;
    }
    if (arrivalLabel) arrivalLabel.textContent = originalLabel;
    const d = Math.floor(diff / 86400000); diff -= d * 86400000;
    const h = Math.floor(diff / 3600000);  diff -= h * 3600000;
    const m = Math.floor(diff / 60000);    diff -= m * 60000;
    const s = Math.floor(diff / 1000);
    cdDays.textContent  = String(d).padStart(2, "0");
    cdHours.textContent = String(h).padStart(2, "0");
    cdMins.textContent  = String(m).padStart(2, "0");
    cdSecs.textContent  = String(s).padStart(2, "0");
    return true;
  }
  tick();
  const interval = setInterval(() => {
    if (!tick()) clearInterval(interval);
  }, 1000);
}

function blockIcon(name) {
  const map = { Morning: "☀", Afternoon: "⛅", Evening: "🌇", Night: "🌙" };
  return `<span aria-hidden="true">${map[name] || "✦"}</span>`;
}
function activityCardEl(a) {
  const el = document.createElement("div");
  el.className = "activity-card";

  const timeEl = document.createElement("div");
  timeEl.className = "activity-time";
  timeEl.textContent = a.time || "";

  const bodyEl = document.createElement("div");
  const nameEl = document.createElement("div");
  nameEl.className = "activity-activity";
  nameEl.textContent = a.activity || "";
  bodyEl.appendChild(nameEl);

  if (a.location) {
    const locEl = document.createElement("div");
    locEl.className = "activity-location";
    locEl.textContent = a.location;
    bodyEl.appendChild(locEl);
  }
  if (a.description) {
    const descEl = document.createElement("div");
    descEl.className = "activity-desc";
    descEl.textContent = a.description;
    bodyEl.appendChild(descEl);
  }
  if (a.img) {
    const photoWrap = document.createElement("div");
    photoWrap.className = "activity-photo photo-frame";
    const img = document.createElement("img");
    img.loading = "lazy";
    img.src = a.img;
    img.alt = a.activity || "";
    photoWrap.appendChild(img);
    bodyEl.appendChild(photoWrap);
  }
  el.append(timeEl, bodyEl);
  return el;
}
function renderItinerary() {
  const tabsWrap = $("#itinerary-tabs");
  const content = $("#itinerary-content");
  if (!tabsWrap || !content) return;
  itineraryData.forEach((day, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "itinerary-tab-btn" + (i === 0 ? " active" : "");
    btn.textContent = `${day.label} · ${day.dateLabel}`;
    btn.dataset.day = day.id;
    btn.addEventListener("click", () => showItineraryDay(day.id));
    tabsWrap.appendChild(btn);
  });
  itineraryData.forEach((day, i) => {
    const dayEl = document.createElement("div");
    dayEl.className = "itinerary-day";
    dayEl.dataset.day = day.id;
    dayEl.hidden = i !== 0;
    Object.entries(day.blocks).forEach(([blockName, activities]) => {
      const blockEl = document.createElement("div");
      blockEl.className = "itinerary-block";
      blockEl.innerHTML = `<div class="itinerary-block-title">${blockIcon(blockName)} ${escapeHtml(blockName)}</div>`;
      const activitiesWrap = document.createElement("div");
      activitiesWrap.className = "itinerary-activities";
      activities.forEach((a) => activitiesWrap.appendChild(activityCardEl(a)));
      blockEl.appendChild(activitiesWrap);
      dayEl.appendChild(blockEl);
    });
    content.appendChild(dayEl);
  });
}
function showItineraryDay(dayId) {
  $$(".itinerary-tab-btn").forEach((b) => b.classList.toggle("active", b.dataset.day === dayId));
  $$(".itinerary-day").forEach((d) => (d.hidden = d.dataset.day !== dayId));
}

/* ---------------------------------------------------------------------
   SECTION 5 — Bucket list (persisted in localStorage)
   --------------------------------------------------------------------- */
const BUCKET_KEY = "ourStory.bucketList.v1";
function loadBucketState() {
  try {
    const raw = localStorage.getItem(BUCKET_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return bucketListDefaults.map((item) => ({ ...item, checked: false }));
}
function saveBucketState() {
  try {
    localStorage.setItem(BUCKET_KEY, JSON.stringify(bucketState));
  } catch (e) {}
}
let bucketState = loadBucketState();

function bucketItemEl(item) {
  const li = document.createElement("li");
  li.className = "bucket-item" + (item.checked ? " checked" : "");
  li.dataset.id = item.id;

  const check = document.createElement("button");
  check.type = "button";
  check.className = "bucket-check";
  check.setAttribute("aria-pressed", String(!!item.checked));
  check.setAttribute("aria-label", "Mark as done");
  check.textContent = "✓";
  check.addEventListener("click", () => toggleBucketItem(item.id));

  const text = document.createElement("span");
  text.className = "bucket-text";
  text.textContent = item.text;
  text.contentEditable = "true";
  text.spellcheck = false;
  text.addEventListener("blur", () => {
    const val = text.textContent.trim();
    if (val) {
      item.text = val;
      saveBucketState();
    } else {
      text.textContent = item.text;
    }
  });
  text.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      text.blur();
    }
  });

  const heart = document.createElement("span");
  heart.className = "bucket-heart";
  heart.textContent = "❤";
  heart.setAttribute("aria-hidden", "true");

  const remove = document.createElement("button");
  remove.type = "button";
  remove.className = "bucket-remove";
  remove.setAttribute("aria-label", "Remove item");
  remove.textContent = "×";
  remove.addEventListener("click", () => removeBucketItem(item.id));

  li.append(check, text, heart, remove);
  return li;
}
function renderBucketList() {
  const container = $("#bucket-list-container");
  container.innerHTML = "";
  bucketState.forEach((item) => container.appendChild(bucketItemEl(item)));
}
function toggleBucketItem(id) {
  const item = bucketState.find((b) => b.id === id);
  if (!item) return;
  item.checked = !item.checked;
  saveBucketState();
  const li = $(`.bucket-item[data-id="${id}"]`);
  if (!li) return;
  li.classList.toggle("checked", item.checked);
  li.querySelector(".bucket-check").setAttribute("aria-pressed", String(item.checked));
  if (item.checked) {
    const rect = li.getBoundingClientRect();
    spawnHeart(rect.left + 30, rect.top + rect.height / 2);
    burstConfetti(rect.left + 30, rect.top + rect.height / 2, 14, false);
  }
}
function removeBucketItem(id) {
  bucketState = bucketState.filter((b) => b.id !== id);
  saveBucketState();
  renderBucketList();
}
function addBucketItem(text) {
  bucketState.push({ id: "b" + Date.now(), text, checked: false });
  saveBucketState();
  renderBucketList();

  sendNtfy({
    title:   "📝 She added to our bucket list!",
    message: `"${text}" — she wants to do this with you 🥰`,
    tags:    ["memo", "heart"],
    priority: 3,
  });
}
function initBucketForm() {
  $("#bucket-add-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const input = $("#bucket-add-input");
    const val = input.value.trim();
    if (!val) return;
    addBucketItem(val);
    input.value = "";
    input.focus();
  });
}

/* ---------------------------------------------------------------------
   SECTION 6 — Open When... envelopes
   --------------------------------------------------------------------- */
function renderEnvelopes() {
  const grid = $("#envelopes-grid");
  envelopesData.forEach((env, i) => {
    const el = document.createElement("div");
    el.className = "envelope reveal";
    el.style.transitionDelay = `${(i % 3) * 90}ms`;
    el.tabIndex = 0;
    el.setAttribute("role", "button");
    el.setAttribute("aria-label", `Open: ${env.title}`);
    el.innerHTML = `<div class="envelope-body"><div><div class="envelope-seal" aria-hidden="true">❤</div><div class="envelope-title">${escapeHtml(env.title)}</div></div></div>`;
    el.addEventListener("click", () => openEnvelope(env));
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openEnvelope(env);
      }
    });
    grid.appendChild(el);
  });
}
function openEnvelope(env) {
  $("#envelope-modal-title").textContent = env.title;
  const body = $("#envelope-modal-body");
  body.innerHTML = "";
  env.message.forEach((p) => {
    const para = document.createElement("p");
    para.textContent = p;
    body.appendChild(para);
  });
  lastFocusedEl = document.activeElement;
  $("#envelope-modal").hidden = false;
  document.body.classList.add("locked");
  $("#envelope-modal-close").focus();

  sendNtfy({
    title:   "💌 She opened an envelope!",
    message: `"${env.title}" — she needed you right now 🥺`,
    tags:    ["envelope", "heart"],
    priority: 3,
  });
}
function closeEnvelope() {
  $("#envelope-modal").hidden = true;
  document.body.classList.remove("locked");
  lastFocusedEl?.focus();
}
function initEnvelopeModal() {
  $("#envelope-modal-close").addEventListener("click", closeEnvelope);
  $("#envelope-modal-backdrop").addEventListener("click", closeEnvelope);
}

/* ---------------------------------------------------------------------
   SECTION 7 — Letter: typewriter for the key lines
   --------------------------------------------------------------------- */
function typeLine(el) {
  const full = el.dataset.fulltext || "";
  if (prefersReducedMotion) {
    el.textContent = full;
    return;
  }
  let i = 0;
  el.textContent = "";
  const cursor = document.createElement("span");
  cursor.className = "type-cursor";
  function step() {
    i++;
    el.textContent = full.slice(0, i);
    el.appendChild(cursor);
    if (i < full.length) {
      setTimeout(step, 32);
    } else {
      setTimeout(() => cursor.remove(), 900);
    }
  }
  step();
}
function initTypeLines() {
  const els = $$(".type-line");
  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          typeLine(entry.target);
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.6 }
  );
  els.forEach((el) => {
    el.dataset.fulltext = el.dataset.typeline || el.textContent;
    el.textContent = "";
    obs.observe(el);
  });
}

/* ---------------------------------------------------------------------
   SECTION 8 — Our Future journey
   --------------------------------------------------------------------- */
const FUTURE_ICONS = {
  rings: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="9" cy="14" r="6"/><circle cx="16" cy="10" r="6"/></svg>',
  home: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/></svg>',
  compass: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="9"/><path d="M15 9l-2 6-6 2 2-6 6-2z"/></svg>',
  family: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.4"/><path d="M3 21v-2a5 5 0 0 1 5-5h1a5 5 0 0 1 5 5v2"/><path d="M15 21v-1.5a4 4 0 0 1 4-4h.5"/></svg>',
  infinity: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M6 12c0-2.2 1.8-4 4-4 2.7 0 3.3 4 6 4 2.2 0 4-1.8 4-4"/><path d="M6 12c0 2.2 1.8 4 4 4 2.7 0 3.3-4 6-4 2.2 0 4 1.8 4 4"/></svg>',
};
function renderFuture() {
  const wrap = $("#future-journey");
  futureData.forEach((f, i) => {
    const el = document.createElement("div");
    el.className = "future-stage";
    el.style.setProperty("--i", i);
    el.innerHTML = `<div class="future-icon">${FUTURE_ICONS[f.icon] || "❤"}</div><h3>${escapeHtml(f.stage)}</h3><p>${escapeHtml(f.text)}</p>`;
    wrap.appendChild(el);
  });
}

/* ---------------------------------------------------------------------
   SECTION 9 — Surprise finale
   --------------------------------------------------------------------- */
let surpriseTimers = [];
function clearSurpriseTimers() {
  surpriseTimers.forEach((t) => clearTimeout(t));
  surpriseTimers = [];
}
function runSurprise() {
  const overlay = $("#surprise-overlay");
  const lines = $$(".surprise-line");
  lines.forEach((l) => l.classList.remove("show"));
  clearSurpriseTimers();
  overlay.hidden = false;
  requestAnimationFrame(() => overlay.classList.add("is-open"));
  document.body.classList.add("locked");

  sendNtfy({
    title:   "🎉 She hit the Surprise!",
    message: "She triggered the surprise finale — she's smiling right now 💕",
    tags:    ["tada", "sparkling_heart"],
    priority: 5,
  });
  const delay = prefersReducedMotion ? 0 : 1700;
  lines.forEach((line, i) => {
    surpriseTimers.push(
      setTimeout(() => {
        lines.forEach((l) => l.classList.remove("show"));
        line.classList.add("show");
        if (i === lines.length - 1) {
          burstHeartCenter();
          burstConfetti(window.innerWidth / 2, window.innerHeight * 0.4, 46, true);
        }
      }, i * delay)
    );
  });
}
function closeSurprise() {
  const overlay = $("#surprise-overlay");
  overlay.classList.remove("is-open");
  document.body.classList.remove("locked");
  clearSurpriseTimers();
  setTimeout(() => (overlay.hidden = true), 500);
}
function burstHeartCenter() {
  if (prefersReducedMotion) return;
  const el = $("#surprise-heart");
  el.style.left = "50%";
  el.style.top = "38%";
  el.classList.remove("burst");
  void el.offsetWidth;
  el.classList.add("burst");
}
function initSurprise() {
  $("#surprise-btn").addEventListener("click", runSurprise);
  $("#surprise-close").addEventListener("click", closeSurprise);
  $("#surprise-overlay").addEventListener("click", (e) => {
    if (e.target.id === "surprise-overlay") closeSurprise();
  });
}

/* ---------------------------------------------------------------------
   Confetti / petal burst (canvas)
   --------------------------------------------------------------------- */
let activeConfetti = [];
let confettiRAF = null;
function resizeConfettiCanvas() {
  const canvas = $("#confetti-canvas");
  if (!canvas) return;
  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  canvas.getContext("2d").setTransform(dpr, 0, 0, dpr, 0, 0);
}
function heartPath(ctx, size) {
  const s = size;
  ctx.beginPath();
  ctx.moveTo(0, s * 0.3);
  ctx.bezierCurveTo(0, -s * 0.3, -s, -s * 0.3, -s, s * 0.1);
  ctx.bezierCurveTo(-s, s * 0.6, 0, s * 0.8, 0, s * 1.2);
  ctx.bezierCurveTo(0, s * 0.8, s, s * 0.6, s, s * 0.1);
  ctx.bezierCurveTo(s, -s * 0.3, 0, -s * 0.3, 0, s * 0.3);
  ctx.closePath();
}
function confettiLoop() {
  const canvas = $("#confetti-canvas");
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  activeConfetti.forEach((p) => {
    p.life++;
    p.vy += 0.12;
    p.x += p.vx;
    p.y += p.vy;
    p.rot += p.vr;
    const alpha = Math.max(0, 1 - p.life / p.maxLife);
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;
    heartPath(ctx, p.size);
    ctx.fill();
    ctx.restore();
  });
  activeConfetti = activeConfetti.filter((p) => p.life < p.maxLife);
  if (activeConfetti.length > 0) {
    confettiRAF = requestAnimationFrame(confettiLoop);
  } else {
    confettiRAF = null;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}
function burstConfetti(x, y, count, big) {
  if (prefersReducedMotion) return;
  const colors = ["#B5636F", "#C6A15B", "#E7C3C6", "#6B1F2B"];
  for (let i = 0; i < count; i++) {
    activeConfetti.push({
      x, y,
      vx: (Math.random() - 0.5) * (big ? 9 : 5),
      vy: (Math.random() * -1 - 1) * (big ? 7 : 4),
      size: Math.random() * 5 + 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.3,
      life: 0,
      maxLife: 60 + Math.random() * 30,
    });
  }
  if (!confettiRAF) confettiRAF = requestAnimationFrame(confettiLoop);
}

/* ---------------------------------------------------------------------
   Music — prefers a real song file, falls back to a soft generated pad
   --------------------------------------------------------------------- */
let audioCtx = null;
let ambientNodes = null;
let realAudio = null;
let usingRealAudio = false;
let isPlaying = false;

function startAmbient() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === "suspended") audioCtx.resume();

  const master = audioCtx.createGain();
  master.gain.value = 0;
  const filter = audioCtx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 900;
  master.connect(filter);
  filter.connect(audioCtx.destination);
  master.gain.linearRampToValueAtTime(0.05, audioCtx.currentTime + 2);

  const freqs = [196.0, 246.94, 293.66, 392.0]; // soft G major pad
  const oscs = freqs.map((f, i) => {
    const osc = audioCtx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = f;
    const g = audioCtx.createGain();
    g.gain.value = 0.5;
    const lfo = audioCtx.createOscillator();
    lfo.frequency.value = 0.05 + i * 0.015;
    const lfoGain = audioCtx.createGain();
    lfoGain.gain.value = 0.15;
    lfo.connect(lfoGain);
    lfoGain.connect(g.gain);
    osc.connect(g);
    g.connect(master);
    osc.start();
    lfo.start();
    return { osc, lfo };
  });
  ambientNodes = { master, oscs };
}
function stopAmbient() {
  if (!ambientNodes || !audioCtx) return;
  const { master, oscs } = ambientNodes;
  const now = audioCtx.currentTime;
  master.gain.cancelScheduledValues(now);
  master.gain.setValueAtTime(master.gain.value, now);
  master.gain.linearRampToValueAtTime(0, now + 1);
  setTimeout(() => {
    oscs.forEach(({ osc, lfo }) => {
      try {
        osc.stop();
        lfo.stop();
      } catch (e) {}
    });
  }, 1100);
  ambientNodes = null;
}
function setMusicButtonState(playing) {
  const btn = $("#music-toggle");
  btn.classList.toggle("is-playing", playing);
  btn.setAttribute("aria-pressed", String(playing));
  btn.setAttribute("aria-label", playing ? "Pause our song" : "Play our song");
}
function startMusic() {
  if (!realAudio) {
    // Drop a real file at assets/audio/our-song.mp3 to replace the placeholder ambience below.
    realAudio = new Audio("assets/audio/our-song.mp3");
    realAudio.loop = true;
    realAudio.volume = 0.55;
  }
  realAudio
    .play()
    .then(() => {
      usingRealAudio = true;
      isPlaying = true;
      setMusicButtonState(true);
    })
    .catch(() => {
      usingRealAudio = false;
      startAmbient();
      isPlaying = true;
      setMusicButtonState(true);
    });
}
function stopMusic() {
  if (usingRealAudio && realAudio) realAudio.pause();
  stopAmbient();
  isPlaying = false;
  setMusicButtonState(false);
}
function initMusic() {
  $("#music-toggle").addEventListener("click", () => (isPlaying ? stopMusic() : startMusic()));
}

/* ---------------------------------------------------------------------
   Global escape-to-close
   --------------------------------------------------------------------- */
function initGlobalKeys() {
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if ($("#lightbox").classList.contains("is-open")) closeLightbox();
    if (!$("#envelope-modal").hidden) closeEnvelope();
    if ($("#surprise-overlay").classList.contains("is-open")) closeSurprise();
  });
}

/* ---------------------------------------------------------------------
   Init
   --------------------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  const run = (fn, name) => { try { fn(); } catch(e) { console.warn("Init error in " + name + ":", e.message); } };
  run(initPetals,          "initPetals");
  run(renderTimeline,      "renderTimeline");
  run(renderReasons,       "renderReasons");
  run(renderGallery,       "renderGallery");
  run(startCountdown,      "startCountdown");
  run(renderItinerary,     "renderItinerary");
  run(renderBucketList,    "renderBucketList");
  run(renderEnvelopes,     "renderEnvelopes");
  run(renderFuture,        "renderFuture");
  run(initTypeLines,       "initTypeLines");
  run(initRevealObserver,  "initRevealObserver");
  run(initSideNav,         "initSideNav");
  run(initLanding,         "initLanding");
  run(initLightbox,        "initLightbox");
  run(initEnvelopeModal,   "initEnvelopeModal");
  run(initSurprise,        "initSurprise");
  run(initMusic,           "initMusic");
  run(initRestart,         "initRestart");
  run(initBucketForm,      "initBucketForm");
  run(initGlobalKeys,      "initGlobalKeys");
  run(resizeConfettiCanvas,"resizeConfettiCanvas");
  window.addEventListener("resize", resizeConfettiCanvas);
});

