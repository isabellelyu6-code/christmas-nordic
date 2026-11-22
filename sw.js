// 圣诞北欧！离线缓存：页面先走网络、没网用缓存；地图瓦片、字体、库文件用过就存；天气/极光数据先网络后缓存
const V='cn-v1',CORE=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./icon-180.png',
 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css','https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>Promise.allSettled(CORE.map(u=>fetch(u,{mode:u.startsWith('http')?'no-cors':'same-origin'}).then(r=>c.put(u,r))))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
const STATIC=/cdnjs\.cloudflare\.com|fonts\.(googleapis|gstatic)\.com|arcgisonline\.com/;
const DATA=/open-meteo\.com|swpc\.noaa\.gov/;
async function netFirst(req){const c=await caches.open(V);try{const r=await fetch(req);if(r.ok||r.type==='opaque')c.put(req,r.clone());return r}catch(e){const m=await c.match(req,{ignoreSearch:req.mode==='navigate'});if(m)return m;throw e}}
async function cacheFirst(req){const c=await caches.open(V),m=await c.match(req);if(m){fetch(req).then(r=>{if(r.ok||r.type==='opaque')c.put(req,r)}).catch(()=>{});return m}const r=await fetch(req);if(r.ok||r.type==='opaque')c.put(req,r.clone());return r}
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);
 if(/firebasedatabase\.app|firebaseio\.com|entur\.io/.test(u.host))return;
 if(r.mode==='navigate'||(u.origin===location.origin&&/index\.html$|\/$/.test(u.pathname)))return e.respondWith(netFirst(r));
 if(u.origin===location.origin||STATIC.test(u.host))return e.respondWith(cacheFirst(r));
 if(DATA.test(u.host))return e.respondWith(netFirst(r))});
