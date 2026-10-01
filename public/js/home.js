/* Home: conecta la botella 3D con los bloques de sabor (scroll) y los botones de sabor. */
(function () {
  const stage = document.querySelector('[data-stage]'), cv = document.querySelector('[data-bottle]');
  if (!stage || !cv) return;
  const F = JSON.parse(document.getElementById('flavors').textContent);
  const bottle = window.Botella3D ? new Botella3D(cv, { liquid: F[0].liquid }) : null;
  if (bottle && bottle.failed) cv.classList.add('no-webgl');
  let cur = -1;
  const pick = i => {
    if (i === cur) return; cur = i; const f = F[i];
    stage.style.setProperty('--stage', f.bg); stage.style.setProperty('--accent', f.accent);
    if (bottle && !bottle.failed) { bottle.setLiquid(f.liquid); bottle.kick(cur > 0 ? 6 : 3); }
    document.querySelectorAll('[data-pick]').forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.pick === i)));
  };
  pick(0);
  // el bloque que ocupa el centro de la pantalla define el sabor
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) pick(+e.target.dataset.flavor); }), { rootMargin: '-45% 0px -45% 0px' });
  document.querySelectorAll('.stage-block').forEach((b, k) => { if (k > 0) b.dataset.flavor = k - 1; io.observe(b); });
  document.querySelectorAll('[data-pick]').forEach(b => b.addEventListener('click', () => { pick(+b.dataset.pick); }));
})();
