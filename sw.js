// Tiene l'app sul telefono: si apre subito anche con rete lenta.
// I dati arrivano sempre dallo script Google, non vengono salvati qui.
const CACHE = 'conti-eventi-v2';
const FILE = ['./', 'index.html', 'config.js', 'manifest.webmanifest', 'icona-192.png', 'icona-512.png', 'icona-maskable.png', 'apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(k => Promise.all(k.filter(n => n !== CACHE).map(n => caches.delete(n))))
    .then(() => self.clients.claim()));
});

// Pagine e config: prima la rete (così gli aggiornamenti arrivano subito), se manca la copia salvata.
// Icone: copia salvata. Le chiamate allo script Google non passano di qui.
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  if (/\.png$/.test(url.pathname)) {
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
    return;
  }
  e.respondWith(fetch(e.request)
    .then(r => { const copia = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copia)); return r; })
    .catch(() => caches.match(e.request).then(r => r || caches.match('index.html'))));
});
