/* LALIGURANS USER PANEL v3 - real icons, product modal, image fix */
const firebaseConfig = {
  apiKey: "AIzaSyAopefoW6m7RYV_HkN1rzHqMsN4tN0HJ8I",
  authDomain: "laligurans-photo-studio.firebaseapp.com",
  projectId: "laligurans-photo-studio",
  storageBucket: "laligurans-photo-studio.firebasestorage.app",
  messagingSenderId: "826817572339",
  appId: "1:826817572339:web:8d2d2c8831c7a511b7f686"
};
// IMPORTANT: image/API admin project को domain (यहीँबाट /api/img serve हुन्छ)
const API_BASE = "https://laligurans-admin.pages.dev";
const CUR = "रु.";
const DEFAULT_TAG = "सम्झनाको लागी फोटो, फोटोको लागी गुराँस";
const DAYS = [["sunday","Sunday"],["monday","Monday"],["tuesday","Tuesday"],["wednesday","Wednesday"],["thursday","Thursday"],["friday","Friday"],["saturday","Saturday"]];
const CAM_SVG = `<svg class="ic" viewBox="0 0 24 24"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>`;
const HEART_SVG = `<svg class="ic" viewBox="0 0 24 24"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>`;
const state = { store: null, categories: [], products: [], sizes: [], gallery: [], announcements: [], hours: null, catFilter: "all", search: "", favs: [], mapQ: "" };
let db = null;

function $(id) { return document.getElementById(id); }
function esc(v) { return String(v ?? "").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;"); }
function safeUrl(v) { const s = String(v||"").trim(); if (!s) return ""; try { const u = new URL(s); return ["https:","http:"].includes(u.protocol) ? s : ""; } catch { return ""; } }
function imgUrl(v) { if (!v) return ""; const s = String(v); if (s.startsWith("http")) return s; if (s.startsWith("/api/")) return API_BASE + s; return ""; }
function fmtMoney(n) { return `${CUR} ${Number(n||0).toLocaleString()}`; }
function debounce(fn, ms) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; }
function storeName() { return (state.store && state.store.name) || "Laligurans Photo Studio"; }

function applyTheme(t) { document.body.classList.toggle("light", t === "light"); $("iconSun").hidden = t === "light"; $("iconMoon").hidden = t !== "light"; localStorage.setItem("lgs_theme", t); }

function loadFavs() { try { state.favs = JSON.parse(localStorage.getItem("lgs_favs") || "[]"); } catch { state.favs = []; } }
function saveFavs() { localStorage.setItem("lgs_favs", JSON.stringify(state.favs)); }
function toggleFav(id) { state.favs = state.favs.includes(id) ? state.favs.filter(x => x !== id) : [...state.favs, id]; saveFavs(); renderProducts(); renderFavs(); }
function renderFavs() { const items = state.products.filter(p => state.favs.includes(p.id)); $("favList").innerHTML = items.length ? items.map(p => `<button class="d-cat" data-favgo="${p.id}">♥ ${esc(p.name)} · ${fmtMoney(p.price)}</button>`).join("") : `<p class="muted">कुनै favorite छैन। Product को ♥ थिच्नुहोस्।</p>`; }

function waNumber() { let d = ((state.store && state.store.phone) || "").replace(/\D/g,""); if (!d) return ""; if (!d.startsWith("977") && d.length === 10 && d.startsWith("9")) d = "977" + d; return d; }
function waHref(msg) { const n = waNumber(); return n ? "https://wa.me/" + n + "?text=" + encodeURIComponent(msg) : ""; }
function generalWa() { return waHref(`Namaste ${storeName()}! 🌺 I would like to know more about your services.`); }
function productWa(p) {
  const img = imgUrl(p.imageUrl);
  let msg = `Namaste ${storeName()}! 🌺\nI want to order: ${p.name}\nPrice: ${fmtMoney(p.price)}`;
  if ((p.sizeIds||[]).length) { msg += "\nSizes:"; p.sizeIds.forEach(id => { const s = state.sizes.find(x => x.id === id); const pr = p.sizePrices && p.sizePrices[id]; msg += `\n- ${s ? s.name : ""}${s && s.dimensions ? " (" + s.dimensions + ")" : ""}${pr != null ? " — " + fmtMoney(pr) : ""}`; }); }
  if (img) msg += `\nImage: ${img}`;
  return waHref(msg);
}

function ktNow() { const parts = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Kathmandu", weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(new Date()); const g = t => parts.find(p => p.type === t).value; return { day: g("weekday").toLowerCase(), hour: parseInt(g("hour"),10)%24, min: (parseInt(g("hour"),10)%24)*60 + parseInt(g("minute"),10) }; }
function toMin(v) { if (!v) return 0; const [h,m] = String(v).split(":").map(Number); return (h||0)*60+(m||0); }
function bizStatus() {
  const d = state.hours;
  if (!d) return { open: null, text: "" };
  if (d.override && d.override.enabled) return { open: d.override.status === "open", text: d.override.status === "open" ? "Open" : "Closed" };
  const now = ktNow(), days = d.days || {}, today = days[now.day];
  if (today && today.open) { if (now.min >= toMin(today.opens) && now.min < toMin(today.closes)) return { open: true, text: "Open now · closes " + today.closes }; if (now.min < toMin(today.opens)) return { open: false, text: "Closed · opens today " + today.opens }; }
  const order = DAYS.map(x => x[0]), idx = order.indexOf(now.day);
  for (let i=1;i<=7;i++){ const k = order[(idx+i)%7]; if (days[k] && days[k].open) return { open: false, text: "Closed · opens " + DAYS.find(x=>x[0]===k)[1] + " " + days[k].opens }; }
  return { open: false, text: "Closed" };
}
function refreshBadge() { const s = bizStatus(); $("hoursStatus").innerHTML = s.open === null ? "" : (s.open ? `<span class="badge green">● ${esc(s.text)}</span>` : `<span class="badge red">● ${esc(s.text)}</span>`); }
function greeting() { const h = ktNow().hour; if (h < 12) return "GOOD MORNING, WELCOME!"; if (h < 17) return "GOOD AFTERNOON, WELCOME!"; return "GOOD EVENING, WELCOME!"; }

function renderAnnouncements() {
  const now = Date.now();
  const act = state.announcements.filter(a => { if (a.published !== true) return false; const s = a.startsAt ? a.startsAt.toMillis() : null, e = a.endsAt ? a.endsAt.toMillis() : null; if (s && s > now) return false; if (e && e < now) return false; return true; }).sort((a,b) => (b.priorityRank||2) - (a.priorityRank||2));
  const bar = $("annBar");
  if (!act.length) { bar.hidden = true; return; }
  bar.hidden = false;
  bar.innerHTML = act.map(a => `<span>${a.priority === "high" ? "⚠️ " : a.type === "offer" ? "🎁 " : "📢 "}${esc(a.message)}</span>`).join("");
}
function renderDrawer() { $("drawerCats").innerHTML = `<button class="d-cat ${state.catFilter === "all" ? "active" : ""}" data-cat="all">All Products</button>` + state.categories.map(c => `<button class="d-cat ${state.catFilter === c.id ? "active" : ""}" data-cat="${c.id}">${esc(c.name)}</button>`).join(""); }
function renderChips() {
  $("catChips").innerHTML = `<button class="chip ${state.catFilter === "all" ? "active" : ""}" data-cat="all">All</button>` + state.categories.map(c => `<button class="chip ${state.catFilter === c.id ? "active" : ""}" data-cat="${c.id}">${esc(c.name)}</button>`).join("");
  const c = state.categories.find(x => x.id === state.catFilter);
  $("prodTitle").textContent = c ? c.name : "All Products";
  $("prodSub").textContent = c ? (c.description || "Collection") : "Our full collection";
}
function renderProducts() {
  const q = state.search.toLowerCase();
  const items = state.products.filter(p => (state.catFilter === "all" || p.categoryId === state.catFilter) && (!q || (p.name||"").toLowerCase().includes(q) || (p.description||"").toLowerCase().includes(q)));
  $("productGrid").innerHTML = items.length ? items.map(p => {
    const img = imgUrl(p.imageUrl); const fav = state.favs.includes(p.id); const wa = productWa(p);
    return `<article class="p-card" data-id="${p.id}">
      ${img ? `<img src="${img}" alt="${esc(p.name)}" loading="lazy" decoding="async">` : `<div class="p-noimg">${CAM_SVG}</div>`}
      <div class="p-body">
        <div class="p-top"><strong>${esc(p.name)}</strong><button class="p-fav ${fav ? "on" : ""}" data-fav="${p.id}" aria-label="Favorite">${HEART_SVG}</button></div>
        <p class="p-desc">${esc(p.description||"")}</p>
        ${(p.sizeIds||[]).length ? `<div class="p-sizes">${p.sizeIds.map(id => { const s = state.sizes.find(x => x.id === id); const pr = p.sizePrices && p.sizePrices[id]; return `<span class="p-size">${s ? esc(s.name) : ""}${pr != null ? " · " + fmtMoney(pr) : ""}</span>`; }).join("")}</div>` : ""}
        <div class="p-foot"><span class="p-price">${fmtMoney(p.price)}</span>${wa ? `<a class="p-wa" href="${wa}" target="_blank" rel="noopener">Order · WhatsApp</a>` : ""}</div>
        ${p.isFeatured ? `<span class="badge gold">★ Featured</span>` : ""}${p.isAvailable === false ? `<span class="badge red">Currently unavailable</span>` : ""}
      </div>
    </article>`;
  }).join("") : `<p class="muted">कुनै service भेटिएन।</p>`;
}
function sizePriceFor(p, s) { return (p.sizePrices && p.sizePrices[s.id] != null) ? p.sizePrices[s.id] : (s.price || 0); }
function openProductModal(p) {
  const img = imgUrl(p.imageUrl);
  $("pmImgWrap").innerHTML = img ? `<img src="${img}" alt="${esc(p.name)}">` : `<div class="p-noimg">${CAM_SVG}</div>`;
  $("pmName").textContent = p.name;
  const c = state.categories.find(x => x.id === p.categoryId);
  $("pmCat").textContent = c ? c.name : "";
  $("pmDesc").textContent = p.description || "";
  $("pmSizes").innerHTML = (p.sizeIds||[]).length ? p.sizeIds.map(id => { const s = state.sizes.find(x => x.id === id); if (!s) return ""; return `<div class="pm-size"><span>${esc(s.name)}${s.dimensions ? " (" + esc(s.dimensions) + ")" : ""}</span><span>${fmtMoney(sizePriceFor(p, s))}</span></div>`; }).join("") : "";
  $("pmPrice").textContent = fmtMoney(p.price);
  const wa = productWa(p);
  $("pmWa").href = wa || "#"; $("pmWa").style.display = wa ? "" : "none";
  $("pmAvail").innerHTML = (p.isAvailable === false ? `<span class="badge red">Currently unavailable</span> ` : "") + (p.isFeatured ? `<span class="badge gold">★ Featured</span>` : "");
  $("productModal").hidden = false;
}
function renderSizes() { $("sizeGrid").innerHTML = state.sizes.length ? state.sizes.map(s => `<div class="s-card"><strong>${esc(s.name)}</strong><span class="muted">${esc(s.dimensions||"")}</span><span>${fmtMoney(s.price)}</span></div>`).join("") : `<p class="muted">Sizes coming soon.</p>`; }
function renderGallery() { $("galleryGrid").innerHTML = state.gallery.length ? state.gallery.map(g => { const img = imgUrl(g.imageUrl); return img ? `<div class="g-item" data-img="${img}" data-title="${esc(g.title||"")}"><img src="${img}" alt="${esc(g.title||"gallery")}" loading="lazy" decoding="async"></div>` : ""; }).join("") : `<p class="muted">Gallery coming soon.</p>`; }
function renderHours() {
  const now = ktNow(); const days = (state.hours && state.hours.days) || {};
  $("hoursTable").innerHTML = DAYS.map(([k, l]) => { const d = days[k]; const closed = !(d && d.open); return `<div class="h-row ${k === now.day ? "today" : ""} ${closed ? "closed" : ""}"><span>${l}</span><span>${closed ? "Closed" : `${d.opens} – ${d.closes}`}</span></div>`; }).join("");
  refreshBadge();
}
function setLink(id, href) { const el = $(id); if (!el) return; if (href) { el.href = href; el.hidden = false; } else el.hidden = true; }
function renderStore() {
  const s = state.store || {};
  const name = s.name || "Laligurans Photo Studio";
  const tag = s.tagline || DEFAULT_TAG;
  const parts = String(tag).split(",").map(x => x.trim());
  document.title = name + " — Photo Studio";
  $("metaDesc").setAttribute("content", `${name} — ${tag}`);
  $("brandName").textContent = name.split(" ")[0] || name;
  $("tagLine1").textContent = parts[0] || tag;
  $("tagLine2").textContent = parts[1] || "";
  $("heroSub").textContent = s.about || "Premium photography, prints and frames.";
  $("greetBadge").textContent = greeting();
  $("aboutName").textContent = name;
  $("aboutTag").textContent = tag;
  $("aboutAddr").hidden = !s.address; $("aboutAddr").querySelector("span").textContent = s.address || "";
  $("aboutPhone").hidden = !s.phone; $("aboutPhone").querySelector("span").textContent = s.phone || "";
  const wan = waNumber();
  $("aboutWa").hidden = !wan; $("aboutWa").querySelector("span").textContent = wan ? "+" + wan : "";
  $("dPhone").textContent = s.phone || ""; $("dWaPhone").textContent = wan ? "+" + wan : "";
  setLink("dCall", s.phone ? "tel:" + s.phone.replace(/[^+\d]/g,"") : "");
  setLink("dWa", generalWa());
  setLink("cMap", safeUrl(s.mapUrl));
  setLink("sFb", safeUrl(s.facebook)); setLink("sIg", safeUrl(s.instagram)); setLink("sTk", safeUrl(s.tiktok));
  $("footCopy").textContent = `© ${new Date().getFullYear()} ${name}. All rights reserved.`;
  const mq = s.address || name;
  if (mq !== state.mapQ) { state.mapQ = mq; $("mapFrame").src = "https://www.google.com/maps?q=" + encodeURIComponent(mq) + "&output=embed"; }
  $("jsonld").textContent = JSON.stringify({ "@context": "https://schema.org", "@type": "LocalBusiness", name, slogan: tag, telephone: s.phone || "", email: s.email || "", address: s.address || "", sameAs: [safeUrl(s.facebook), safeUrl(s.instagram), safeUrl(s.tiktok)].filter(Boolean) });
}

function openDrawer(id) { $(id).classList.add("open"); $("backdrop").hidden = false; }
function closeDrawers() { $("drawer").classList.remove("open"); $("favDrawer").classList.remove("open"); $("backdrop").hidden = true; }

function bindLive() {
  db.collection("categories").onSnapshot(s => { state.categories = s.docs.map(d => ({ id: d.id, ...d.data() })).filter(c => c.isActive).sort((a,b) => (a.displayOrder??0)-(b.displayOrder??0)); renderDrawer(); renderChips(); renderProducts(); }, () => {});
  db.collection("products").onSnapshot(s => { state.products = s.docs.map(d => ({ id: d.id, ...d.data() })).filter(p => p.isActive).sort((a,b) => (a.displayOrder??0)-(b.displayOrder??0)); renderProducts(); renderFavs(); }, () => {});
  db.collection("sizes").onSnapshot(s => { state.sizes = s.docs.map(d => ({ id: d.id, ...d.data() })).filter(x => x.isActive).sort((a,b) => (a.displayOrder??0)-(b.displayOrder??0)); renderProducts(); }, () => {});
  db.collection("gallery").onSnapshot(s => { state.gallery = s.docs.map(d => ({ id: d.id, ...d.data() })).filter(g => g.published).sort((a,b) => (b.createdAt?.toMillis?.()||0) - (a.createdAt?.toMillis?.()||0)); renderGallery(); }, () => {});
  db.collection("announcements").onSnapshot(s => { state.announcements = s.docs.map(d => ({ id: d.id, ...d.data() })); renderAnnouncements(); }, () => {});
  db.collection("storeInfo").doc("main").onSnapshot(s => { state.store = s.exists ? s.data() : null; renderStore(); }, () => {});
  db.collection("businessHours").doc("weekly").onSnapshot(s => { state.hours = s.exists ? s.data() : null; renderHours(); }, () => {});
}

function init() {
  loadFavs();
  applyTheme(localStorage.getItem("lgs_theme") || "dark");
  $("navToggle").addEventListener("click", () => openDrawer("drawer"));
  $("favToggle").addEventListener("click", () => { renderFavs(); openDrawer("favDrawer"); });
  $("drawerClose").addEventListener("click", closeDrawers);
  $("favClose").addEventListener("click", closeDrawers);
  $("backdrop").addEventListener("click", closeDrawers);
  $("themeToggle").addEventListener("click", () => applyTheme(document.body.classList.contains("light") ? "dark" : "light"));
  $("searchToggle").addEventListener("click", () => { const b = $("searchBar"); b.hidden = !b.hidden; if (!b.hidden) $("searchInput").focus(); });
  $("searchInput").addEventListener("input", debounce(e => { state.search = e.target.value.trim(); renderProducts(); }, 300));
  $("catChips").addEventListener("click", e => { const b = e.target.closest(".chip"); if (!b) return; state.catFilter = b.dataset.cat; renderChips(); renderDrawer(); renderProducts(); });
  $("drawerCats").addEventListener("click", e => { const b = e.target.closest(".d-cat"); if (!b) return; state.catFilter = b.dataset.cat; renderChips(); renderDrawer(); renderProducts(); closeDrawers(); document.getElementById("services").scrollIntoView({ behavior: "smooth" }); });
  $("favList").addEventListener("click", e => { const b = e.target.closest("[data-favgo]"); if (!b) return; closeDrawers(); document.getElementById("services").scrollIntoView(); });
  $("productGrid").addEventListener("click", e => {
    const f = e.target.closest("[data-fav]"); if (f) { toggleFav(f.dataset.fav); return; }
    if (e.target.closest("a")) return;
    const card = e.target.closest(".p-card"); if (card) { const p = state.products.find(x => x.id === card.dataset.id); if (p) openProductModal(p); }
  });
  $("pmClose").addEventListener("click", () => { $("productModal").hidden = true; });
  $("productModal").addEventListener("click", e => { if (e.target === $("productModal")) $("productModal").hidden = true; });
  $("galleryGrid").addEventListener("click", e => { const it = e.target.closest(".g-item"); if (!it) return; $("lightboxImg").src = it.dataset.img; $("lightbox").hidden = false; });
  $("lightboxClose").addEventListener("click", () => { $("lightbox").hidden = true; });
  $("lightbox").addEventListener("click", e => { if (e.target === $("lightbox")) $("lightbox").hidden = true; });
  document.addEventListener("keydown", e => { if (e.key === "Escape") { $("lightbox").hidden = true; $("productModal").hidden = true; closeDrawers(); } });

  if (typeof firebase === "undefined") { $("productGrid").innerHTML = `<p class="muted">Loading failed. Internet जाँच गर्नुहोस्।</p>`; return; }
  if (Object.values(firebaseConfig).some(v => String(v).includes("PASTE_"))) { $("productGrid").innerHTML = `<p class="muted">user/script.js मा Firebase config paste गर्नुहोस्।</p>`; return; }
  firebase.initializeApp(firebaseConfig);
  db = firebase.firestore();
  bindLive();
  setInterval(() => { refreshBadge(); $("greetBadge").textContent = greeting(); }, 60000);
}
document.addEventListener("DOMContentLoaded", init);
