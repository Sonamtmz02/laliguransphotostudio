/* LALIGURANS PWA service worker - safe shell cache only (pages/SSR लाई छुँदैन) */
const CACHE = "lgs-shell-v1";

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(c =>
      Promise.allSettled([
        c.add("/logo.png"),
        c.add("https://www.gstatic.com/firebasejs/10.12.5/firebase-app-compat.js"),
        c.add("https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore-compat.js")
      ])
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  const sameOrigin = url.origin === self.location.origin;
  const isCssJs = sameOrigin && (url.pathname === "/script.js" || url.pathname === "/style.css");
  const isStatic = (sameOrigin && url.pathname === "/logo.png") || url.hostname === "www.gstatic.com";

  /* pages, /img/, firestore लाई छुँदैन — SSR सधैं fresh रहन्छ */
  if (!isCssJs && !isStatic) return;

  if (isCssJs) {
    /* network-first: नयाँ deploy तुरुन्तै, offline मा cache fallback */
    e.respondWith(
      fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
        return res;
      }).catch(() => caches.match(req))
    );
  } else {
    /* cache-first: logo + firebase CDN (immutable) */
    e.respondWith(
      caches.match(req).then(hit => hit || fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
        return res;
      }))
    );
  }
});
