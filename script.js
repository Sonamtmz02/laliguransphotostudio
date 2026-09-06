/* LALIGURANS USER PANEL - v13.3 (exact-time status flip + 12h display + DEFAULT_HOURS fallback) */
const firebaseConfig = {
  apiKey: "AIzaSyAopefoW6m7RYV_HkN1rzHqMsN4tN0HJ8I",
  authDomain: "laligurans-photo-studio.firebaseapp.com",
  projectId: "laligurans-photo-studio",
  storageBucket: "laligurans-photo-studio.firebasestorage.app",
  messagingSenderId: "826817572339",
  appId: "1:826817572339:web:8d2d2c8831c7a511b7f686"
};
const API_BASE = "https://laligurans-admin.pages.dev";
const CUR = "रु.";
const DEFAULT_TAG = "सम्झनाको लागी फोटो, फोटोको लागी गुराँस";
const CONTACT = { callDisplay: "011-620217", callTel: "tel:+97711620217", waDigits: "9779768385368", waDisplay: "+977 9768385368", email: "laliguranstudio@gmail.com" };
const PROP = { name: "Surya Lal Shretha", waDigits: "9779841486925" };
const PAGE_SIZE = 12;
const DAYS = [["sunday","Sunday"],["monday","Monday"],["tuesday","Tuesday"],["wednesday","Wednesday"],["thursday","Thursday"],["friday","Friday"],["saturday","Saturday"]];
const NEP_DAYS = ["आइतबार","सोमबार","मङ्गलबार","बुधबार","बिहीबार","शुक्रबार","शनिबार"];
const NEP_MONTHS = ["वैशाख","जेठ","असार","साउन","भदौ","असोज","कात्तिक","मंसिर","पुस","माघ","फागुन","चैत"];
const ND = ["०","१","२","३","४","५","६","७","८","९"];
const np = s => String(s).replace(/\d/g, d => ND[d]);
const BS = {
 2080:[31,31,32,31,31,30,30,29,30,29,30,30],2081:[31,32,31,32,31,30,30,30,29,29,30,30],
 2082:[31,32,31,32,31,30,30,30,29,30,29,31],2083:[31,31,31,32,31,30,30,29,30,29,30,30],
 2084:[31,32,31,32,31,30,30,30,29,29,30,31],2085:[31,31,32,31,31,30,30,29,30,29,30,30],
 2086:[31,32,31,32,31,30,30,30,29,29,30,30],2087:[31,32,31,32,31,30,30,30,29,30,29,31],
 2088:[31,31,32,31,31,30,30,29,30,29,30,30],2089:[31,32,31,32,31,30,30,30,29,29,30,30],
 2090:[31,32,31,32,31,30,30,30,29,30,29,31]
};
function toBS(ce) { const anchor = Date.UTC(2023, 3, 15); let diff = Math.round((Date.UTC(ce.y, ce.m - 1, ce.d) - anchor) / 86400000); if (diff < 0) return null; let y = 2080; while (y <= 2090) { const yt = BS[y].reduce((a,b)=>a+b,0); if (diff < yt) break; diff -= yt; y++; } if (y > 2090) return null; let m = 0; while (diff >= BS[y][m]) { diff -= BS[y][m]; m++; } return { y, m: m + 1, d: diff + 1 }; }
const SERVICES = [
  { t: "Passport / ID Photo", d: "Instant passport & ID size photos", ic: `<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M14 9h5M14 13h5M7 16h10"/>` },
  { t: "T-shirt, Cushion, Cup, Metal Print", d: "Custom photo prints on products", ic: `<path d="M16 4l4 3-2 3-2-1v11H8V9L6 10 4 7l4-3 2 1h4z"/>` },
  { t: "Birthday Frame + Gift Items", d: "Frames & personalized gifts", ic: `<rect x="4" y="9" width="16" height="11" rx="2"/><path d="M12 9v11M12 9c-2.5 0-3.5-1.2-3.5-2.5S9.5 4 10.5 4 12 6.5 12 9c0-2.5.5-5 1.5-5s2 1 2 2.5S14.5 9 12 9"/>` },
  { t: "E-passport Online Form", d: "Online form filling assistance", ic: `<path d="M6 2h9l5 5v15H6z"/><path d="M15 2v5h5M9 13h6M9 17h6"/>` },
  { t: "Wedding / Event Photography", d: "Full event coverage", ic: `<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>` },
  { t: "More Services", d: "Ask us anything", ic: `<path d="M21 12a8 8 0 0 1-8 8H4l-2 2V12a8 8 0 0 1 8-8h3a8 8 0 0 1 8 8z"/>` }
];
const CAM = `<svg class="ic" viewBox="0 0 24 24"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>`;
const HEART = `<svg class="ic" viewBox="0 0 24 24"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>`;
const SUN = `<svg class="ic" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>`;
const MOON = `<svg class="ic" viewBox="0 0 24 24"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>`;
const SHARE_SVG = `<svg class="ic" viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 10.7l6.8-4M8.6 13.3l6.8 4"/></svg>`;
const BAG = `<svg class="ic" viewBox="0 0 24 24"><path d="M6 7h12l1 14H5L6 7z"/><path d="M9 7a3 3 0 0 1 6 0"/></svg>`;
const state = { store: null, categories: null, products: [], sizes: null, gallery: null, announcements: [], hours: null, catFilter: "all", search: "", favs: [], cart: [], mapQ: "", theme: "light", pmId: null, pmSize: null, lbList: [], lbIndex: 0, share: null, pq: { last: null, done: false, loading: false }, searchMode: false };
let db = null;

function $(id) { return document.getElementById(id); }
function hideRouteLoader() { const l = $("routeLoader"); if (l) { l.hidden = true; l.style.display = "none"; } }
function esc(v) { return String(v ?? "").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;"); }
function safeUrl(v) { const s = String(v||"").trim(); if (!s) return ""; try { const u = new URL(s); return ["https:","http:"].includes(u.protocol) ? s : ""; } catch { return ""; } }
function imgUrl(v) { if (!v) return ""; const s = String(v); if (s.startsWith("http")) return s; if (s.startsWith("/api/")) return API_BASE + s; return ""; }
function fmtMoney(n) { return `${CUR} ${Number(n||0).toLocaleString()}`; }
function fmt12(hm) { if (!hm) return ""; let [h,m] = String(hm).split(":").map(Number); const ap = h < 12 ? "AM" : "PM"; let hh = h % 12; if (hh === 0) hh = 12; return `${hh}:${String(m).padStart(2,"0")} ${ap}`; }
function debounce(fn, ms) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; }
function storeName() { return (state.store && state.store.name) || "Laligurans Photo Studio"; }
function toast(m) { let t = document.getElementById("lgToast"); if (!t) { t = document.createElement("div"); t.id = "lgToast"; t.style.cssText = "position:fixed;bottom:1rem;left:50%;transform:translateX(-50%);background:#221f1e;color:#fff;padding:.7rem 1.1rem;border-radius:999px;z-index:99;font-size:.8rem;font-weight:700;box-shadow:0 8px 24px rgba(0,0,0,.3);transition:opacity .3s"; document.body.appendChild(t); } t.textContent = m; t.style.opacity = "1"; clearTimeout(t._h); t._h = setTimeout(() => { t.style.opacity = "0"; }, 2200); }
function slugify(s) { return String(s||"").toLowerCase().normalize("NFKD").replace(/[\u0900-\u097F]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"") || "item"; }
function catSlug(c) { return slugify(c.name); }
function assignSlugsInPlace(list) {
  const used = {};
  for (const p of state.products) if (p.slug) used[p.slug] = p.id;
  for (const p of list) if (p.slug) used[p.slug] = p.id;
  for (const p of [...list].sort((a,b)=>(a.createdAt?.toMillis?.()||0)-(b.createdAt?.toMillis?.()||0))) {
    if (!p.slug) {
      let base = slugify(p.name), s = base, n = 2;
      while (used[s] && used[s] !== p.id) { s = base + "-" + n; n++; }
      p.slug = s; used[s] = p.id;
    }
  }
}
function setSeo(o) { document.title = o.title; const set = (sel,at,v) => { const el = document.querySelector(sel); if (el) el.setAttribute(at,v); }; set("#metaDesc","content",o.desc); set("#ogTitle","content",o.title); set("#ogDesc","content",o.desc); if (o.image) set("#ogImage","content",o.image); set("#ogType","content",o.type||"website"); set("#ogUrl","content",o.url); set("#canonical","href",o.url); set('meta[name="twitter:card"]',"content",o.image?"summary_large_image":"summary"); set('meta[name="twitter:title"]',"content",o.title); set('meta[name="twitter:description"]',"content",o.desc); if (o.image) set('meta[name="twitter:image"]',"content",o.image); }
function setJsonLd(obj) { const el = $("jsonld"); if (el) el.textContent = JSON.stringify(obj); }

/* ===== v13.2: phone / WhatsApp / email admin (storeInfo) बाट ===== */
function waNumber() {
const s = state.store || {};
const raw = String(s.whatsappPhone || "").replace(/\D/g, "");
if (!raw) return CONTACT.waDigits;
if (raw.startsWith("977")) return raw;
if (raw.length === 10 && raw.startsWith("9")) return "977" + raw;
return CONTACT.waDigits;
}
function storePhoneDisplay() { const s = state.store || {}; return (s.phone || "").trim() || CONTACT.callDisplay; }
function storePhoneTel() {
  const s = state.store || {};
  const raw = String(s.phone || "").replace(/[^\d+]/g, "");
  if (!raw) return CONTACT.callTel;
  if (raw.startsWith("+")) return "tel:" + raw;
  return "tel:+" + (raw.startsWith("977") ? raw : "977" + raw);
}
function waHrefMsg(msg, digits) { return "https://wa.me/" + digits + "?text=" + encodeURIComponent(msg); }
function waOpen(msg, digits) { const phone = digits || waNumber(); const enc = encodeURIComponent(msg); const web = "https://wa.me/" + phone + "?text=" + enc; const ua = navigator.userAgent || ""; if (/android/i.test(ua)) { window.location.href = "intent://wa.me/" + phone + "?text=" + enc + "#Intent;scheme=https;package=com.whatsapp;S.browser_fallback_url=" + encodeURIComponent(web) + ";end"; } else if (/iphone|ipad|ipod/i.test(ua)) { window.location.href = web; } else { window.open(web, "_blank", "noopener"); } }
function setWa(el, msg, digits) { if (!el) return; el.href = waHrefMsg(msg, digits || waNumber()); el.dataset.waMsg = msg; if (digits) el.dataset.waDigits = digits; el.hidden = false; }
function generalWaMsg() { return `Namaste ${storeName()}! I would like to know more about your services.`; }
function productWaMsg(p) { let msg = `Namaste ${storeName()}!\nI want to order: ${p.name}\nPrice: ${fmtMoney(p.price)}`; if ((p.sizeIds||[]).length) { msg += "\nSizes:"; p.sizeIds.forEach(id => { const s = (state.sizes||[]).find(x => x.id === id); const pr = p.sizePrices && p.sizePrices[id]; msg += `\n- ${s ? s.name : ""}${s && s.dimensions ? " (" + s.dimensions + ")" : ""}${pr != null ? " — " + fmtMoney(pr) : ""}`; }); } msg += `\nProduct: ${location.origin}/product/${p.slug || ""}`; return msg; }

function resolveTheme(t) { if (t === "system") return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark"; return t; }
function applyTheme(t, save = true) { state.theme = t; const r = resolveTheme(t); document.body.classList.toggle("dark", r === "dark"); document.body.classList.toggle("light", r === "light"); $("themeToggle").innerHTML = r === "dark" ? MOON : SUN; if (save) localStorage.setItem("lgs_theme", t); }
try { window.matchMedia("(prefers-color-scheme: light)").addEventListener("change", () => { if (state.theme === "system") applyTheme("system", false); }); } catch {}

function loadFavs() { try { state.favs = JSON.parse(localStorage.getItem("lgs_favs") || "[]"); } catch { state.favs = []; } }
function saveFavs() { localStorage.setItem("lgs_favs", JSON.stringify(state.favs)); }
function favCount() { const el = $("favCount"); el.textContent = state.favs.length; el.hidden = !state.favs.length; }
function toggleFav(id) { state.favs = state.favs.includes(id) ? state.favs.filter(x => x !== id) : [...state.favs, id]; saveFavs(); favCount(); renderFavs(); syncPmFav(); const b = document.querySelector(`[data-fav="${id}"]`); if (b) b.classList.toggle("on", state.favs.includes(id)); }
async function renderFavs() {
  let items = state.products.filter(p => state.favs.includes(p.id));
  const missing = state.favs.filter(id => !items.some(p => p.id === id));
  if (missing.length && db) {
    try {
      const snap = await db.collection("products").where("isActive", "==", true).limit(100).get();
      const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      items = items.concat(all.filter(p => missing.includes(p.id)));
    } catch (e) {}
  }
  $("favList").innerHTML = items.length ? items.map(p => `<button class="d-cat" data-favgo="${p.id}">${esc(p.name)} · ${fmtMoney(p.price)}</button>`).join("") : `<p class="muted" style="padding:0 .4rem">तपाईंको wishlist खाली छ।<br>Product को ♥ थिचेर save गर्नुहोस्।</p>`;
}

/* ===== CART ===== */
function loadCart() { try { state.cart = JSON.parse(localStorage.getItem("lgs_cart") || "[]"); } catch { state.cart = []; } }
function saveCart() { localStorage.setItem("lgs_cart", JSON.stringify(state.cart)); }
function cartCount() { const el = $("cartCount"); if (!el) return; const n = state.cart.reduce((a,x)=>a+(x.qty||0),0); el.textContent = n; el.hidden = !n; }
function addToCart(id, sizeId) {
  const p = state.products.find(x => x.id === id);
  const s = sizeId ? (state.sizes||[]).find(x => x.id === sizeId) : null;
  const key = id + "|" + (sizeId || "");
  const unit = p ? (s ? sizePriceFor(p, s) : (p.price||0)) : 0;
  const link = p && p.slug ? location.origin + "/product/" + p.slug : "";
  const ex = state.cart.find(x => x.key === key);
  if (ex) ex.qty += 1;
  else state.cart.push({ key, id, sizeId: sizeId || "", qty: 1, name: p ? p.name : "Item", sizeName: s ? s.name : "", unit, link });
  saveCart(); cartCount(); renderCart();
  toast("Cart मा थपियो! 🛍");
}
function cartChange(key, d) { const it = state.cart.find(x => x.key === key); if (!it) return; it.qty += d; if (it.qty <= 0) state.cart = state.cart.filter(x => x.key !== key); saveCart(); cartCount(); renderCart(); }
function cartRemove(key) { state.cart = state.cart.filter(x => x.key !== key); saveCart(); cartCount(); renderCart(); }
function cartLines() {
  const lines = []; let total = 0;
  state.cart.forEach(it => {
    const p = state.products.find(x => x.id === it.id);
    const s = it.sizeId ? (state.sizes||[]).find(x => x.id === it.sizeId) : null;
    const unit = p ? (s ? sizePriceFor(p, s) : (p.price||0)) : (it.unit||0);
    const link = (p && p.slug) ? location.origin + "/product/" + p.slug : (it.link || "");
    lines.push({ name: p ? p.name : (it.name||"Item"), size: s ? s.name : (it.sizeName||""), qty: it.qty, unit, link });
    total += unit * it.qty;
  });
  return { lines, total };
}
function cartWaMsg() {
  const L = cartLines();
  let msg = `Namaste ${storeName()}! I would like to order:`;
  L.lines.forEach((ln, i) => {
    msg += `\n${i+1}. ${ln.name}${ln.size ? " (" + ln.size + ")" : ""} x${ln.qty} — ${fmtMoney(ln.unit*ln.qty)}`;
    if (ln.link) msg += `\n🔗 ${ln.link}`;
  });
  msg += `\n\nTotal: ${fmtMoney(L.total)}`;
  msg += `\n\nPlease confirm availability. Thank you!`;
  return msg;
}
function renderCart() {
  const el = $("cartList"); if (!el) return;
  const w = $("cartWa"), t = $("cartTotalRow");
  if (!state.cart.length) {
    el.innerHTML = `<p class="muted" style="padding:0 .4rem">Cart खाली छ।<br>Product को 🛍 button थिचेर थप्नुहोस्।</p>`;
    if (w) w.hidden = true; if (t) t.hidden = true;
    return;
  }
  const L = cartLines();
  el.innerHTML = L.lines.map((ln, i) => {
    const it = state.cart[i];
    return `<div class="cart-row">
      <div class="cart-info"><strong>${esc(ln.name)}</strong>${ln.size ? `<span>Size: ${esc(ln.size)}</span>` : ""}<span>${fmtMoney(ln.unit)} each</span></div>
      <div class="cart-qty"><button data-cq="-1" data-key="${esc(it.key)}" aria-label="Less">−</button><span>${it.qty}</span><button data-cq="1" data-key="${esc(it.key)}" aria-label="More">+</button></div>
      <button class="cart-rm" data-crm="${esc(it.key)}" aria-label="Remove">✕</button>
    </div>`;
  }).join("");
  $("cartTotal").textContent = fmtMoney(L.total);
  if (w) w.hidden = false; if (t) t.hidden = false;
}
/* ===== END CART ===== */

function ktParts() { return new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Kathmandu", year: "numeric", month: "2-digit", day: "2-digit", weekday: "long", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(new Date()); }
function ktNow() { const g = t => ktParts().find(p => p.type === t).value; return { day: g("weekday").toLowerCase(), hour: parseInt(g("hour"),10)%24, min: (parseInt(g("hour"),10)%24)*60 + parseInt(g("minute"),10) }; }
function toMin(v) { if (!v) return 0; const [h,m] = String(v).split(":").map(Number); return (h||0)*60+(m||0); }

/* ===== v13.3: DEFAULT_HOURS fallback (गणना 24h मा, display 12h मा) ===== */
const DEFAULT_HOURS = { days: {
  sunday:{open:true,opens:"09:00",closes:"18:00"},
  monday:{open:true,opens:"09:00",closes:"18:00"},
  tuesday:{open:true,opens:"09:00",closes:"18:00"},
  wednesday:{open:true,opens:"09:00",closes:"18:00"},
  thursday:{open:true,opens:"09:00",closes:"18:00"},
  friday:{open:true,opens:"09:00",closes:"18:00"},
  saturday:{open:false,opens:"09:00",closes:"18:00"}
}};
function bizStatus() {
  const src = (state.hours && state.hours.days) ? state.hours : DEFAULT_HOURS;
  if (src.override && src.override.enabled) {
    const open = src.override.status === "open";
    const reason = (src.override.reason || "").trim();
    return { open, text: open ? ("Open" + (reason ? " · " + reason : "")) : ("Closed" + (reason ? " · " + reason : "")) };
  }
  const now = ktNow(), days = src.days, today = days[now.day];
  if (today && today.open) {
    if (now.min >= toMin(today.opens) && now.min < toMin(today.closes)) return { open: true, text: "Open now · closes " + fmt12(today.closes) };
    if (now.min < toMin(today.opens)) return { open: false, text: "Closed · opens " + fmt12(today.opens) };
  }
  const order = DAYS.map(x => x[0]), idx = order.indexOf(now.day);
  for (let i=1;i<=7;i++){ const k = order[(idx+i)%7]; if (days[k] && days[k].open) return { open: false, text: "Closed · opens " + DAYS.find(x=>x[0]===k)[1] + " " + fmt12(days[k].opens) }; }
  return { open: false, text: "Closed" };
}
function refreshBadge() { const s = bizStatus(); $("hoursStatus").innerHTML = s.open === null ? "" : (s.open ? `<span class="badge green">● ${esc(s.text)}</span>` : `<span class="badge red">● ${esc(s.text)}</span>`); }
function greeting() { const h = ktNow().hour; if (h < 12) return "GOOD MORNING, WELCOME!"; if (h < 17) return "GOOD AFTERNOON, WELCOME!"; return "GOOD EVENING, WELCOME!"; }
function updateNow() { const g = t => ktParts().find(p => p.type === t).value; const ce = { y: +g("year"), m: +g("month"), d: +g("day") }; const bs = toBS(ce); const wd = NEP_DAYS[["sun","mon","tue","wed","thu","fri","sat"].indexOf(g("weekday").toLowerCase().slice(0,3))]; let h = +g("hour") % 24; const ap = h < 12 ? "AM" : "PM"; let hh = h % 12; if (hh === 0) hh = 12; const dateStr = bs ? `${wd}, ${np(bs.d)} ${NEP_MONTHS[bs.m-1]} ${np(bs.y)}` : `${wd}, ${np(ce.d)}/${np(ce.m)}/${np(ce.y)}`; $("nowChip").textContent = `${dateStr} · ${np(hh)}:${np(g("minute"))} ${ap}`; }

const io = "IntersectionObserver" in window ? new IntersectionObserver(es => es.forEach(x => { if (x.isIntersecting) { x.target.classList.add("in"); io.unobserve(x.target); } }), { threshold: .08 }) : null;
function revealize() { document.querySelectorAll(".reveal:not(.in)").forEach(el => io ? io.observe(el) : el.classList.add("in")); }

function renderAnnouncements() { const now = Date.now(); const act = state.announcements.filter(a => { if (a.published !== true) return false; const s = a.startsAt ? a.startsAt.toMillis() : null, e = a.endsAt ? a.endsAt.toMillis() : null; if (s && s > now) return false; if (e && e < now) return false; return true; }).sort((a,b) => (b.priorityRank||2) - (a.priorityRank||2)); const bar = $("annBar"); if (!act.length) { bar.hidden = true; return; } bar.hidden = false; bar.innerHTML = act.map(a => esc(a.message)).join("  ·  "); }
function renderDrawer() { const cats = state.categories || []; $("drawerCats").innerHTML = `<button class="d-cat ${state.catFilter === "all" ? "active" : ""}" data-cat="all">All Products</button>` + cats.map(c => `<button class="d-cat ${state.catFilter === c.id ? "active" : ""}" data-cat="${c.id}">${esc(c.name)}</button>`).join(""); }
function renderCollections() { const el = $("colGrid"); const cats = state.categories; if (!cats) { el.innerHTML = ""; return; } el.innerHTML = cats.map(c => { const img = imgUrl(((state.products||[]).find(p => p.categoryId === c.id && p.imageUrl) || {}).imageUrl); return `<a class="col-card" data-col="${c.id}" href="/category/${catSlug(c)}" style="color:inherit;text-decoration:none">${img ? `<img src="${img}" alt="${esc(c.name)}" loading="lazy" decoding="async">` : `<span class="col-motif">❀</span>`}<span class="col-name">${esc(c.name)}</span></a>`; }).join(""); }
function renderServices() { $("svcGrid").innerHTML = SERVICES.map((s,i) => `<button class="svc-card" data-svc="${i}"><span class="svc-ic"><svg class="ic" viewBox="0 0 24 24">${s.ic}</svg></span><strong>${esc(s.t)}</strong><span class="svc-d">${esc(s.d)}</span></button>`).join(""); }
function renderChips() { const cats = state.categories || []; $("catChips").innerHTML = `<button class="chip ${state.catFilter === "all" ? "active" : ""}" data-cat="all">All</button>` + cats.map(c => `<button class="chip ${state.catFilter === c.id ? "active" : ""}" data-cat="${c.id}">${esc(c.name)}</button>`).join(""); const c = cats.find(x => x.id === state.catFilter); $("prodTitle").textContent = c ? c.name : "All Products"; $("prodSub").textContent = c ? (c.description || "Collection") : "Our full collection"; }

function matchesFilters(p) { 
  if (state.catFilter !== "all" && p.categoryId !== state.catFilter) return false; 
  if (state.search) { 
    const q = state.search.toLowerCase(); 
    const inName = (p.name||"").toLowerCase().includes(q);
    const inDesc = (p.description||"").toLowerCase().includes(q);
    const inKw = Array.isArray(p.keywords) && p.keywords.some(k => (k||"").toLowerCase().includes(q));
    if (!inName && !inDesc && !inKw) return false; 
  } 
  return true; 
}

function sentinel(stateTxt) { const s = $("scrollSentinel"); if (!s) return; s.innerHTML = stateTxt === "loading" ? `<div class="sk-line w60" style="margin:0 auto"></div>` : stateTxt === "error" ? `<button class="btn-ghost2" id="retryBtn">Retry</button>` : stateTxt === "end" ? `<p class="muted" style="text-align:center">❀ सबै products हेरिसक्नुभयो</p>` : stateTxt === "empty" ? `<p class="muted" style="text-align:center">❀ कुनै product भेटिएन</p>` : ""; const r = $("retryBtn"); if (r) r.addEventListener("click", () => loadProductsPage(false)); }
async function loadProductsPage(reset) {
  if (state.pq.loading) return;
  if (!reset && state.pq.done) return;
  if (reset) { state.products = []; state.pq = { last: null, done: false, loading: false }; $("productGrid").innerHTML = ""; }
  state.pq.loading = true; sentinel("loading");
  try {
    let q = db.collection("products").limit(PAGE_SIZE);
    if (state.pq.last) q = q.startAfter(state.pq.last);
    const snap = await q.get();
    if (snap.empty) { state.pq.done = true; }
    else {
      state.pq.last = snap.docs[snap.docs.length - 1];
      if (snap.size < PAGE_SIZE) state.pq.done = true;
      const batch = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      const visible = batch.filter(p => p.isActive && matchesFilters(p));
      visible.sort((a,b) => ((a.displayOrder??0)-(b.displayOrder??0)) || String(a.name||"").localeCompare(String(b.name||"")));
      assignSlugsInPlace(visible);
      const fresh = visible.filter(p => !state.products.some(x => x.id === p.id));
      state.products = state.products.concat(fresh);
      $("productGrid").insertAdjacentHTML("beforeend", fresh.map(productCard).join(""));
      if (visible.length === 0 && !state.pq.done) { state.pq.loading = false; return loadProductsPage(false); }
    }
    sentinel(state.products.length === 0 ? "empty" : state.pq.done ? "end" : "");
    renderCollections();
    renderHeroVisual();
  } catch (e) { sentinel("error"); }
  state.pq.loading = false;
}
async function searchAll(q) {
  state.searchMode = true;
  try {
    const snap = await db.collection("products").where("isActive", "==", true).limit(100).get();
    const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    assignSlugsInPlace(all);
    state.products = all.filter(p => matchesFilters(p));
    $("productGrid").innerHTML = state.products.length ? state.products.map(productCard).join("") : `<p class="muted" style="grid-column:1/-1;text-align:center">❀ "${esc(q)}" को लागि कुनै product भेटिएन। "Birthday Frame" वा "Frame" खोज्नुहोस्।</p>`;
  } catch (e) { $("productGrid").innerHTML = `<p class="muted" style="grid-column:1/-1;text-align:center">Search load हुन सकेन। <button class="btn-ghost2" onclick="location.reload()">Retry</button></p>`; }
  sentinel("");
}
function sizePriceFor(p, s) { return (p.sizePrices && p.sizePrices[s.id] != null) ? p.sizePrices[s.id] : (s.price || 0); }
function sizePriceText(p, s) { const v = (p.sizePrices && p.sizePrices[s.id] != null) ? p.sizePrices[s.id] : (s.price != null ? s.price : 0); return v ? fmtMoney(v) : ""; }
function shortName(n) {
  const t = (n || "").trim();
  return t.toLowerCase().endsWith("photo studio") ? (t.slice(0, -12).trim() || t) : (t.split(" ")[0] || t);
}
function productCard(p) {
  const img = imgUrl(p.imageUrl); const fav = state.favs.includes(p.id); const msg = productWaMsg(p); const wa = waHrefMsg(msg, waNumber()); const cat = (state.categories||[]).find(x => x.id === p.categoryId);
  return `<article class="p-card" data-id="${p.id}">
    <div class="p-media">${img ? `<img src="${img}" alt="${esc(p.name)} - Laligurans Photo Studio" loading="lazy" decoding="async">` : `<div class="p-noimg">${CAM}</div>`}
      <button class="p-fav ${fav ? "on" : ""}" data-fav="${p.id}" aria-label="Add to wishlist">${HEART}</button>
      ${p.isFeatured ? `<span class="badge gold float">★ Featured</span>` : ""}
    </div>
    <div class="p-body">
      <span class="p-cat">${cat ? esc(cat.name.toUpperCase()) : "SERVICE"}</span>
      <strong class="p-name">${esc(p.name)}</strong>
      ${(p.sizeIds||[]).length ? `<div class="p-sizes">${p.sizeIds.map(id => { const s = (state.sizes||[]).find(x => x.id === id); const pr = p.sizePrices && p.sizePrices[id]; return `<span class="p-size">${s ? esc(s.name) : ""}${pr != null ? " · " + fmtMoney(pr) : ""}</span>`; }).join("")}</div>` : ""}
      <div class="p-foot"><span class="p-price">${fmtMoney(p.price)}</span><a class="p-wa" href="${wa}" data-wa-msg="${esc(msg)}">Order</a></div>
      <div class="p-extra"><a class="p-detail" href="/product/${p.slug||""}">View Details ›</a><button class="p-share" data-cart="${p.id}" aria-label="Add to cart">${BAG}</button><button class="p-share" data-share="${p.slug||""}" aria-label="Share">${SHARE_SVG}</button></div>
      ${p.isAvailable === false ? `<span class="badge red">Currently unavailable</span>` : ""}
    </div>
  </article>`;
}
function renderHeroVisual() { const imgs = []; (state.gallery||[]).forEach(g => { const u = imgUrl(g.imageUrl); if (u && imgs.length < 2) imgs.push(u); }); if (!imgs.length) (state.products||[]).forEach(p => { const u = imgUrl(p.imageUrl); if (u && imgs.length < 2) imgs.push(u); }); $("heroVisual").innerHTML = imgs.length ? `<span class="frame f1"><img src="${imgs[0]}" alt="" loading="eager" decoding="async" fetchpriority="high"></span>${imgs[1] ? `<span class="frame f2"><img src="${imgs[1]}" alt="" loading="lazy" decoding="async"></span>` : ""}<span class="lens-deco"></span>` : `<span class="frame f1 motif"><i class="fl big">❀</i></span>`; }
function syncPmFav() { const b = $("pmFav"); if (b && state.pmId) b.classList.toggle("on", state.favs.includes(state.pmId)); const pp = $("ppFav"); if (pp && state.pmId) pp.classList.toggle("on", state.favs.includes(state.pmId)); }

function pushRecent(p) { try { let r = JSON.parse(localStorage.getItem("lgs_recent") || "[]"); r = r.filter(x => x.id !== p.id); r.unshift({ id: p.id, name: p.name, price: p.price, img: imgUrl(p.imageUrl), slug: p.slug }); r = r.slice(0, 8); localStorage.setItem("lgs_recent", JSON.stringify(r)); } catch {} }
function renderRecent() { try { const r = JSON.parse(localStorage.getItem("lgs_recent") || "[]"); const el = $("recentRow"); if (!el) return; if (!r.length) { el.parentElement.hidden = true; return; } el.parentElement.hidden = false; el.innerHTML = r.map(x => `<a class="recent-card" href="/product/${x.slug||""}">${x.img ? `<img src="${x.img}" alt="${esc(x.name)}" loading="lazy">` : `<div class="p-noimg">${CAM}</div>`}<span>${esc(x.name)}</span><b>${fmtMoney(x.price)}</b></a>`).join(""); } catch {} }

async function renderRelated(p) {
  const el = $("ppRelated"); if (!el) return;
  if (!p || !p.id) { el.parentElement.hidden = true; return; }
  let rel = state.products.filter(x => x.id !== p.id && x.categoryId === p.categoryId).slice(0, 4);
  if (rel.length === 0 && db && p.categoryId) {
    try {
      const snap = await db.collection("products").where("categoryId", "==", p.categoryId).where("isActive", "==", true).limit(5).get();
      rel = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(x => x.id !== p.id).slice(0, 4);
      assignSlugsInPlace(rel);
    } catch (e) {}
  }
  el.parentElement.hidden = rel.length === 0;
  el.innerHTML = rel.map(productCard).join("");
}

function openProductModal(p) { state.pmId = p.id; const img = imgUrl(p.imageUrl); $("pmImgWrap").innerHTML = img ? `<img src="${img}" alt="${esc(p.name)}">` : `<div class="p-noimg">${CAM}</div>`; const cat = (state.categories||[]).find(x => x.id === p.categoryId); $("pmCat").textContent = cat ? cat.name.toUpperCase() : "SERVICE"; $("pmName").textContent = p.name; $("pmDesc").textContent = p.description || ""; $("pmSizes").innerHTML = (p.sizeIds||[]).length ? `<p class="eyebrow">AVAILABLE SIZES</p>` + p.sizeIds.map(id => { const s = (state.sizes||[]).find(x => x.id === id); if (!s) return ""; return `<div class="pm-size"><span>${esc(s.name)}${s.dimensions ? " (" + esc(s.dimensions) + ")" : ""}</span><span>${sizePriceText(p, s)}</span></div>`; }).join("") : ""; $("pmPrice").textContent = fmtMoney(p.price); setWa($("pmWa"), productWaMsg(p)); $("pmAvail").innerHTML = (p.isAvailable === false ? `<span class="badge red">Currently unavailable</span> ` : "") + (p.isFeatured ? `<span class="badge gold">★ Featured</span>` : ""); syncPmFav(); $("productModal").hidden = false; }
function renderGallery() { const el = $("galleryGrid"); if (!state.gallery) { el.innerHTML = `<div class="g-item"><div class="sk-img" style="aspect-ratio:1"></div></div>`.repeat(4); return; } state.lbList = []; const html = state.gallery.map(g => { const img = imgUrl(g.imageUrl); if (!img) return ""; const idx = state.lbList.push({ img, title: g.title || "" }) - 1; return `<div class="g-item" data-idx="${idx}"><img src="${img}" alt="${esc(g.title||"gallery")}" loading="lazy" decoding="async"></div>`; }).join(""); el.innerHTML = html || `<p class="muted">❀ Gallery coming soon.</p>`; }
function openLightbox(i) { state.lbIndex = i; const it = state.lbList[i]; if (!it) return; $("lightboxImg").src = it.img; $("lightboxImg").alt = it.title || "Gallery photo"; $("lightboxCount").textContent = `${i+1} / ${state.lbList.length}`; $("lightbox").hidden = false; }
function lbNav(d) { if (!state.lbList.length) return; state.lbIndex = (state.lbIndex + d + state.lbList.length) % state.lbList.length; openLightbox(state.lbIndex); }
function renderHours() { const now = ktNow(); const src = (state.hours && state.hours.days) ? state.hours : DEFAULT_HOURS; const days = src.days || {}; $("hoursTable").innerHTML = DAYS.map(([k, l]) => { const d = days[k]; const closed = !(d && d.open); return `<div class="h-row ${k === now.day ? "today" : ""} ${closed ? "closed" : ""}"><span>${l}</span><span>${closed ? "Closed" : `${fmt12(d.opens)} – ${fmt12(d.closes)}`}</span></div>`; }).join(""); refreshBadge(); }
function setLink(id, href) { const el = $(id); if (!el) return; if (href) { el.href = href; el.hidden = false; } else el.hidden = true; }

/* ===== renderStore (v13.2) — phone/email/WhatsApp/map सबै admin बाट ===== */
function renderStore() {
  const s = state.store || {};
  const name = s.name || "Laligurans Photo Studio";
  const tag = s.tagline || DEFAULT_TAG;
  const parts = String(tag).split(",").map(x => x.trim());
  const phDisplay = storePhoneDisplay();
  const phTel = storePhoneTel();
  const em = (s.email || "").trim() || CONTACT.email;
  $("brandName").textContent = name;
$("drawerName").textContent = name;
  $("heroKicker").innerHTML = `<i class="fl">❀</i> WELCOME TO ${esc(name.toUpperCase())}`;
  $("tagLine1").textContent = parts[0] || tag;
  $("tagLine2").textContent = parts[1] || "";
  $("heroSub").textContent = s.about || "Premium photography, prints and frames.";
  $("greetBadge").textContent = greeting();
  $("dPhone").textContent = phDisplay;
  $("dCall").href = phTel;
  $("dWaPhone").textContent = "+" + waNumber();
  setWa($("dWa"), generalWaMsg());
  const mq = s.address || name;
  const embSrc = ((s.mapEmbedCode || "").match(/src=["']([^"']+)["']/) || [])[1] || "";
  const mapSrc = embSrc || ("https://www.google.com/maps?q=" + encodeURIComponent(mq) + "&output=embed");
  setLink("cMap", safeUrl(s.mapUrl) || ("https://www.google.com/maps?q=" + encodeURIComponent(mq)));
  $("footName").textContent = name;;
  $("footTag").textContent = tag;
  $("footAddr").textContent = s.address || "";
  $("footPhone").href = phTel;
  $("footPhone").textContent = phDisplay;
  setWa($("footWa"), generalWaMsg());
  $("footMail").href = "mailto:" + em;
  $("footMail").textContent = em;
  setLink("sFb", safeUrl(s.facebook));
  setLink("sIg", safeUrl(s.instagram));
  setLink("sTk", safeUrl(s.tiktok));
  $("footCopy").textContent = `© ${new Date().getFullYear()} ${name}. All rights reserved.`;
  if (mapSrc !== state.mapQ) { state.mapQ = mapSrc; $("mapFrame").src = mapSrc; }
  if (location.pathname === "/" || location.pathname === "") {
    const homeUrl = location.origin + "/";
    setSeo({ title: name + " — Photo Studio", desc: tag, image: location.origin + "/logo.png", url: homeUrl });
    setJsonLd({ "@context":"https://schema.org","@type":"LocalBusiness", name, slogan: tag, telephone: phDisplay, email: em, address: s.address || "", sameAs: [safeUrl(s.facebook), safeUrl(s.instagram), safeUrl(s.tiktok)].filter(Boolean) });
  }
}

function showLanding() { hideRouteLoader(); $("landingMain").hidden = false; $("productView").hidden = true; $("categoryView").hidden = true; $("aboutView").hidden = true; $("propView").hidden = true; const rs = $("relSec"); if (rs) rs.hidden = true; renderRecent(); }

function showInfoPage(kind) {
  hideRouteLoader();
  $("landingMain").hidden = true; $("productView").hidden = true; $("categoryView").hidden = true;
  $("aboutView").hidden = kind !== "about";
  $("propView").hidden = kind !== "proprietor";
  const rs = $("relSec"); if (rs) rs.hidden = true;
  if (kind === "about") setSeo({ title: "About Us | Laligurans Photo Studio", desc: "करिब ३० वर्षदेखि स्थानीय ग्राहकको विश्वाससँग जोडिएको यात्रा।", image: location.origin + "/logo.png", url: location.origin + "/about" });
  else setSeo({ title: "Proprietor | Laligurans Photo Studio", desc: "सूर्यलाल श्रेष्ठ — प्रोप्राइटर, Laligurans Photo Studio।", image: location.origin + "/proprietor.png", url: location.origin + "/proprietor" });
  window.scrollTo(0,0);
}

async function findProductBySlug(slug) {
  let p = state.products.find(x => x.slug === slug);
  if (p) return p;
  try {
    const snap = await db.collection("products").where("slug", "==", slug).where("isActive", "==", true).limit(1).get();
    if (!snap.empty) { 
      p = { id: snap.docs[0].id, ...snap.docs[0].data() }; 
      assignSlugsInPlace([p]); 
      state.products.push(p);
      return p;
    }
  } catch (e) {}
  try {
    const allSnap = await db.collection("products").where("isActive", "==", true).limit(500).get();
    if (!allSnap.empty) {
      const allProds = allSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      allProds.sort((a,b) => ((a.createdAt?.toMillis?.()||0) - (b.createdAt?.toMillis?.()||0)));
      const used = {};
      for (const prod of allProds) {
        let s = prod.slug;
        if (!s) {
          let base = slugify(prod.name), n = 2;
          s = base;
          while (used[s]) { s = base + "-" + n; n++; }
        }
        while (used[s]) { s = s + "-2"; }
        used[s] = true;
        prod.slug = s;
      }
      p = allProds.find(x => x.slug === slug);
      if (p) return p;
    }
  } catch (e) { console.error("findProductBySlug fallback error:", e); }
  return null;
}

async function showProductPage(slug) {
  const p = await findProductBySlug(slug);
  if (!p) { showLanding(); return; }
  hideRouteLoader();
  $("landingMain").hidden = true; $("categoryView").hidden = true; $("aboutView").hidden = true; $("propView").hidden = true; $("productView").hidden = false;
  state.pmId = p.id; state.pmSize = null;
  const img = imgUrl(p.imageUrl); const cat = (state.categories||[]).find(x => x.id === p.categoryId);
  $("ppImg").src = img || ""; $("ppImg").alt = `${p.name} - Laligurans Photo Studio`; $("ppImg").setAttribute("fetchpriority", "high");
  const cr = $("ppCrumb"); if (cr) cr.innerHTML = `<a href="/">Home</a> › <a href="/category/${cat ? catSlug(cat) : ""}">${cat ? esc(cat.name) : "Products"}</a> › <span>${esc(p.name)}</span>`;
  $("ppCat").textContent = cat ? cat.name.toUpperCase() : "SERVICE";
  $("ppName").textContent = p.name;
  $("ppDesc").textContent = p.description || "";
  $("ppSizes").innerHTML = (p.sizeIds||[]).length ? `<p class="eyebrow">AVAILABLE SIZES (tap to select)</p>` + p.sizeIds.map(id => { const s = (state.sizes||[]).find(x => x.id === id); if (!s) return ""; return `<div class="pm-size" data-size="${id}" style="cursor:pointer"><span>${esc(s.name)}${s.dimensions ? " (" + esc(s.dimensions) + ")" : ""}</span><span>${sizePriceText(p, s)}</span></div>`; }).join("") : "";
  $("ppPrice").textContent = fmtMoney(p.price);
  $("ppAvail").innerHTML = p.isAvailable === false ? `<span class="badge red">Currently unavailable</span>` : `<span class="badge green">Available</span>`;
  syncPmFav();
  setWa($("ppWa"), productWaMsg(p));
  const url = location.origin + "/product/" + p.slug;
  setSeo({ title: `${p.name} | Laligurans Photo Studio`, desc: p.description || `${p.name} from Laligurans Photo Studio.`, image: img, url, type: "product" });
  renderRelated(p); pushRecent(p); renderRecent();
  window.scrollTo(0,0);
}
async function showCategoryPage(slug) {
  const c = (state.categories||[]).find(x => catSlug(x) === slug);
  if (!c) { showLanding(); return; }
  hideRouteLoader();
  $("landingMain").hidden = true; $("productView").hidden = true; $("categoryView").hidden = false; $("aboutView").hidden = true; $("propView").hidden = true;
  const rs = $("relSec"); if (rs) rs.hidden = true;
  $("cvName").textContent = c.name; $("cvDesc").textContent = c.description || "";
  let items = state.products.filter(p => p.categoryId === c.id);
  if (items.length === 0 && db) {
    try {
      const snap = await db.collection("products").where("categoryId", "==", c.id).where("isActive", "==", true).limit(100).get();
      items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      assignSlugsInPlace(items);
    } catch (e) {}
  }
  $("cvGrid").innerHTML = items.length ? items.map(productCard).join("") : `<p class="muted">❀ यस category मा अहिले कुनै product छैन।</p>`;
  const url = location.origin + "/category/" + slug;
  setSeo({ title: `${c.name} | Laligurans Photo Studio`, desc: c.description || `Explore ${c.name} from Laligurans Photo Studio.`, image: "", url });
  window.scrollTo(0,0);
}
function route() {
  const path = location.pathname;
  const m = path.match(/^\/product\/([^\/]+)\/?$/);
  const c = path.match(/^\/category\/([^\/]+)\/?$/);
  if (m) showProductPage(decodeURIComponent(m[1]));
  else if (c) showCategoryPage(decodeURIComponent(c[1]));
  else if (/^\/about\/?$/.test(path)) showInfoPage("about");
  else if (/^\/proprietor\/?$/.test(path)) showInfoPage("proprietor");
  else showLanding();
}

function openShare(p) { state.share = { url: location.origin + "/product/" + p.slug, title: `${p.name} | Laligurans Photo Studio`, msg: `${storeName()}\n\n${p.name}\nPrice: ${fmtMoney(p.price)}\n\nView Product:` }; if (navigator.share) { navigator.share({ title: state.share.title, text: state.share.msg, url: state.share.url }).catch(() => {}); return; } $("shareTitle").textContent = p.name; $("shNative").hidden = true; $("shareModal").hidden = false; }
function openDrawer(id) { $(id).classList.add("open"); $("backdrop").hidden = false; }
function closeDrawers() { $("drawer").classList.remove("open"); $("favDrawer").classList.remove("open"); $("cartDrawer").classList.remove("open"); $("backdrop").hidden = true; }

function bindLive() {
  db.collection("categories").onSnapshot(s => { state.categories = s.docs.map(d => ({ id: d.id, ...d.data() })).filter(c => c.isActive).sort((a,b) => (a.displayOrder??0)-(b.displayOrder??0)); renderDrawer(); renderChips(); renderCollections(); }, () => {});
  db.collection("sizes").onSnapshot(s => { state.sizes = s.docs.map(d => ({ id: d.id, ...d.data() })).filter(x => x.isActive).sort((a,b) => (a.displayOrder??0)-(b.displayOrder??0)); }, () => {});
  db.collection("gallery").onSnapshot(s => { state.gallery = s.docs.map(d => ({ id: d.id, ...d.data() })).filter(g => g.published).sort((a,b) => (b.createdAt?.toMillis?.()||0) - (a.createdAt?.toMillis?.()||0)); renderGallery(); renderHeroVisual(); }, () => {});
  db.collection("announcements").onSnapshot(s => { state.announcements = s.docs.map(d => ({ id: d.id, ...d.data() })); renderAnnouncements(); }, () => {});
  db.collection("storeInfo").doc("main").onSnapshot(s => { state.store = s.exists ? s.data() : null; renderStore(); }, () => {});
  db.collection("businessHours").doc("weekly").onSnapshot(s => { state.hours = s.exists ? s.data() : null; renderHours(); }, () => {});
  db.collection("products").limit(1).onSnapshot(s => { if (!s.metadata.fromCache && state._loadedOnce && !location.pathname.startsWith("/product/")) { loadProductsPage(true); } state._loadedOnce = true; }, () => {});
}

function bootFromSSR() {
  const el = document.getElementById("ssrBoot");
  if (!el) return false;
  try {
    const d = JSON.parse(el.textContent);
    if (d.categories) state.categories = d.categories;
    if (d.sizes) state.sizes = d.sizes;
    if (d.gallery) state.gallery = d.gallery;
    if (d.announcements) state.announcements = d.announcements;
    if (d.store) state.store = d.store;
    if (d.hours) state.hours = d.hours;
    if (Array.isArray(d.products) && d.products.length) { state.products = d.products; state._ssr = true; }
    return true;
  } catch (e) { return false; }
}

function init() {
  const rl = $("routeLoader");
  const isProductPath = location.pathname.startsWith("/product/") || location.pathname.startsWith("/category/");
  const isInfoPath = /^\/(about|proprietor)\/?$/.test(location.pathname);
  const ssrPresent = isProductPath && $("ppName") && $("ppName").textContent && $("ppName").textContent.trim() !== "";

  if (isInfoPath) {
    $("landingMain").hidden = true;
    hideRouteLoader();
  } else if (isProductPath && !ssrPresent) {
    $("landingMain").hidden = true;
    if (rl) rl.hidden = false;
  } else if (ssrPresent) {
    $("landingMain").hidden = true;
    $("productView").hidden = false;
    hideRouteLoader();
  }

  setTimeout(() => {
    const l = $("routeLoader");
    if (l && !l.hidden) {
      l.hidden = true;
      if (!location.pathname.startsWith("/product/") && !location.pathname.startsWith("/category/") && !isInfoPath) { $("landingMain").hidden = false; }
    }
  }, 6000);

  loadFavs(); favCount();
  loadCart(); cartCount();
  applyTheme(localStorage.getItem("lgs_theme") || "light", false);
  renderServices();

  if (bootFromSSR()) {
    renderDrawer(); renderChips(); renderCollections(); renderGallery(); renderHeroVisual(); renderAnnouncements(); renderStore(); renderHours();
    if (state._ssr && !isProductPath && !isInfoPath) {
      $("productGrid").innerHTML = state.products.filter(p => matchesFilters(p)).map(productCard).join("");
      sentinel("");
    }
  }

  updateNow(); setInterval(updateNow, 30000);
  window.addEventListener("scroll", () => { $("siteHead").classList.toggle("scrolled", window.scrollY > 8); }, { passive: true });

  document.addEventListener("click", e => { const a = e.target.closest("a.p-wa"); if (!a) return; e.preventDefault(); waOpen(a.dataset.waMsg || "", a.dataset.waDigits || ""); });
  document.addEventListener("click", e => { const b = e.target.closest("[data-share]"); if (!b) return; e.stopPropagation(); const p = state.products.find(x => x.slug === b.dataset.share); if (p) openShare(p); });
  document.addEventListener("click", e => { const b = e.target.closest("[data-cart]"); if (!b) return; addToCart(b.dataset.cart, null); });
  document.addEventListener("click", e => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest("a"); if (!a) return;
    const href = a.getAttribute("href") || ""; if (!href || href.startsWith("#")) return;
    let url; try { url = new URL(href, location.origin); } catch { return; }
    if (url.origin !== location.origin) return;
    let p = url.pathname;
    p = (p !== "/" ) ? (p.replace(/\/+$/, "") || "/") : p;
    if (p.startsWith("/product/") || p.startsWith("/category/") || p === "/" || p === "/about" || p === "/proprietor") { e.preventDefault(); history.pushState({}, "", p + (url.hash || "")); route(); if (url.hash) { const el = document.querySelector(url.hash); if (el) el.scrollIntoView({ behavior: "smooth" }); } }
  });
  window.addEventListener("popstate", () => route());

  $("navToggle").addEventListener("click", () => openDrawer("drawer"));
  $("favToggle").addEventListener("click", () => { renderFavs(); openDrawer("favDrawer"); });
  $("cartToggle").addEventListener("click", () => { renderCart(); openDrawer("cartDrawer"); });
  $("cartClose").addEventListener("click", closeDrawers);
  $("cartList").addEventListener("click", e => { const q = e.target.closest("[data-cq]"); if (q) { cartChange(q.dataset.key, +q.dataset.cq); return; } const r = e.target.closest("[data-crm]"); if (r) cartRemove(r.dataset.crm); });
  $("cartWa").addEventListener("click", () => { if (state.cart.length) waOpen(cartWaMsg()); });
  $("drawerClose").addEventListener("click", closeDrawers);
  $("favClose").addEventListener("click", closeDrawers);
  $("backdrop").addEventListener("click", closeDrawers);
  $("themeToggle").addEventListener("click", () => { const next = state.theme === "dark" ? "light" : state.theme === "light" ? "system" : "dark"; applyTheme(next); });
  $("searchToggle").addEventListener("click", () => { if ($("landingMain").hidden) { location.href = "/"; return; } const b = $("searchBar"); b.hidden = !b.hidden; if (!b.hidden) $("searchInput").focus(); });
  $("searchInput").addEventListener("input", debounce(async e => { const q = e.target.value.trim(); state.search = q; if (!q) { state.searchMode = false; loadProductsPage(true); } else { await searchAll(q); } }, 300));

  $("aboutBtn").addEventListener("click", () => { history.pushState({}, "", "/about"); route(); });
  $("aboutClose").addEventListener("click", () => { $("aboutModal").hidden = true; });
  $("aboutModal").addEventListener("click", e => { if (e.target === $("aboutModal")) $("aboutModal").hidden = true; });
  $("propCard").addEventListener("click", () => { history.pushState({}, "", "/proprietor"); route(); });
  $("propClose").addEventListener("click", () => { $("propModal").hidden = true; });
  $("propModal").addEventListener("click", e => { if (e.target === $("propModal")) $("propModal").hidden = true; });
  $("propWa").addEventListener("click", () => { waOpen(`Namaste ${PROP.name} jyu! (Laligurans Photo Studio website बाट)`, PROP.waDigits); });
  const pw2 = $("propWa2"); if (pw2) pw2.addEventListener("click", () => { waOpen(`Namaste ${PROP.name} jyu! (Laligurans Photo Studio website बाट)`, PROP.waDigits); });

  $("svcGrid").addEventListener("click", e => { const b = e.target.closest(".svc-card"); if (!b) return; document.querySelectorAll(".svc-card").forEach(x => x.classList.toggle("active", x === b)); const s = SERVICES[+b.dataset.svc]; $("svcName").textContent = s.t; setWa($("svcWa"), `Namaste ${storeName()}! I would like to know more about: ${s.t}`); $("svcActions").hidden = false; });

  $("catChips").addEventListener("click", e => { const b = e.target.closest(".chip"); if (!b) return; state.catFilter = b.dataset.cat; state.search = ""; $("searchInput").value = ""; renderChips(); renderDrawer(); state.searchMode = false; loadProductsPage(true); });
  $("colGrid").addEventListener("click", e => { const b = e.target.closest(".col-card"); if (!b) return; e.preventDefault(); e.stopPropagation(); state.catFilter = b.dataset.col; renderChips(); renderDrawer(); loadProductsPage(true); document.getElementById("services").scrollIntoView({ behavior: "smooth" }); });
  $("drawerCats").addEventListener("click", e => { const b = e.target.closest(".d-cat"); if (!b) return; state.catFilter = b.dataset.cat; renderChips(); renderDrawer(); loadProductsPage(true); closeDrawers(); document.getElementById("services").scrollIntoView({ behavior: "smooth" }); });
  $("favList").addEventListener("click", e => { const b = e.target.closest("[data-favgo]"); if (!b) return; closeDrawers(); document.getElementById("services").scrollIntoView(); });

  $("ppSizes").addEventListener("click", e => { const b = e.target.closest("[data-size]"); if (!b) return; state.pmSize = state.pmSize === b.dataset.size ? null : b.dataset.size; Array.from($("ppSizes").querySelectorAll(".pm-size")).forEach(x => x.classList.toggle("sel", x.dataset.size === state.pmSize)); });
  const _ppc = $("ppCart"); if (_ppc) _ppc.addEventListener("click", () => { if (state.pmId) addToCart(state.pmId, state.pmSize || null); });

  $("productGrid").addEventListener("click", e => { const f = e.target.closest("[data-fav]"); if (f) { toggleFav(f.dataset.fav); return; } if (e.target.closest("[data-share]")) return; if (e.target.closest("[data-cart]")) return; if (e.target.closest("a")) return; const card = e.target.closest(".p-card"); if (card && card.dataset.id) { const p = state.products.find(x => x.id === card.dataset.id); if (p) openProductModal(p); } });
  $("pmClose").addEventListener("click", () => { $("productModal").hidden = true; state.pmId = null; });
  $("pmFav").addEventListener("click", () => { if (state.pmId) toggleFav(state.pmId); });
  $("productModal").addEventListener("click", e => { if (e.target === $("productModal")) { $("productModal").hidden = true; state.pmId = null; } });
  $("ppFav").addEventListener("click", () => { if (state.pmId) toggleFav(state.pmId); });
  $("ppShare").addEventListener("click", () => { const p = state.products.find(x => x.id === state.pmId); if (p) openShare(p); });
  $("cvShare").addEventListener("click", () => { const slug = location.pathname.split("/").pop(); const c = (state.categories||[]).find(x => catSlug(x) === slug); if (!c) return; state.share = { url: location.origin + "/category/" + slug, title: `${c.name} | Laligurans Photo Studio`, msg: `${storeName()}\n\n${c.name}\n\nView Collection:` }; $("shareTitle").textContent = c.name; $("shNative").hidden = !navigator.share; $("shareModal").hidden = false; });

  $("shareClose").addEventListener("click", () => { $("shareModal").hidden = true; });
  $("shareModal").addEventListener("click", e => { if (e.target === $("shareModal")) $("shareModal").hidden = true; });
  $("shNative").addEventListener("click", () => { if (navigator.share && state.share) navigator.share({ title: state.share.title, text: state.share.msg, url: state.share.url }).catch(() => {}); });
  $("shCopy").addEventListener("click", async () => { if (!state.share) return; try { await navigator.clipboard.writeText(state.share.url); } catch (e) { const t = document.createElement("textarea"); t.value = state.share.url; document.body.appendChild(t); t.select(); document.execCommand("copy"); t.remove(); } toast("Product link copied!"); });
  $("shWa").addEventListener("click", () => { if (state.share) window.open("https://wa.me/?text=" + encodeURIComponent(state.share.msg + "\n" + state.share.url), "_blank", "noopener"); });
  $("shFb").addEventListener("click", async () => {
    if (!state.share) return;
    if (navigator.share) {
      try { await navigator.share({ title: state.share.title, text: state.share.title, url: state.share.url }); return; } catch (e) { if (e && e.name === "AbortError") return; }
    }
    try { await navigator.clipboard.writeText(state.share.url); toast("Link copied! Facebook मा paste गर्नुहोस्।"); } catch (e) { toast("Copy Link button प्रयोग गर्नुहोस्।"); }
    window.open("https://www.facebook.com/", "_blank", "noopener");
  });
  $("shTg").addEventListener("click", () => { if (state.share) window.open("https://t.me/share/url?url=" + encodeURIComponent(state.share.url) + "&text=" + encodeURIComponent(state.share.title), "_blank", "noopener"); });

  $("galleryGrid").addEventListener("click", e => { const it = e.target.closest(".g-item"); if (!it || it.dataset.idx == null) return; openLightbox(+it.dataset.idx); });
  $("lightboxClose").addEventListener("click", () => { $("lightbox").hidden = true; });
  $("lbPrev").addEventListener("click", () => lbNav(-1));
  $("lbNext").addEventListener("click", () => lbNav(1));
  let lbX = null;
  $("lightbox").addEventListener("touchstart", e => { lbX = e.touches[0].clientX; }, { passive: true });
  $("lightbox").addEventListener("touchend", e => { if (lbX == null) return; const dx = e.changedTouches[0].clientX - lbX; if (dx > 48) lbNav(-1); else if (dx < -48) lbNav(1); lbX = null; }, { passive: true });
  $("lightbox").addEventListener("click", e => { if (e.target === $("lightbox")) $("lightbox").hidden = true; });
  document.addEventListener("keydown", e => { if (e.key === "Escape") { $("lightbox").hidden = true; $("productModal").hidden = true; $("propModal").hidden = true; $("aboutModal").hidden = true; $("shareModal").hidden = true; closeDrawers(); } if (!$("lightbox").hidden && e.key === "ArrowRight") lbNav(1); if (!$("lightbox").hidden && e.key === "ArrowLeft") lbNav(-1); });
  revealize();

  if (typeof firebase === "undefined") { if (!state._ssr) $("productGrid").innerHTML = `<p class="muted">Loading failed. Internet जाँच गर्नुहोस्।</p>`; return; }
  firebase.initializeApp(firebaseConfig);
  db = firebase.firestore();
  bindLive();
  if (!state._ssr) loadProductsPage(true);
  route();
  if ("IntersectionObserver" in window) { const ss = $("scrollSentinel"); if (ss) new IntersectionObserver(en => { if (en[0].isIntersecting) loadProductsPage(false); }, { rootMargin: "300px" }).observe(ss); }
  /* v13.3: exact-time status flip — हर 1 सेकेन्डमा check, 9:00/6:00 को ठीक समयमा flip */
  setInterval(() => { refreshBadge(); }, 1000);
  setInterval(() => { $("greetBadge").textContent = greeting(); }, 30000);
}
document.addEventListener("DOMContentLoaded", init);
