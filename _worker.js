/* LALIGURANS edge router v6 - image proxy + charset fix */
const PROJECT_ID = "laligurans-photo-studio";
const API_KEY = "AIzaSyAopefoW6m7RYV_HkN1rzHqMsN4tN0HJ8I";
const ADMIN_BASE = "https://laligurans-admin.pages.dev";

function esc(s){return String(s??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;");}
function slugify(s){return String(s||"").toLowerCase().normalize("NFKD").replace(/[\u0900-\u097F]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"")||"item";}
function dv(v){if(v==null)return null;if(v.stringValue!==undefined)return v.stringValue;if(v.integerValue!==undefined)return Number(v.integerValue);if(v.numberValue!==undefined)return Number(v.numberValue);if(v.booleanValue!==undefined)return v.booleanValue;if(v.timestampValue!==undefined)return v.timestampValue;if(v.arrayValue)return(v.arrayValue.values||[]).map(dv);if(v.mapValue)return df(v.mapValue.fields||{});return null;}
function df(f){const o={};for(const k in f)o[k]=dv(f[k]);return o;}
async function fetchDocs(pid,key,coll){let out=[],token="";do{const u=`https://firestore.googleapis.com/v1/projects/${pid}/databases/(default)/documents/${coll}?pageSize=300${token?"&pageToken="+token:""}&key=${key}`;const r=await fetch(u);if(!r.ok)throw new Error("firestore "+r.status);const j=await r.json();for(const d of(j.documents||[])){const o=df(d.fields||{});o.id=d.name.split("/").pop();if(o.createdAt)o.createdAtMs=Date.parse(o.createdAt)||0;out.push(o);}token=j.nextPageToken||"";}while(token);return out;}
function assignSlugs(list){const by=[...list].sort((a,b)=>(a.createdAtMs||0)-(b.createdAtMs||0));const used={};for(const p of by){let s=p.slug;if(!s){let base=slugify(p.name),n=2;s=base;while(used[s]){s=base+"-"+n;n++;}}while(used[s]){s=s+"-2";}used[s]=true;p.slug=s;}return list;}
function publicImg(origin,p){if(!p.imageUrl)return "";if(p.imageUrl.startsWith("/api/img/"))return origin+"/img/"+p.imageUrl.replace("/api/img/","");if(p.imageUrl.startsWith("http"))return p.imageUrl;return "";}
function notFound(origin){return new Response(`<!doctype html><html><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>Product Not Found | Laligurans Photo Studio</title><style>body{font-family:sans-serif;background:#faf6ef;color:#221f1e;display:grid;place-items:center;min-height:100vh;margin:0;text-align:center}a{color:#b3232f}</style></head><body><div><h1>❀ Product Not Found</h1><p>यो product उपलब्ध छैन वा हटाइएको छ।</p><p><a href="/">Back to Home</a> · <a href="/#services">Explore Products</a></p></div></body></html>`,{status:404,headers:{"content-type":"text/html;charset=utf-8"}});}
function jsonld(p,cat,img,url,origin){const crumbs={"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":origin+"/"},{"@type":"ListItem","position":2,"name":cat?cat.name:"Products","item":origin+"/category/"+(cat?slugify(cat.name):"")},{"@type":"ListItem","position":3,"name":p.name,"item":url}]};const prod={"@context":"https://schema.org","@type":"Product","name":p.name,"image":img?[img]:[],"description":p.description||p.name,"category":cat?cat.name:undefined,"brand":{"@type":"Brand","name":"Laligurans Photo Studio"},"offers":{"@type":"Offer","price":Number(p.price||0),"priceCurrency":"NPR","availability":p.isAvailable===false?"https://schema.org/OutOfStock":"https://schema.org/InStock","url":url}};return [prod,crumbs];}
async function shellHtml(env,request){const u=new URL("/index.html",request.url);const r=await env.ASSETS.fetch(new Request(u.toString()));return await r.text();}
async function handleImg(path){
  const key=path.replace(/^\/img\//,"");
  if(!/^(products|gallery)\/[A-Za-z0-9-]+\/\d+-[a-f0-9]{6,12}\.(jpg|jpeg|png|webp)$/i.test(key))return new Response("bad key",{status:400});
  const r=await fetch(ADMIN_BASE+"/api/img/"+key);
  if(!r.ok)return new Response("not found",{status:404});
  return new Response(await r.arrayBuffer(),{headers:{"content-type":r.headers.get("content-type")||"image/jpeg","cache-control":"public, max-age=31536000, immutable"}});
}
async function handleSitemap(request){
  const origin=new URL(request.url).origin;
  const today=new Date().toISOString().slice(0,10);
  const urls=[{loc:"/",last:today}];
  let debug="ok";
  try{
    const [prods,cats]=await Promise.all([fetchDocs(PROJECT_ID,API_KEY,"products"),fetchDocs(PROJECT_ID,API_KEY,"categories")]);
    const active=assignSlugs(prods.filter(p=>p.isActive));
    for(const c of cats.filter(c=>c.isActive))urls.push({loc:"/category/"+slugify(c.name),last:today});
    for(const p of active)urls.push({loc:"/product/"+p.slug,last:p.updatedAt?String(p.updatedAt).slice(0,10):today});
  }catch(e){debug="error:"+String(e.message||e);}
  const xml=`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`+urls.map(u=>`<url><loc>${origin}${u.loc}</loc><lastmod>${u.last}</lastmod><changefreq>${u.loc==="/"?"daily":"weekly"}</changefreq></url>`).join("\n")+`\n</urlset>`;
  return new Response(xml,{headers:{"content-type":"application/xml","cache-control":"public, max-age=300","x-sitemap-debug":debug}});
}
async function handleProduct(request,env,path){
  const slug=decodeURIComponent(path.replace(/^\/product\//,"").replace(/\/$/,""));
  const origin=new URL(request.url).origin;
  const shell=await shellHtml(env,request);
  try{
    const [prods,cats]=await Promise.all([fetchDocs(PROJECT_ID,API_KEY,"products"),fetchDocs(PROJECT_ID,API_KEY,"categories")]);
    const p=assignSlugs(prods.filter(x=>x.isActive)).find(x=>x.slug===slug);
    if(!p)return notFound(origin);
    const cat=cats.find(c=>c.id===p.categoryId);
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
    html=html.replace(/(<link rel="canonical" id="canonical" href=")[^"]*(")/,`$1${url}$2`);
    html=html.replace(/(<meta name="twitter:card" content=")[^"]*(")/,`$1${img?"summary_large_image":"summary"}$2`);
    html=html.replace(/(<meta name="twitter:title" id="twTitle" content=")[^"]*(")/,`$1${esc(title)}$2`);
    html=html.replace(/(<meta name="twitter:description" id="twDesc" content=")[^"]*(")/,`$1${esc(desc)}$2`);
    html=html.replace(/(<meta name="twitter:image" id="twImage" content=")[^"]*(")/,`$1${img}$2`);
    html=html.replace("</head>",`<script type="application/ld+json">${JSON.stringify(jsonld(p,cat,img,url,origin))}</script>\n<noscript><main><h1>${esc(p.name)}</h1><p>${esc(desc)}</p><p>Price: NPR ${Number(p.price||0)}</p><p>Availability: ${p.isAvailable===false?"Out of stock":"In stock"}</p>${cat?`<p>Category: ${esc(cat.name)}</p>`:""}${img?`<img src="${img}" alt="${esc(p.name)} | Laligurans Photo Studio">`:""}<p>Brand: Laligurans Photo Studio, Chautara, Sindhupalchok, Nepal</p></main></noscript>\n</head>`);
    return new Response(html,{headers:{"content-type":"text/html;charset=utf-8","cache-control":"public, max-age=60","x-seo-debug":"ok"}});
  }catch(e){
    return new Response(shell,{status:500,headers:{"content-type":"text/html;charset=utf-8","x-seo-debug":"error:"+String(e.message||e)}});
  }
}
async function handleCategory(request,env,path){
  const slug=decodeURIComponent(path.replace(/^\/category\//,"").replace(/\/$/,""));
  const origin=new URL(request.url).origin;
  const shell=await shellHtml(env,request);
  try{
    const cats=(await fetchDocs(PROJECT_ID,API_KEY,"categories")).filter(c=>c.isActive);
    const c=cats.find(x=>slugify(x.name)===slug);
    if(!c)return new Response(`<!doctype html><html><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>Category Not Found</title></head><body><h1>404 — Category Not Found</h1><p><a href="/">Back to home</a></p></body></html>`,{status:404,headers:{"content-type":"text/html;charset=utf-8"}});
    const url=origin+"/category/"+slug;
    const title=`${c.name} | Laligurans Photo Studio`;
    const desc=c.description||`Explore ${c.name} from Laligurans Photo Studio, Chautara.`;
    let html=shell;
    html=html.replace(/<title>[^<]*<\/title>/,`<title>${esc(title)}</title>`);
    html=html.replace(/(<meta name="description" id="metaDesc" content=")[^"]*(")/,`$1${esc(desc)}$2`);
    html=html.replace(/(<meta property="og:title" id="ogTitle" content=")[^"]*(")/,`$1${esc(title)}$2`);
    html=html.replace(/(<meta property="og:description" id="ogDesc" content=")[^"]*(")/,`$1${esc(desc)}$2`);
    html=html.replace(/(<meta property="og:url" id="ogUrl" content=")[^"]*(")/,`$1${url}$2`);
    html=html.replace(/(<link rel="canonical" id="canonical" href=")[^"]*(")/,`$1${url}$2`);
    html=html.replace(/(<meta name="twitter:card" content=")[^"]*(")/,`$1summary$2`);
    html=html.replace(/(<meta name="twitter:title" id="twTitle" content=")[^"]*(")/,`$1${esc(title)}$2`);
    html=html.replace(/(<meta name="twitter:description" id="twDesc" content=")[^"]*(")/,`$1${esc(desc)}$2`);
    html=html.replace("</head>",`<script type="application/ld+json">${JSON.stringify({"@context":"https://schema.org","@type":"CollectionPage","name":title,"description":desc,"url":url})}</script>\n</head>`);
    return new Response(html,{headers:{"content-type":"text/html;charset=utf-8","cache-control":"public, max-age=60","x-seo-debug":"ok"}});
  }catch(e){
    return new Response(shell,{status:500,headers:{"content-type":"text/html;charset=utf-8","x-seo-debug":"error:"+String(e.message||e)}});
  }
}
export default {
  async fetch(request, env, ctx){
    try{
      const url=new URL(request.url);
      const p=url.pathname;
      if(request.method==="GET"){
        if(p==="/sitemap.xml")return await handleSitemap(request);
        if(p.startsWith("/img/"))return await handleImg(p);
        if(p.startsWith("/product/"))return await handleProduct(request,env,p);
        if(p.startsWith("/category/"))return await handleCategory(request,env,p);
      }
      return env.ASSETS.fetch(request);
    }catch(e){
      try{return env.ASSETS.fetch(request);}catch(e2){return new Response("Server error",{status:500});}
    }
  }
}
