const PREFIX="ai-tools-hub-pwa-";
const CACHE=PREFIX+"v1";
const SHELL=["/","/index.html","/manifest.webmanifest","/icons/icon-192.png","/icons/icon-512.png"];

self.addEventListener("install",(event)=>{
  event.waitUntil((async()=>{
    const cache=await caches.open(CACHE);
    await Promise.all(SHELL.map(async(path)=>{
      try{
        const response=await fetch(path,{cache:"reload"});
        if(response.ok&&response.type==="basic") await cache.put(path,response);
      }catch{/* optional asset; installation continues */}
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener("activate",(event)=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter((key)=>key.startsWith(PREFIX)&&key!==CACHE).map((key)=>caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch",(event)=>{
  const request=event.request;
  if(request.method!=="GET") return;
  const url=new URL(request.url);
  if(url.origin!==self.location.origin) return;
  // Never cache auth, API, Supabase, or other user-specific responses.
  if(["/api/","/auth/","/rest/","/functions/","/storage/"].some((path)=>url.pathname.startsWith(path))) return;

  if(request.mode==="navigate"){
    event.respondWith(fetch(request).then((response)=>{
      if(response.ok){
        const copy=response.clone();
        caches.open(CACHE).then((cache)=>cache.put("/index.html",copy)).catch(()=>{});
      }
      return response;
    }).catch(async()=>(await caches.match("/index.html"))||(await caches.match("/"))));
    return;
  }

  const staticAsset=["script","style","image","font"].includes(request.destination)||url.pathname==="/manifest.webmanifest";
  if(!staticAsset) return;
  event.respondWith((async()=>{
    const cached=await caches.match(request);
    if(cached) return cached;
    const response=await fetch(request);
    if(response.ok&&response.type==="basic"){
      const copy=response.clone();
      caches.open(CACHE).then((cache)=>cache.put(request,copy)).catch(()=>{});
    }
    return response;
  })());
});
