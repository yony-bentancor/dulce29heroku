/* Gráficos SVG simples renderizados en el servidor (una serie, un color, tooltip nativo). */
const { money } = require('../utils/format');
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
// barras verticales: data = [{label, value, title}]
function bars(data, { h = 220, fmt = money, color = '#14A06E', every = 1 } = {}) {
  const W = 760, pad = { l: 72, r: 8, t: 12, b: 28 }, max = Math.max(1, ...data.map(d => d.value));
  const step = Math.pow(10, Math.floor(Math.log10(max))), top = Math.ceil(max / step) * step, iw = W - pad.l - pad.r, ih = h - pad.t - pad.b;
  const bw = iw / data.length, gap = Math.min(6, bw * .25);
  let s = `<svg class="chart" viewBox="0 0 ${W} ${h}" role="img" aria-label="Gráfico de barras">`;
  for (let k = 0; k <= 4; k++) { const v = top * k / 4, y = pad.t + ih - ih * k / 4; s += `<line x1="${pad.l}" x2="${W - pad.r}" y1="${y}" y2="${y}" stroke="#E7E4DA"/><text x="${pad.l - 8}" y="${y + 4}" text-anchor="end">${esc(fmt(v))}</text>`; }
  data.forEach((d, i) => { const bh = Math.max(d.value > 0 ? 2 : 0, ih * d.value / top), x = pad.l + i * bw + gap / 2, y = pad.t + ih - bh, w = Math.max(1, bw - gap), r = Math.min(4, w / 2, bh);
    s += `<g class="bar"><rect x="${pad.l + i * bw}" y="${pad.t}" width="${bw}" height="${ih}" fill="transparent"/><path d="M${x},${pad.t + ih}V${y + r}Q${x},${y} ${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${pad.t + ih}Z" fill="${color}"/><title>${esc(d.title || d.label + ': ' + fmt(d.value))}</title></g>`;
    if (i % every === 0) s += `<text x="${x + w / 2}" y="${h - 8}" text-anchor="middle">${esc(d.label)}</text>`; });
  return s + `<line x1="${pad.l}" x2="${W - pad.r}" y1="${pad.t + ih}" y2="${pad.t + ih}" stroke="#9AA59E"/></svg>`;
}
module.exports = { bars };
