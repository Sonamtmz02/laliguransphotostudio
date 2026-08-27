/* LALIGURANS USER PANEL - realtime public site */
const firebaseConfig = {
  apiKey: "PASTE_YOUR_API_KEY",
  authDomain: "PASTE_YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "PASTE_YOUR_PROJECT_ID",
  storageBucket: "PASTE_YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "PASTE_YOUR_MESSAGING_SENDER_ID",
  appId: "PASTE_YOUR_APP_ID"
};
const CUR = "रु.";
const DEFAULT_TAG = "सम्झनाको लागी फोटो, फोटोको लागी गुराँस";
const DAYS = [["sunday","Sunday"],["monday","Monday"],["tuesday","Tuesday"],["wednesday","Wednesday"],["thursday","Thursday"],["friday","Friday"],["saturday","Saturday"]];
const state = { store: null, categories: [], products: [], sizes: [], gallery: [], announcements: [], hours: null, catFilter: "all", search: "" };
let db = null;

function $(id) { return document.getElementById(id); }
function esc(v) { return String(v ?? "").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;"); }
function safeUrl(v) { const s = String(v||"").trim(); if (!s) return ""; try { const u = new URL(s); return ["https:","http:"].includes(u.protocol) ? s : ""; } catch { return ""; } }
function fmtMoney(n) { return `${CUR} ${Number(n||0).toLocaleString()}`; }
function debounce(fn, ms) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; }

/* WhatsApp */
function waNumber() { let d = ((state.store && state.store.phone) || "").replace(/\D/g,""); if (!d) return ""; if (!d.startsWith("977") && d.length === 10 && d.startsWith("9")) d = "977" + d; return d; }
function waHref(msg) { const n = waNumber(); return n ? "https://wa.me/" + n + "?text=" + encodeURIComponent(msg) : ""; }
function generalWa() { return waHref(`Namaste ${storeName()}! 🌺 I would like to know more about your services.`); }
function productWa(p) {
  const img = p.imageUrl ? location.origin + p.imageUrl : "";
  let msg = `Namaste ${storeName()}! 🌺\nI want to order: ${p.name}\nPrice: ${fmtMoney(p.price)}`;
  if ((p.sizeIds||[]).length) { msg += "\nSizes:"; p.sizeIds.forEach(id => { const s = state.sizes.find(x => x.id === id); const pr = p.sizePrices && p.sizePrices[id]; msg += `\n- ${s ? s.name : ""}${s && s.dimensions ? " (" + s.dimensions + ")" : ""}${pr != null ? " — " + fmtMoney(pr) : ""}`; }); }
  if (img) msg += `\nImage: ${img}`;
  return waHref(msg);
}
function storeName() { return (state.store && state.store.name) || "Laligurans Photo Studio"; }

/* Kathmandu time + status */
function ktNow() { const parts = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Kathmandu", weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(new Date()); const g = t => parts.find(p => p.type === t).value; return { day: g("weekday").toLowerCase(), min: (parseInt(g("hour"),10)%24)*60 + parseInt(g("minute"),10) }; }
function toMin(v) { if (!v) return 0; const [h,m] = String(v).split(":").map(Number); return (h||0)*60+(m||0); }
function bizStatus() {
  const d = state.hours;
  if (!d) return { open: null, text: "" };
  if (d.override && d.override.enabled) return { open: d.override.status === "open", text: d.override.status === "open" ? ("Open" + (d.override.reason ? " · " + d.override.reason : "")) : ("Closed" + (d.override.reason ? " · " + d.override.reason : "")) };
  const now = ktNow(), days = d.days || {}, today = days[now.day];
  if (today && today.open) { if (now.min >= toMin(today.opens) && now.min < toMin(today.closes)) return { open: true, text: "Open now · closes " + today.closes }; if (now.min < toMin(today.opens)) return { open: false, text: "Closed · opens today " + today.opens }; }
  const order = DAYS.map(x => x[0]), idx = order.indexOf(now.day);
  for (let i=1;i<=7;i++){ const k = order[(idx+i)%7]; if (days[k] && days[k].open) return { open: false, text: "Closed · opens " + DAYS.find(x=>x[0]===k)[1] + " " + days[k].opens }; }
  return { open: false, text: "Closed" };
}
function refreshOpenBadge() { const s = bizStatus(); const b = $("openBadge"); if (s.open === null) { b.className = "badge gray"; b.textContent = "Hours soon"; } else if (s.open) { b.className = "badge green"; b.textContent = "● " + s.text; } else { b.className = "badge red"; b.textContent = "● " + s.text; } const hs = $("hoursStatus"); if (hs) hs.innerHTML = s.open === null ? "" : (s.open ? `<span class="badge green">● ${esc(s.text)}</span>` : `<span class="badge red">● ${esc(s.text)}</span>`); }

/* renders */
function renderAnnouncements() {
  const now = Date.now();
  const act = state.announcements.filter(a => { if (a.published !== true) return false; const s = a.startsAt ? a.startsAt.toMillis() : null, e = a.endsAt ? a.endsAt.toMillis() : null; if (s && s > now) return false; if (e && e < now) return false; return true; }).sort((a,b) => (b.priorityRank||2) - (a.priorityRank||2));
  const bar = $("annBar");
  if (!act.length) { bar.hidden = true; bar.innerHTML = ""; return; }
  bar.hidden = false;
  bar.innerHTML = act.map(a => `<span class="ann-item">${a.priority === "high" ? "⚠️ " : a.type === "offer" ? "🎁 " : "📢 "}${esc(a.message)}</span>`).join("");
}
function renderChips() {
  $("catChips").innerHTML = `<button class="chip ${state.catFilter === "all" ? "active" : ""}" data-cat="all">All</button>` + state.categories.map(c => `<button class="chip ${state.catFilter === c.id ? "active" : ""}" data-cat="${c.id}">${esc(c.name)}</button>`).join("");
}
function sizeLabel(id, p) { const s = state.sizes.find(x => x.id === id); const pr = p.sizePrices && p.sizePrices[id]; return `${s ? esc(s.name) : ""}${pr != null ? " · " + fmtMoney(pr) : ""}`; }
function renderProducts() {
  const q = state.search.toLowerCase();
  const items = state.products.filter(p => (state.catFilter === "all" || p.categoryId === state.catFilter) && (!q || (p.name||"").toLowerCase().includes(q) || (p.description||"").toLowerCase().includes(q)));
  const grid = $("productGrid");
  if (!items.length) { grid.innerHTML = `<p class="muted">कुनै service भेटिएन।</p>`; return; }
  grid.innerHTML = items.map(p => {
    const img = p.imageUrl && String(p.imageUrl).startsWith("/api/img/") ? p.imageUrl : "";
    const wa = productWa(p);
    return `<article class="p-card">
      ${img ? `<img src="${img}" alt="${esc(p.name)}" loading="lazy" decoding="async">` : `<div class="p-noimg">📷</div>`}
      <div class="p-body">
        <div class="p-top"><strong>${esc(p.name)}</strong>${p.isFeatured ? `<span class="badge gold">★ Featured</span>` : ""}</div>
        <p class="p-desc">${esc(p.description||"")}</p>
        ${(p.sizeIds||[]).length ? `<div class="p-sizes">${p.sizeIds.map(id => `<span class="p-size">${sizeLabel(id, p)}</span>`).join("")}</div>` : ""}
        <div class="p-foot"><span class="p-price">${fmtMoney(p.price)}</span>${wa ? `<a class="p-wa" href="${wa}" target="_blank" rel="noopener">Order · WhatsApp</a>` : ""}</div>
        ${p.isAvailable === false ? `<span class="badge red">Currently unavailable</span>` : ""}
      </div>
    </article>`;
  }).join("");
}
function renderSizes() { $("sizeGrid").innerHTML = state.sizes.length ? state.sizes.map(s => `<div class="s-card"><strong>${esc(s.name)}</strong><span class="muted">${esc(s.dimensions||"")}</span><span>${fmtMoney(s.price)}</span></div>`).join("") : `<p class="muted">Sizes coming soon.</p>`; }
function renderGallery() { $("galleryGrid").innerHTML = state.gallery.length ? state.gallery.map(g => { const img = g.imageUrl && String(g.imageUrl).startsWith("/api/img/") ? g.imageUrl : ""; return img ? `<div class="g-item" data-img="${img}" data-title="${esc(g.title||"")}"><img src="${img}" alt="${esc(g.title||"gallery")}" loading="lazy" decoding="async"></div>` : ""; }).join("") : `<p class="muted">Gallery coming soon.</p>`; }
function renderHours() {
  const now = ktNow(); const days = (state.hours && state.hours.days) || {};
  $("hoursTable").innerHTML = DAYS.map(([k, l]) => { const d = days[k]; return `<div class="h-row ${k === now.day ? "today" : ""}"><span>${l}${k === now.day ? " (today)" : ""}</span><span>${d && d.open ? `${d.opens} – ${d.closes}` : "Closed"}</span></div>`; }).join("");
  refreshOpenBadge();
}
function setLink(id, href) { const el = $(id); if (href) { el.href = href; el.hidden = false; } else el.hidden = true; }
function renderStore() {
  const s = state.store || {};
  const name = s.name || "Laligurans Photo Studio";
  const tag = s.tagline || DEFAULT_TAG;
  document.title = name + " — Photo Studio";
  $("metaDesc").setAttribute("content", `${name} — ${tag}`);
  $("brandName").textContent = name; $("heroName").textContent = name; $("heroTagline").textContent = tag;
  $("footName").textContent = name; $("footTag").textContent = tag; $("aboutQuote").textContent = tag;
  $("aboutText").textContent = s.about || `${name} — quality photo services।`;
  $("heroMeta").textContent = [s.address, s.phone].filter(Boolean).join(" · ");
  $("cAddress").textContent = s.address || "";
  $("cPhone").textContent = s.phone || ""; $("cEmail").textContent = s.email || "";
  setLink("cCall", s.phone ? "tel:" + s.phone.replace(/[^+\d]/g,"") : "");
  setLink("qCall", s.phone ? "tel:" + s.phone.replace(/[^+\d]/g,"") : "");
  setLink("heroCall", s.phone ? "tel:" + s.phone.replace(/[^+\d]/g,"") : "");
  setLink("cMail", s.email ? "mailto:" + s.email : "");
  setLink("cMap", safeUrl(s.mapUrl)); setLink("qMap", safeUrl(s.mapUrl));
  setLink("sFb", safeUrl(s.facebook)); setLink("sIg", safeUrl(s.instagram)); setLink("sTk", safeUrl(s.tiktok));
  const wa = generalWa();
  setLink("headWa", wa); setLink("heroWa", wa); setLink("cWa", wa); setLink("qWa", wa);
  $("year").textContent = new Date().getFullYear();
  $("jsonld").textContent = JSON.stringify({ "@context": "https://schema.org", "@type": "LocalBusiness", name, slogan: tag, telephone: s.phone || "", email: s.email || "", address: s.address || "", sameAs: [safeUrl(s.facebook), safeUrl(s.instagram), safeUrl(s.tiktok)].filter(Boolean) });
}

/* live binding */
function bindLive() {
  db.collection("categories").onSnapshot(s => { state.categories = s.docs.map(d => ({ id: d.id, ...d.data() })).filter(c => c.isActive).sort((a,b) => (a.displayOrder??0)-(b.displayOrder??0)); renderChips(); renderProducts(); }, () => {});
  db.collection("products").onSnapshot(s => { state.products = s.docs.map(d => ({ id: d.id, ...d.data() })).filter(p => p.isActive).sort((a,b) => (a.displayOrder??0)-(b.displayOrder??0)); renderProducts(); }, () => {});
  db.collection("sizes").onSnapshot(s => { state.sizes = s.docs.map(d => ({ id: d.id, ...d.data() })).filter(x => x.isActive).sort((a,b) => (a.displayOrder??0)-(b.displayOrder??0)); renderSizes(); renderProducts(); }, () => {});
  db.collection("gallery").onSnapshot(s => { state.gallery = s.docs.map(d => ({ id: d.id, ...d.data() })).filter(g => g.published).sort((a,b) => (b.createdAt?.toMillis?.()||0) - (a.createdAt?.toMillis?.()||0)); renderGallery(); }, () => {});
  db.collection("announcements").onSnapshot(s => { state.announcements = s.docs.map(d => ({ id: d.id, ...d.data() })); renderAnnouncements(); }, () => {});
  db.collection("storeInfo").doc("main").onSnapshot(s => { state.store = s.exists ? s.data() : null; renderStore(); }, () => {});
  db.collection("businessHours").doc("weekly").onSnapshot(s => { state.hours = s.exists ? s.data() : null; renderHours(); }, () => {});
}

function init() {
  $("navToggle").addEventListener("click", () => { const open = $("mainNav").classList.toggle("open"); $("navBackdrop").hidden = !open; $("navToggle").setAttribute("aria-expanded", String(open)); });
  $("navBackdrop").addEventListener("click", () => { $("mainNav").classList.remove("open"); $("navBackdrop").hidden = true; });
  document.querySelectorAll(".main-nav a").forEach(a => a.addEventListener("click", () => { $("mainNav").classList.remove("open"); $("navBackdrop").hidden = true; }));
  $("searchInput").addEventListener("input", debounce(e => { state.search = e.target.value.trim(); renderProducts(); }, 300));
  $("catChips").addEventListener("click", e => { const b = e.target.closest(".chip"); if (!b) return; state.catFilter = b.dataset.cat; renderChips(); renderProducts(); });
  $("galleryGrid").addEventListener("click", e => { const it = e.target.closest(".g-item"); if (!it) return; $("lightboxImg").src = it.dataset.img; $("lightboxImg").alt = it.dataset.title || "Gallery photo"; $("lightbox").hidden = false; });
  $("lightboxClose").addEventListener("click", () => { $("lightbox").hidden = true; });
  $("lightbox").addEventListener("click", e => { if (e.target === $("lightbox")) $("lightbox").hidden = true; });
  document.addEventListener("keydown", e => { if (e.key === "Escape") $("lightbox").hidden = true; });

  if (typeof firebase === "undefined") { $("productGrid").innerHTML = `<p class="muted">Loading failed. Internet जाँच गर्नुहोस्।</p>`; return; }
  if (Object.values(firebaseConfig).some(v => String(v).includes("PASTE_"))) { $("productGrid").innerHTML = `<p class="muted">user/script.js मा Firebase config paste गर्नुहोस्।</p>`; return; }
  firebase.initializeApp(firebaseConfig);
  db = firebase.firestore();
  bindLive();
  setInterval(refreshOpenBadge, 60000);
}
document.addEventListener("DOMContentLoaded", init);
