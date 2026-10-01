/* Dulce29 · interacciones generales del sitio */
(function () {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  // menú móvil
  const mb = $('[data-menu]'), nav = $('[data-nav]');
  if (mb && nav) mb.addEventListener('click', () => { const o = nav.classList.toggle('open'); mb.setAttribute('aria-expanded', o); });
  // aviso flotante
  const toastEl = $('[data-toast]'); let tt;
  window.toast = (html, ms = 3200) => { if (!toastEl) return; toastEl.innerHTML = html; toastEl.classList.add('on'); clearTimeout(tt); tt = setTimeout(() => toastEl.classList.remove('on'), ms); };
  // agregar a la bolsa sin recargar (si falla, el formulario funciona igual)
  document.addEventListener('submit', async e => {
    const f = e.target;
    if (f.matches('[data-add]')) {
      e.preventDefault(); const b = f.querySelector('button'); if (b) b.disabled = true;
      try {
        const r = await fetch(f.action, { method: 'POST', headers: { Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(new FormData(f)) });
        const j = await r.json();
        if (!r.ok) { toast(j.error || 'No se pudo agregar.'); }
        else { $$('[data-bag-count]').forEach(x => x.textContent = j.count); const bag = $('[data-bag]'); if (bag) { bag.classList.remove('bump'); void bag.offsetWidth; bag.classList.add('bump'); }
          toast(`Agregaste <b>${j.name}</b> · ${j.count} en la bolsa <a href="/carrito">Ver bolsa</a>`); }
      } catch (err) { f.submit(); }
      if (b) b.disabled = false;
    }
    if (f.matches('[data-fav]')) {
      e.preventDefault(); const b = f.querySelector('button');
      try { const r = await fetch(f.action, { method: 'POST', headers: { Accept: 'application/json' } }); const j = await r.json(); b.setAttribute('aria-pressed', String(j.on)); toast(j.on ? 'Guardado en favoritos' + (j.guest ? ' · <a href="/ingresar">Ingresá para conservarlos</a>' : ' · <a href="/mi-cuenta/favoritos">Ver favoritos</a>') : 'Quitado de favoritos'); } catch (err) { f.submit(); }
    }
  });
  // botones +/- de cantidad
  $$('.qty').forEach(q => { const i = $('input', q); $$('button', q).forEach(b => b.addEventListener('click', () => { const v = Math.max(+i.min || 0, Math.min(+i.max || 99, (+i.value || 0) + (+b.dataset.d))); i.value = v; i.dispatchEvent(new Event('change', { bubbles: true })); })); });
  // enviar al cambiar (carrito)
  $$('[data-autosubmit]').forEach(f => f.addEventListener('change', () => f.requestSubmit ? f.requestSubmit() : f.submit()));
  // filas clicables en tablas
  $$('tr[data-href]').forEach(r => r.addEventListener('click', e => { if (!e.target.closest('a,button,input,select,form')) location.href = r.dataset.href; }));
  // confirmaciones
  document.addEventListener('click', e => { const c = e.target.closest('[data-confirm]'); if (c && !confirm(c.dataset.confirm)) e.preventDefault(); });
  // filas repetibles en formularios: [data-rows] > [data-row], botón [data-addrow-to="id"], [data-delrow]
  const renum = box => $$('[data-row]', box).forEach((row, i) => $$('[name]', row).forEach(el => { el.name = el.name.replace(/\[\d+\]/, `[${i}]`); }));
  document.addEventListener('click', e => {
    const add = e.target.closest('[data-addrow-to]');
    if (add) { const box = document.getElementById(add.dataset.addrowTo), rows = $$('[data-row]', box), tpl = rows[rows.length - 1]; if (!tpl) return;
      const n = tpl.cloneNode(true); $$('input,textarea,select', n).forEach(el => { if (el.type === 'checkbox') el.checked = true; else if (el.type === 'hidden') el.value = ''; else if (el.tagName !== 'SELECT' && el.type !== 'color') el.value = ''; });
      box.append(n); renum(box); const f = $('input:not([type=hidden]),textarea', n); if (f) f.focus(); }
    const del = e.target.closest('[data-delrow]');
    if (del) { const row = del.closest('[data-row]'), box = row.closest('[data-rows]'); if ($$('[data-row]', box).length > 1) { row.remove(); renum(box); } else $$('input:not([type=checkbox]),textarea', row).forEach(el => el.value = ''); }
  });
  // menú lateral (admin)
  const sb = $('[data-side-toggle]'), side = $('.side-nav'); if (sb && side) sb.addEventListener('click', () => side.classList.toggle('open'));
})();
