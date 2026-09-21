function mapsUrl(client){
  if(client.lat && client.lng) return `https://www.google.com/maps/search/?api=1&query=${client.lat},${client.lng}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(client.address||'Colonia del Sacramento')}`;
}
module.exports={mapsUrl};
