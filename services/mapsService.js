const mapsUrl = x => x && x.lat && x.lng ? `https://www.google.com/maps/search/?api=1&query=${x.lat},${x.lng}` : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(((x && (x.street || x.address)) || '') + ', Colonia del Sacramento')}`;
const routeUrl = pts => 'https://www.google.com/maps/dir/' + pts.map(p => p.lat + ',' + p.lng).join('/');
module.exports = { mapsUrl, routeUrl };
