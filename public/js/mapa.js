/* Mapas: Leaflet + OpenStreetMap si hay conexión; si no, un plano esquemático en SVG. 
   Uso: <div class="map" data-map data-points='[{"lat":..,"lng":..,"label":"..","href":"..","color":"#..","n":1}]' data-route="1"></div> */
(function () {
  const E = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  document.querySelectorAll('[data-map]').forEach(el => {
    let pts = []; try { pts = JSON.parse(el.dataset.points || '[]').filter(p => p.lat && p.lng).map(p => ({ ...p, label: E(p.label), sub: E(p.sub), href: p.href && /^\//.test(p.href) ? E(p.href) : '', color: /^#[0-9a-f]{3,8}$/i.test(p.color || '') ? p.color : '', n: E(p.n) })); } catch (e) { }
    const route = el.dataset.route === '1';
    if (window.L) {
      const m = L.map(el, { scrollWheelZoom: false }).setView([-34.465, -57.84], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap' }).addTo(m);
      const ll = [];
      pts.forEach(p => { const icon = L.divIcon({ className: '', html: `<div class="pin" style="background:${p.color || '#0E3B2E'}"><span>${p.n || ''}</span></div>`, iconSize: [30, 30], iconAnchor: [15, 30] });
        const mk = L.marker([p.lat, p.lng], { icon }).addTo(m); mk.bindPopup((p.href ? `<a href="${p.href}"><b>${p.label}</b></a>` : `<b>${p.label}</b>`) + (p.sub ? `<br>${p.sub}` : '')); ll.push([p.lat, p.lng]); });
      if (route && ll.length > 1) L.polyline(ll, { color: '#14A06E', weight: 4, dashArray: '6 8' }).addTo(m);
      if (ll.length > 1) m.fitBounds(ll, { padding: [40, 40] }); else if (ll.length) m.setView(ll[0], 15);
      return;
    }
    // plano esquemático (sin conexión)
    const W = 800, H = 500, lats = pts.map(p => p.lat).concat([-34.43, -34.475]), lngs = pts.map(p => p.lng).concat([-57.80, -57.86]);
    const a = Math.min(...lats), b = Math.max(...lats), c = Math.min(...lngs), d = Math.max(...lngs), pad = 40;
    const X = g => pad + (g - c) / (d - c || 1) * (W - 2 * pad), Y = t => pad + (b - t) / (b - a || 1) * (H - 2 * pad);
    let s = `<svg class="svgmap" viewBox="0 0 ${W} ${H}" role="img" aria-label="Plano de entregas"><rect width="${W}" height="${H}" fill="#E4ECE3"/>`;
    s += `<path d="M0 ${H * .78} C ${W * .3} ${H * .7}, ${W * .5} ${H * .95}, ${W} ${H * .85} L ${W} ${H} L 0 ${H}Z" fill="#BFD7E3"/><text x="${W - 150}" y="${H - 18}">Río de la Plata</text>`;
    for (let i = 1; i < 6; i++) s += `<line x1="0" x2="${W}" y1="${i * H / 6}" y2="${i * H / 6}" stroke="#d3ddd2"/><line y1="0" y2="${H}" x1="${i * W / 6}" x2="${i * W / 6}" stroke="#d3ddd2"/>`;
    if (route && pts.length > 1) s += `<polyline points="${pts.map(p => X(p.lng) + ',' + Y(p.lat)).join(' ')}" fill="none" stroke="#14A06E" stroke-width="3" stroke-dasharray="6 8"/>`;
    pts.forEach(p => { const x = X(p.lng), y = Y(p.lat); s += `<a href="${p.href || '#'}"><circle cx="${x}" cy="${y}" r="13" fill="${p.color || '#0E3B2E'}" stroke="#fff" stroke-width="2"/><text x="${x}" y="${y + 4}" text-anchor="middle" fill="#fff" style="fill:#fff;font-weight:700">${p.n || ''}</text><text x="${x + 17}" y="${y + 4}">${p.label}</text></a>`; });
    el.innerHTML = s + '</svg>';
  });
})();
