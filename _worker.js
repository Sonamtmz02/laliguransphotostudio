/* LALIGURANS edge router v16 - SSR links + security headers + instant cache + enhanced sitemap */
const PROJECT_ID = "laligurans-photo-studio";
const API_KEY = "AIzaSyAopefoW6m7RYV_HkN1rzHqMsN4tN0HJ8I";
const ADMIN_BASE = "https://laligurans-admin.pages.dev";
const WA_DIGITS = "9779768385368";

const SEC = {
  "strict-transport-security": "max-age=31536000; includeSubDomains",
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
  "x-xss-protection": "0",
  "referrer-policy": "strict-origin-when-cross-origin",
  "permissions-policy": "camera=(), geolocation=(), microphone=(), payment=()",
  "cross-origin-opener-policy": "same-origin",
  "content-security-policy": "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.gstatic.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://firestore.googleapis.com https://identitytoolkit.googleapis.com https://laligurans-admin.pages.dev; frame-src https://www.google.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests"
};
function secHeaders(extra){ return Object.assign({}, SEC, extra || {}); }
async function assetsWithSec(request, env){
  const r = await env.ASSETS.fetch(request);
  const nr = new Response(r.body, r);
  for (const k in SEC) if (!nr.headers.has(k)) nr.headers.set(k, SEC[k]);
  return nr;
}

function esc(s){return String(s??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;");}
function escAttr(s){return esc(s).replaceAll("'","&#39;");}
function slugify(s){return String(s||"").toLowerCase().normalize("NFKD").replace(/[\u0900-\u097F]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"")||"item";}
function fmtMoney(n){return "रु. " + Number(n||0).toLocaleString();}
function sizePriceText(p,s){const v=(p.sizePrices&&p.sizePrices[s.id]!=null)?p.sizePrices[s.id]:(s.price!=null?s.price:0);return v?("रु. "+Number(v).toLocaleString()):"";}
function dv(v){if(v==null)return null;if(v.stringValue!==undefined)return v.stringValue;if(v.integerValue!==undefined)return Number(v.integerValue);if(v.numberValue!==undefined)return Number(v.numberValue);if(v.booleanValue!==undefined)return v.booleanValue;if(v.timestampValue!==undefined)return v.timestampValue;if(v.arrayValue)return(v.arrayValue.values||[]).map(dv);if(v.mapValue)return df(v.mapValue.fields||{});return null;}
function df(f){const o={};for(const k in f)o[k]=dv(f[k]);return o;}
async function fetchDocs(pid,key,coll){let out=[],token="";do{const u=`https://firestore.googleapis.com/v1/projects/${pid}/databases/(default)/documents/${coll}?pageSize=300${token?"&pageToken="+token:""}&key=${key}`;const r=await fetch(u);if(!r.ok)throw new Error("firestore "+r.status);const j=await r.json();for(const d of(j.documents||[])){const o=df(d.fields||{});o.id=d.name.split("/").pop();if(o.createdAt)o.createdAtMs=Date.parse(o.createdAt)||0;out.push(o);}token=j.nextPageToken||"";}while(token);return out;}
async function fetchDoc(pid,key,ref){try{const u=`https://firestore.googleapis.com/v1/projects/${pid}/databases/(default)/documents/${ref}?key=${key}`;const r=await fetch(u);if(!r.ok)return null;const j=await r.json();if(!j.fields)return null;const o=df(j.fields);o.id=j.name.split("/").pop();return o;}catch(e){return null;}}
function assignSlugs(list){const by=[...list].sort((a,b)=>(a.createdAtMs||0)-(b.createdAtMs||0));const used={};for(const p of by){let s=p.slug;if(!s){let base=slugify(p.name),n=2;s=base;while(used[s]){s=base+"-"+n;n++;}}while(used[s]){s=s+"-2";}used[s]=true;p.slug=s;}return list;}
function publicImg(origin,p){if(!p.imageUrl)return "";if(p.imageUrl.startsWith("/api/img/"))return origin+"/img/"+p.imageUrl.replace("/api/img/","");if(p.imageUrl.startsWith("http"))return p.imageUrl;return "";}
function injectCanonical(html,url){
  html=html.replace(/<link[^>]*id=["']canonical["'][^>]*>/,"");
  if(!/rel=["']canonical["']/.test(html)){html=html.replace("</head>",`<link rel="canonical" href="${url}" />\n</head>`);}
  return html;
}

function ssrHomeLinks(payload){
  const prods=[...payload.products].sort((a,b)=>(a.displayOrder||0)-(b.displayOrder||0)||String(a.name||"").localeCompare(String(b.name||""))).slice(0,12);
  return prods.map(p=>{
    const img=p.imageUrl||"";
    return `<article class="p-card"><div class="p-media">${img?`<img src="${escAttr(img)}" alt="${escAttr(p.name)} - Laligurans Photo Studio" loading="lazy" decoding="async">`:`<div class="p-noimg"></div>`}</div><div class="p-body"><strong class="p-name"><a href="/product/${escAttr(p.slug)}">${esc(p.name)}</a></strong><div class="p-foot"><span class="p-price">${fmtMoney(p.price)}</span><a class="p-detail" href="/product/${escAttr(p.slug)}">View Details ›</a></div></div></article>`;
  }).join("");
}
function ssrColLinks(payload){
  return payload.categories.map(c=>`<a class="col-card" href="/category/${escAttr(slugify(c.name))}"><span class="col-name">${esc(c.name)}</span></a>`).join("");
}

async function fetchStamp(coll){
  try{
    const u=`https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/${coll}?pageSize=1&orderBy=${encodeURIComponent("updatedAt DESC")}&mask.fieldPaths=updatedAt&key=${API_KEY}`;
    const r=await fetch(u);if(!r.ok)return "";
    const j=await r.json();const d=(j.documents||[])[0];
    return (d&&d.fields&&d.fields.updatedAt&&(d.fields.updatedAt.timestampValue||""))||"";
  }catch(e){return "";}
}
async function getStamp(){const [a,b]=await Promise.all([fetchStamp("products"),fetchStamp("categories")]);return a+"|"+b;}
function cacheKeyFor(request,key,stamp){const u=new URL(request.url);return new Request(u.origin+"/__htmlcache/"+encodeURIComponent(key)+"/"+encodeURIComponent(stamp||"none"));}
async function htmlCacheGet(request,key,stamp){
  try{
    const m=await caches.default.match(cacheKeyFor(request,key,stamp));
    if(!m)return null;
    const html=await m.text();
    return new Response(html,{headers:secHeaders({"content-type":"text/html;charset=utf-8","cache-control":"public, max-age=0, s-maxage=5, stale-while-revalidate=30","x-html-cache":"hit"})});
  }catch(e){return null;}
}
async function htmlCachePut(request,key,stamp,html){
  try{
    const ttl=stamp?"public, max-age=300":"public, max-age=30";
    await caches.default.put(cacheKeyFor(request,key,stamp),new Response(html,{headers:{"content-type":"text/html;charset=utf-8","cache-control":ttl}}));
  }catch(e){}
}
const OUT_HEADERS={"content-type":"text/html;charset=utf-8","cache-control":"public, max-age=0, s-maxage=5, stale-while-revalidate=30"};

function notFound(origin){return new Response(`<!doctype html><html><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>Product Not Found | Laligurans Photo Studio</title><style>body{font-family:sans-serif;background:#faf6ef;color:#221f1e;display:grid;place-items:center;min-height:100vh;margin:0;text-align:center}a{color:#b3232f}</style></head><body><div><h1>❀ Product Not Found</h1><p>यो product उपलब्ध छैन वा हटाइएको छ।</p><p><a href="/">Back to Home</a> · <a href="/#services">Explore Products</a></p></div></body></html>`,{status:404,headers:secHeaders({"content-type":"text/html;charset=utf-8","cache-control":"public, max-age=0, s-maxage=5"})});}
function jsonld(p,cat,img,url,origin){const crumbs={"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":origin+"/"},{"@type":"ListItem","position":2,"name":cat?cat.name:"Products","item":origin+"/category/"+(cat?slugify(cat.name):"")},{"@type":"ListItem","position":3,"name":p.name,"item":url}]};const prod={"@context":"https://schema.org","@type":"Product","name":p.name,"image":img?[img]:[],"description":p.description||p.name,"category":cat?cat.name:undefined,"brand":{"@type":"Brand","name":"Laligurans Photo Studio"},"offers":{"@type":"Offer","price":Number(p.price||0),"priceCurrency":"NPR","availability":p.isAvailable===false?"https://schema.org/OutOfStock":"https://schema.org/InStock","url":url}};return [prod,crumbs];}
async function shellHtml(env,request){const u=new URL("/index.html",request.url);const r=await env.ASSETS.fetch(new Request(u.toString()));return await r.text();}
async function handleImg(path){
  const key=path.replace(/^\/img\//,"");
  if(!/^(products|gallery)\/[A-Za-z0-9-]+\/\d+-[a-f0-9]{6,12}\.(jpg|jpeg|png|webp)$/i.test(key))return new Response("bad key",{status:400,headers:secHeaders({})});
  const r=await fetch(ADMIN_BASE+"/api/img/"+key);
  if(!r.ok)return new Response("not found",{status:404,headers:secHeaders({})});
  return new Response(await r.arrayBuffer(),{headers:secHeaders({"content-type":r.headers.get("content-type")||"image/jpeg","cache-control":"public, max-age=31536000, immutable"})});
}

/* ===== ENHANCED SITEMAP: image sitemap + priority + skip "item" slug ===== */
async function handleSitemap(request){
  const origin=new URL(request.url).origin;
  const today=new Date().toISOString().slice(0,10);
  const urls=[];
  let debug="ok";
  try{
    const [prods,cats]=await Promise.all([fetchDocs(PROJECT_ID,API_KEY,"products"),fetchDocs(PROJECT_ID,API_KEY,"categories")]);
    const active=assignSlugs(prods.filter(p=>p.isActive));

    /* Home - highest priority */
    urls.push({loc:"/",last:today,cf:"daily",pr:"1.0",img:null});

    /* Categories - skip slugify fail ("item") */
    for(const c of cats.filter(c=>c.isActive)){
      const sl=slugify(c.name);
      if(!sl||sl==="item"){debug=debug==="ok"?"warn:skipped-cat-"+c.name:debug;continue;}
      urls.push({loc:"/category/"+sl,last:today,cf:"weekly",pr:"0.8",img:null});
    }

    /* Products - with image for Google Images */
    for(const p of active){
      const img=publicImg(origin,p);
      urls.push({
        loc:"/product/"+p.slug,
        last:p.updatedAt?String(p.updatedAt).slice(0,10):today,
        cf:"weekly",
        pr:"0.6",
        img:img?{loc:img,title:p.name||p.slug,caption:p.description||p.name}:null
      });
    }
  }catch(e){debug="error:"+String(e.message||e);}

  /* Build XML with image namespace */
  const imgNS = urls.some(u=>u.img) ? ' xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"' : '';
  const xml=`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"${imgNS}>
${urls.map(u=>{
  let block=`<url>
    <loc>${origin}${u.loc}</loc>
    <lastmod>${u.last}</lastmod>
    <changefreq>${u.cf}</changefreq>
    <priority>${u.pr}</priority>`;
  if(u.img){
    block+=`
    <image:image>
      <image:loc>${u.img.loc}</image:loc>
      <image:title>${esc(u.img.title)}</image:title>
      <image:caption>${esc(u.img.caption)}</image:caption>
    </image:image>`;
  }
  block+=`
  </url>`;
  return block;
}).join("\n")}
</urlset>`;

  return new Response(xml,{headers:secHeaders({"content-type":"application/xml","cache-control":"public, max-age=60","x-sitemap-debug":debug})});
}

async function handleHome(request,env,ctx){
  const origin=new URL(request.url).origin;
  const stamp=await getStamp();
  const hit=await htmlCacheGet(request,"home",stamp);
  if(hit)return hit;
  const shell=await shellHtml(env,request);
  try{
    const [prods,cats,sizes,gallery,anns,store,hours]=await Promise.all([
      fetchDocs(PROJECT_ID,API_KEY,"products"),
      fetchDocs(PROJECT_ID,API_KEY,"categories"),
      fetchDocs(PROJECT_ID,API_KEY,"sizes"),
      fetchDocs(PROJECT_ID,API_KEY,"gallery"),
      fetchDocs(PROJECT_ID,API_KEY,"announcements"),
      fetchDoc(PROJECT_ID,API_KEY,"storeInfo/main"),
      fetchDoc(PROJECT_ID,API_KEY,"businessHours/weekly")
    ]);
    const payload={
      products:assignSlugs(prods.filter(p=>p.isActive)).map(p=>({id:p.id,name:p.name,price:p.price,imageUrl:publicImg(origin,p),categoryId:p.categoryId,slug:p.slug,sizeIds:p.sizeIds||[],sizePrices:p.sizePrices||{},isFeatured:!!p.isFeatured,isAvailable:p.isAvailable!==false,description:p.description||"",keywords:Array.isArray(p.keywords)?p.keywords:[],displayOrder:p.displayOrder||0})),
      categories:cats.filter(c=>c.isActive).sort((a,b)=>(a.displayOrder||0)-(b.displayOrder||0)).map(c=>({id:c.id,name:c.name,description:c.description||""})),
      sizes:sizes.filter(s=>s.isActive).sort((a,b)=>(a.displayOrder||0)-(b.displayOrder||0)).map(s=>({id:s.id,name:s.name,dimensions:s.dimensions||"",price:s.price||0})),
      gallery:gallery.filter(g=>g.published).map(g=>({title:g.title||"",imageUrl:publicImg(origin,g)})),
      announcements:(anns||[]).filter(a=>a.published===true).map(a=>({message:a.message,published:true,priorityRank:a.priorityRank||2})),
      store:store||null,
      hours:hours||null
    };
    let html=shell;
    const heroImg=(payload.gallery[0]&&payload.gallery[0].imageUrl)||(payload.products[0]&&payload.products[0].imageUrl)||"";
    if(heroImg)html=html.replace("</head>",`<link rel="preload" as="image" href="${escAttr(heroImg)}" fetchpriority="high">\n</head>`);
    html=html.replace('<div id="productGrid" class="p-grid"></div>','<div id="productGrid" class="p-grid">'+ssrHomeLinks(payload)+'</div>');
    html=html.replace('<div id="colGrid" class="col-grid"></div>','<div id="colGrid" class="col-grid">'+ssrColLinks(payload)+'</div>');
    const boot=`<script id="ssrBoot" type="application/json">${JSON.stringify(payload).replace(/</g,"\\u003c")}</script>\n</body>`;
    html=html.replace("</body>",boot);
    ctx.waitUntil(htmlCachePut(request,"home",stamp,html));
    return new Response(html,{headers:secHeaders(Object.assign({},OUT_HEADERS,{"x-boot":"ok"}))});
  }catch(e){
    return new Response(shell,{headers:secHeaders({"content-type":"text/html;charset=utf-8","cache-control":"public, max-age=10","x-boot":"error:"+String(e.message||e)})});
  }
}

function buildProductBody(p,cat,img,origin){
  const catName = cat ? esc(cat.name.toUpperCase()) : "SERVICE";
  const catSlug = cat ? slugify(cat.name) : "";
  const catLabel = cat ? esc(cat.name) : "Products";
  const name = esc(p.name);
  const desc = esc(p.description || "");
  const price = fmtMoney(p.price || 0);
  const availHtml = p.isAvailable === false ? `<span class="badge red">Currently unavailable</span>` : `<span class="badge green">Available</span>`;
  const waMsg = `Namaste Laligurans Photo Studio!\nI want to order: ${p.name}\nPrice: ${price}\nProduct: ${origin}/product/${p.slug}`;
  const waHref = "https://wa.me/" + WA_DIGITS + "?text=" + encodeURIComponent(waMsg);
  const sizes = (p.sizeIds || []).map(id => {
    const s = (p._sizes || []).find(x => x.id === id);
    if (!s) return "";
    return `<div class="pm-size"><span>${esc(s.name)}${s.dimensions ? " (" + esc(s.dimensions) + ")" : ""}</span><span>${sizePriceText(p,s)}</span></div>`;
  }).filter(Boolean).join("");
  const sizesHtml = sizes ? `<p class="eyebrow">AVAILABLE SIZES</p>${sizes}` : "";
  const kwHtml = (Array.isArray(p.keywords) && p.keywords.length)
    ? `<div id="ppKwHidden" style="position:absolute;left:-9999px;height:0;overflow:hidden;pointer-events:none" aria-hidden="true">Related: ${esc(p.keywords.join(", "))}</div>`
    : "";
  return `<div class="wrap">
    <a href="/" class="pp-back">‹ Back to Home</a>
    <div class="pp-grid">
      <div class="pp-media">${img ? `<img id="ppImg" src="${escAttr(img)}" alt="${escAttr(p.name)} - Laligurans Photo Studio" fetchpriority="high" />` : `<img id="ppImg" alt="" />`}</div>
      <div class="pp-info">
        <p class="p-cat" id="ppCat">${catName}</p>
        <nav id="ppCrumb" class="breadcrumb" aria-label="Breadcrumb"><a href="/">Home</a> › <a href="/category/${escAttr(catSlug)}">${catLabel}</a> › <span>${name}</span></nav>
        <h1 id="ppName" class="pp-name">${name}</h1>
        <p id="ppDesc" class="pp-desc">${desc}</p>
        ${kwHtml}
        <div id="ppSizes" class="pm-sizes">${sizesHtml}</div>
        <p id="ppPrice" class="pp-price">${price}</p>
        <p id="ppAvail">${availHtml}</p>
        <div class="pp-actions">
          <button id="ppFav" class="icon-btn heart" aria-label="Wishlist"><svg class="ic" viewBox="0 0 24 24"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg></button>
          <button id="ppShare" class="btn-ghost2" type="button"><svg class="ic sm" viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 10.7l6.8-4M8.6 13.3l6.8 4"/></svg> Share</button>
          <a id="ppWa" class="p-wa" href="${escAttr(waHref)}" target="_blank" rel="noopener">Enquire</a>
        </div>
      </div>
    </div>
    <section id="relSec" hidden><p class="eyebrow">RELATED PRODUCTS</p><div id="ppRelated" class="p-grid small"></div></section>
  </div>`;
}

async function handleProduct(request,env,ctx,path){
  const slug=decodeURIComponent(path.replace(/^\/product\//,"").replace(/\/$/,""));
  const origin=new URL(request.url).origin;
  const stamp=await getStamp();
  const hit=await htmlCacheGet(request,"p:"+slug,stamp);
  if(hit)return hit;
  const shell=await shellHtml(env,request);
  try{
    const [prods,cats,sizes]=await Promise.all([fetchDocs(PROJECT_ID,API_KEY,"products"),fetchDocs(PROJECT_ID,API_KEY,"categories"),fetchDocs(PROJECT_ID,API_KEY,"sizes")]);
    const p=assignSlugs(prods.filter(x=>x.isActive)).find(x=>x.slug===slug);
    if(!p)return notFound(origin);
    const cat=cats.find(c=>c.id===p.categoryId);
    p._sizes=sizes.filter(s=>s.isActive);
    const img=publicImg(origin,p);
    const url=origin+"/product/"+p.slug;
    const title=`${p.name} | Laligurans Photo Studio`;
    const desc=p.description||`${p.name} from Laligurans Photo Studio, Chautara. Explore available sizes and pricing.`;
    let html=shell;
    html=html.replace(/<title>[^<]*<\/title>/,`<title>${esc(title)}</title>`);
    html=html.replace(/(<meta name="description" id="metaDesc" content=")[^"]*(")/,`$1${esc(desc)}$2`);
    html=html.replace(/(<meta property="og:title" id="ogTitle" content=")[^"]*(")/,`$1${esc(title)}$2`);
    html=html.replace(/(<meta property="og:description" id="ogDesc" content=")[^"]*(")/,`$1${esc(desc)}$2`);
    html=html.replace(/(<meta property="og:type" id="ogType" content=")[^"]*(")/,`$1product$2`);
    html=html.replace(/(<meta property="og:url" id="ogUrl" content=")[^"]*(")/,`$1${url}$2`);
    html=html.replace(/(<meta property="og:image" id="ogImage" content=")[^"]*(")/,`$1${img}$2`);
    html=html.replace(/(<meta name="twitter:card" content=")[^"]*(")/,`$1${img?"summary_large_image":"summary"}$2`);
    html=html.replace(/(<meta name="twitter:title" id="twTitle" content=")[^"]*(")/,`$1${esc(title)}$2`);
    html=html.replace(/(<meta name="twitter:description" id="twDesc" content=")[^"]*(")/,`$1${esc(desc)}$2`);
    html=html.replace(/(<meta name="twitter:image" id="twImage" content=")[^"]*(")/,`$1${img}$2`);
    html=injectCanonical(html,url);
    const PV_START='<div id="productView" hidden>';
    const PV_END='<!-- CATEGORY PAGE -->';
    const si=html.indexOf(PV_START);
    const ei=html.indexOf(PV_END);
    if(si!==-1 && ei!==-1){
      html=html.slice(0,si)+'<div id="productView">'+buildProductBody(p,cat,img,origin)+'</div>\n\n'+html.slice(ei);
    }
    html=html.split('<main id="landingMain">').join('<main id="landingMain" hidden>');
    html=html.replace("</head>",`<script type="application/ld+json">${JSON.stringify(jsonld(p,cat,img,url,origin))}</script>\n<noscript><main><h1>${esc(p.name)}</h1><p>${esc(desc)}</p><p>Price: NPR ${Number(p.price||0)}</p><p>Availability: ${p.isAvailable===false?"Out of stock":"In stock"}</p>${cat?`<p>Category: ${esc(cat.name)}</p>`:""}${img?`<img src="${img}" alt="${esc(p.name)} | Laligurans Photo Studio">`:""}<p>Brand: Laligurans Photo Studio, Chautara, Sindhupalchok, Nepal</p></main></noscript>\n</head>`);
    ctx.waitUntil(htmlCachePut(request,"p:"+slug,stamp,html));
    return new Response(html,{headers:secHeaders(Object.assign({},OUT_HEADERS,{"x-seo-debug":"ok"}))});
  }catch(e){
    return new Response(shell,{status:500,headers:secHeaders({"content-type":"text/html;charset=utf-8","x-seo-debug":"error:"+String(e.message||e)})});
  }
}
async function handleCategory(request,env,ctx,path){
  const slug=decodeURIComponent(path.replace(/^\/category\//,"").replace(/\/$/,""));
  const origin=new URL(request.url).origin;
  const stamp=await getStamp();
  const hit=await htmlCacheGet(request,"c:"+slug,stamp);
  if(hit)return hit;
  const shell=await shellHtml(env,request);
  try{
    const cats=(await fetchDocs(PROJECT_ID,API_KEY,"categories")).filter(c=>c.isActive);
    const c=cats.find(x=>slugify(x.name)===slug);
    if(!c)return new Response(`<!doctype html><html><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>Category Not Found</title></head><body><h1>404 — Category Not Found</h1><p><a href="/">Back to home</a></p></body></html>`,{status:404,headers:secHeaders({"content-type":"text/html;charset=utf-8","cache-control":"public, max-age=0, s-maxage=5"})});
    const url=origin+"/category/"+slug;
    const title=`${c.name} | Laligurans Photo Studio`;
    const desc=c.description||`Explore ${c.name} from Laligurans Photo Studio, Chautara.`;
    let html=shell;
    html=html.replace(/<title>[^<]*<\/title>/,`<title>${esc(title)}</title>`);
    html=html.replace(/(<meta name="description" id="metaDesc" content=")[^"]*(")/,`$1${esc(desc)}$2`);
    html=html.replace(/(<meta property="og:title" id="ogTitle" content=")[^"]*(")/,`$1${esc(title)}$2`);
    html=html.replace(/(<meta property="og:description" id="ogDesc" content=")[^"]*(")/,`$1${esc(desc)}$2`);
    html=html.replace(/(<meta property="og:url" id="ogUrl" content=")[^"]*(")/,`$1${url}$2`);
    html=html.replace(/(<meta name="twitter:card" content=")[^"]*(")/,`$1summary$2`);
    html=html.replace(/(<meta name="twitter:title" id="twTitle" content=")[^"]*(")/,`$1${esc(title)}$2`);
    html=html.replace(/(<meta name="twitter:description" id="twDesc" content=")[^"]*(")/,`$1${esc(desc)}$2`);
    html=injectCanonical(html,url);
    html=html.replace("</head>",`<script type="application/ld+json">${JSON.stringify({"@context":"https://schema.org","@type":"CollectionPage","name":title,"description":desc,"url":url})}</script>\n</head>`);
    ctx.waitUntil(htmlCachePut(request,"c:"+slug,stamp,html));
    return new Response(html,{headers:secHeaders(Object.assign({},OUT_HEADERS,{"x-seo-debug":"ok"}))});
  }catch(e){
    return new Response(shell,{status:500,headers:secHeaders({"content-type":"text/html;charset=utf-8","x-seo-debug":"error:"+String(e.message||e)})});
  }
}
export default {
  async fetch(request, env, ctx){
    try{
      const url=new URL(request.url);
      if(request.method==="GET" && url.hostname==="laliguransphotostudio.com.np"){
        return new Response(null,{status:301,headers:secHeaders({Location:`https://www.laliguransphotostudio.com.np${url.pathname}${url.search}`,"cache-control":"no-store"})});
      }
      const p=url.pathname;
      if(request.method==="GET"){
        if(p==="/sitemap.xml")return await handleSitemap(request);
        if(p.startsWith("/img/"))return await handleImg(p);
        if(p==="/"||p==="/index.html")return await handleHome(request,env,ctx);
        if(p.startsWith("/product/"))return await handleProduct(request,env,ctx,p);
        if(p.startsWith("/category/"))return await handleCategory(request,env,ctx,p);
      }
      return await assetsWithSec(request,env);
    }catch(e){
      try{return await assetsWithSec(request,env);}catch(e2){return new Response("Server error",{status:500,headers:secHeaders({"content-type":"text/plain"})});}
    }
  }
}
