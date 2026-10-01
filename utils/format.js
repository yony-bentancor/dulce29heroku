/* Formatos y catálogos compartidos (servidor y vistas). */
const STATUS = {
  recibido: { label: 'Recibido', tone: 'info', step: 0 },
  preparando: { label: 'Preparando', tone: 'warn', step: 1 },
  listo: { label: 'Listo', tone: 'warn', step: 2 },
  en_camino: { label: 'En camino', tone: 'go', step: 3 },
  entregado: { label: 'Entregado', tone: 'ok', step: 4 },
  no_entregado: { label: 'No entregado', tone: 'bad', step: 3 },
  cancelado: { label: 'Cancelado', tone: 'bad', step: -1 }
};
const FLOW = ['recibido', 'preparando', 'listo', 'en_camino', 'entregado'];
const LEAD = { nuevo: { label: 'Nuevo', tone: 'info' }, contactado: { label: 'Contactado', tone: 'warn' }, agendado: { label: 'Agendado', tone: 'go' }, cerrado: { label: 'Cerrado', tone: 'ok' }, descartado: { label: 'Descartado', tone: 'bad' } };
const KIND = { contacto: 'Contacto', epigenetica: 'Test epigenético', thermomix: 'Thermomix' };
const money = n => '$ ' + Math.round(Number(n) || 0).toLocaleString('es-UY').replace(/,/g, '.');
const TZ = 'America/Montevideo';
const date = (d, o = { day: 'numeric', month: 'short' }) => d ? new Date(d.length === 10 ? d + 'T12:00:00-03:00' : d).toLocaleDateString('es-UY', { timeZone: TZ, ...o }).replace('.', '') : '';
const datetime = d => d ? new Date(d).toLocaleString('es-UY', { timeZone: TZ, day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).replace('.', '') : '';
const time = d => d ? new Date(d).toLocaleTimeString('es-UY', { timeZone: TZ, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }) : '';
const ago = d => { const s = (Date.now() - new Date(d)) / 1000; if (s < 60) return 'recién'; if (s < 3600) return `hace ${Math.floor(s / 60)} min`; if (s < 86400) return `hace ${Math.floor(s / 3600)} h`; const n = Math.floor(s / 86400); return n === 1 ? 'ayer' : `hace ${n} días`; };
const today = () => new Date().toLocaleDateString('en-CA', { timeZone: TZ });
const slug = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const initials = s => String(s || '?').split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase();
module.exports = { STATUS, FLOW, LEAD, KIND, money, date, datetime, time, ago, today, slug, initials, TZ };
