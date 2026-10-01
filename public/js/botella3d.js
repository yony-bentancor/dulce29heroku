/* Dulce29 · Botella 3D en WebGL (sin librerías).
   Botella de vidrio con leche vegetal, tapa blanca y etiqueta impresa. Gira sobre su eje:
   la velocidad responde al scroll y al movimiento del mouse; se puede arrastrar para girarla. */
(function () {
  'use strict';
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v)), lerp = (a, b, t) => a + (b - a) * t;
  const hex = h => { h = h.replace('#', ''); return [0, 2, 4].map(i => parseInt(h.substr(i, 2), 16) / 255); };

  // ---------- perfil del vidrio (radio, altura) ----------
  const PROFILE = [[0, -1.5], [.46, -1.5], [.56, -1.47], [.6, -1.38], [.6, -.2], [.6, .55], [.585, .8], [.53, .98], [.42, 1.12], [.32, 1.22], [.275, 1.3], [.27, 1.36], [.27, 1.43], [.29, 1.45], [.29, 1.49]];
  function smoothProfile(pts, n) { // Catmull-Rom
    const out = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
      for (let k = 0; k < n; k++) { const t = k / n, t2 = t * t, t3 = t2 * t;
        out.push([0, 1].map(j => .5 * (2 * p1[j] + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3))); }
    }
    out.push(pts[pts.length - 1]); return out;
  }
  function lathe(prof, seg, scaleR = 1, flipN = false) {
    const pos = [], nor = [], uv = [], idx = [], rows = prof.length;
    for (let i = 0; i < rows; i++) {
      const [r, y] = prof[i], a = prof[Math.max(0, i - 1)], b = prof[Math.min(rows - 1, i + 1)];
      let dr = b[0] - a[0], dy = b[1] - a[1]; const l = Math.hypot(dr, dy) || 1; dr /= l; dy /= l; // tangente
      for (let j = 0; j <= seg; j++) {
        const t = j / seg * Math.PI * 2, c = Math.cos(t), s = Math.sin(t);
        pos.push(r * scaleR * s, y, r * scaleR * c);
        const nx = dy, ny = -dr; nor.push((flipN ? -1 : 1) * nx * s, (flipN ? -1 : 1) * ny, (flipN ? -1 : 1) * nx * c);
        uv.push(j / seg, y);
      }
    }
    for (let i = 0; i < rows - 1; i++) for (let j = 0; j < seg; j++) { const a = i * (seg + 1) + j, b = a + seg + 1; idx.push(a, a + 1, b, b, a + 1, b + 1); }
    return { pos, nor, uv, idx };
  }

  // ---------- shaders ----------
  const V = `attribute vec3 aP,aN;attribute vec2 aT;uniform mat4 uPr,uVi,uMo;uniform float uInset;varying vec3 vN,vW,vV;varying vec2 vT;varying vec3 vL;
  void main(){vec3 p=aP+aN*uInset;vec4 w=uMo*vec4(p,1.);vW=w.xyz;vN=normalize((uMo*vec4(aN,0.)).xyz);vT=aT;vL=aP;vec4 v=uVi*w;vV=-v.xyz;gl_Position=uPr*v;}`;
  const COMMON = `precision highp float;varying vec3 vN,vW,vV;varying vec2 vT;varying vec3 vL;uniform vec3 uCam;uniform float uTime;
  vec3 env(vec3 r){ // estudio: fondo suave + dos ventanas de luz verticales (quedan fijas mientras la botella gira)
    float y=r.y;vec3 c=mix(vec3(.55,.58,.56),vec3(1.05),smoothstep(-.6,.9,y));
    float az=atan(r.x,r.z);
    c+=vec3(2.6)*smoothstep(.16,.04,abs(az+.85))*smoothstep(-.35,.15,y)*smoothstep(1.,.55,y);
    c+=vec3(1.4)*smoothstep(.10,.02,abs(az-1.05))*smoothstep(-.6,.2,y);
    c+=vec3(.9)*smoothstep(.85,1.,y);
    return c;}`;
  const F_GLASS = COMMON + `uniform sampler2D uTex;uniform float uFront;uniform vec3 uTint;
  void main(){vec3 n=normalize(vN),v=normalize(uCam-vW);if(uFront<.5)n=-n;
    // relieve: óvalo hundido (agarre) y anillos del cuello
    float ang=vT.x*6.2832; vec2 q=vec2((vT.x-.86)*7.,(vT.y-.15)*1.5); float ov=1.-smoothstep(.85,1.,length(q));
    n=normalize(n+ov*.22*vec3(cos(ang),.0,-sin(ang))*uFront);
    float fre=pow(1.-clamp(abs(dot(n,v)),0.,1.),3.2);
    vec3 r=reflect(-v,n);vec3 refl=env(r);
    float a=.06+.62*fre; vec3 col=mix(uTint*.9,refl,.7)*1.;
    // etiqueta impresa (solo en la cara frontal)
    vec4 lab=vec4(0.);
    if(uFront>.5&&vT.y>-1.42&&vT.y<.62){vec2 tc=vec2(vT.x,(.62-vT.y)/2.04);lab=texture2D(uTex,tc);}
    float shade=.72+.28*max(dot(n,normalize(vec3(-.5,.6,.7))),0.);
    vec3 ink=lab.rgb*shade+refl*.06*lab.a;
    col=mix(col,ink,lab.a); a=max(a,lab.a*.96);
    float spec=pow(max(dot(r,normalize(vec3(-.6,.45,.66))),0.),90.)*1.6;
    gl_FragColor=vec4(col+spec,clamp(a+spec*.5,0.,1.));}`;
  const F_LIQ = COMMON + `uniform vec3 uLiq;
  void main(){vec3 n=normalize(vN),v=normalize(uCam-vW);
    float dif=max(dot(n,normalize(vec3(-.5,.55,.7))),0.);float wrap=.45+.55*(dot(n,normalize(vec3(-.5,.55,.7)))*.5+.5);
    float fre=pow(1.-max(dot(n,v),0.),2.);
    vec3 c=uLiq*(.38+.72*wrap)+uLiq*fre*.25;
    // brillo lechoso cerca del borde y gradiente vertical suave
    c*=.92+.12*smoothstep(-1.5,1.,vL.y); c+=vec3(.06)*smoothstep(.75,1.,1.-abs(dot(n,v)));
    gl_FragColor=vec4(c,1.);}`;
  const F_CAP = COMMON + `
  void main(){vec3 n=normalize(vN),v=normalize(uCam-vW);float ang=vT.x*6.2832;
    float rid=sin(ang*90.)*step(1.47,vL.y)*step(vL.y,1.7); n=normalize(n+rid*.18*vec3(cos(ang),0.,-sin(ang)));
    float dif=max(dot(n,normalize(vec3(-.5,.6,.7))),0.);vec3 r=reflect(-v,n);
    vec3 c=vec3(.93,.93,.91)*(.42+.62*dif)+env(r)*.08;c+=pow(max(dot(r,normalize(vec3(-.6,.45,.66))),0.),40.)*.25;
    gl_FragColor=vec4(c,1.);}`;
  const F_SHADOW = `precision mediump float;varying vec2 vT;uniform float uA;void main(){float d=length(vT);gl_FragColor=vec4(0.,.07,.04,uA*smoothstep(1.,0.,d)*.42);}`;
  const V_SHADOW = `attribute vec2 aQ;uniform mat4 uPr,uVi;uniform vec3 uC;uniform vec2 uS;varying vec2 vT;void main(){vT=aQ;gl_Position=uPr*uVi*vec4(uC.x+aQ.x*uS.x,uC.y,uC.z+aQ.y*uS.y,1.);}`;

  // ---------- etiqueta (textura dibujada en canvas) ----------
  function labelTexture(font) {
    const W = 2048, H = 1024, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const g = cv.getContext('2d'); g.clearRect(0, 0, W, H);
    const cx = W * .5, ff = `"${font}", "Arial Narrow", Impact, sans-serif`;
    g.fillStyle = '#fff'; g.textBaseline = 'alphabetic';
    // wordmark apilado DUL / CE 29 (como la botella)
    g.textAlign = 'left'; g.font = `800 300px ${ff}`;
    const wD = g.measureText('DUL').width, left = cx - wD / 2;
    g.fillText('DUL', left, 330);
    const wDU = g.measureText('DU').width, wD1 = g.measureText('D').width;
    g.fillRect(left + wD1 + 6, 356, wDU - wD1 - 12, 16);           // barra bajo la U
    g.fillText('CE', left, 640);
    const xs = left + g.measureText('CE').width + 14;
    g.font = `700 112px ${ff}`; g.fillText('29', xs, 470);
    // ramita bajo el 29
    g.strokeStyle = '#fff'; g.lineWidth = 6; g.lineCap = 'round';
    g.beginPath(); g.moveTo(xs + 4, 600); g.quadraticCurveTo(xs + 50, 585, xs + 92, 548); g.stroke();
    [[xs + 34, 586, -1.1], [xs + 58, 571, .9], [xs + 80, 556, -.7], [xs + 94, 538, .2]].forEach(([x, y, a]) => { g.save(); g.translate(x, y); g.rotate(a); g.beginPath(); g.ellipse(0, -13, 7, 17, 0, 0, Math.PI * 2); g.fill(); g.restore(); });
    g.font = `600 38px ${ff}`; g.fillText('EST.', left - 4, 112);
    // textos chicos
    g.textAlign = 'center'; g.font = `700 42px ${ff}`; g.fillText('I N S P I R A N D O   H Á B I T O S', cx, 760);
    g.textAlign = 'left'; g.font = `600 32px ${ff}`;
    g.fillText('SIN ADITIVOS', left + 14, 868); g.fillText('NI CONSERVANTES', left + 14, 906);
    const bw = Math.max(g.measureText('NI CONSERVANTES').width, g.measureText('SIN ADITIVOS').width) + 28;
    g.lineWidth = 3; g.strokeRect(left, 832, bw, 92);
    g.font = `800 64px ${ff}`; const x9 = left + bw + 26; g.fillText('910', x9, 912); const w9 = g.measureText('910').width; g.font = `600 30px ${ff}`; g.fillText('CC', x9 + w9 + 6, 912);
    // sello "Leche vegetal"
    g.save(); g.translate(left + wD + 70, 560); g.fillStyle = '#7d7a3a'; g.beginPath(); g.arc(0, 0, 92, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#fff'; g.textAlign = 'center'; g.font = `700 42px ${ff}`; g.fillText('LECHE', 0, -4); g.fillText('VEGETAL', 0, 42); g.restore();
    // laterales
    g.globalAlpha = .85; g.font = `600 32px ${ff}`; g.textAlign = 'center';
    g.fillText('100% VEGETAL', W * .2, 860); g.fillText('ELABORADO EN COLONIA', W * .8, 860);
    g.globalAlpha = 1;
    return cv;
  }

  // ---------- matrices ----------
  const M4 = {
    persp(f, a, n, fr) { const t = 1 / Math.tan(f / 2); return new Float32Array([t / a, 0, 0, 0, 0, t, 0, 0, 0, 0, (fr + n) / (n - fr), -1, 0, 0, 2 * fr * n / (n - fr), 0]); },
    look(e, c) { let z = [e[0] - c[0], e[1] - c[1], e[2] - c[2]]; const nz = Math.hypot(...z); z = z.map(v => v / nz); let x = [z[2], 0, -z[0]]; const nx = Math.hypot(...x) || 1; x = x.map(v => v / nx); const y = [z[1] * x[2] - z[2] * x[1], z[2] * x[0] - z[0] * x[2], z[0] * x[1] - z[1] * x[0]];
      return new Float32Array([x[0], y[0], z[0], 0, x[1], y[1], z[1], 0, x[2], y[2], z[2], 0, -(x[0] * e[0] + x[1] * e[1] + x[2] * e[2]), -(y[0] * e[0] + y[1] * e[1] + y[2] * e[2]), -(z[0] * e[0] + z[1] * e[1] + z[2] * e[2]), 1]); },
    model(ry, rx, rz, tx, ty, s) { // R = Rz*Rx*Ry
      const cy = Math.cos(ry), sy = Math.sin(ry), cx = Math.cos(rx), sx = Math.sin(rx), cz = Math.cos(rz), sz = Math.sin(rz);
      const Ry = [cy, 0, -sy, 0, 1, 0, sy, 0, cy], Rx = [1, 0, 0, 0, cx, sx, 0, -sx, cx], Rz = [cz, sz, 0, -sz, cz, 0, 0, 0, 1];
      const mul3 = (a, b) => { const o = []; for (let c = 0; c < 3; c++) for (let r = 0; r < 3; r++) o[c * 3 + r] = a[r] * b[c * 3] + a[3 + r] * b[c * 3 + 1] + a[6 + r] * b[c * 3 + 2]; return o; };
      const R = mul3(Rz, mul3(Rx, Ry));
      return new Float32Array([R[0] * s, R[1] * s, R[2] * s, 0, R[3] * s, R[4] * s, R[5] * s, 0, R[6] * s, R[7] * s, R[8] * s, 0, tx, ty, 0, 1]);
    }
  };

  class Botella3D {
    constructor(canvas, opts = {}) {
      this.cv = canvas; this.o = Object.assign({ liquid: '#6B4632', font: 'Big Shoulders Display', interactive: true }, opts);
      const gl = canvas.getContext('webgl', { alpha: true, antialias: true, premultipliedAlpha: false });
      if (!gl) { this.failed = true; canvas.classList.add('no-webgl'); return; }
      this.gl = gl; gl.getExtension('OES_element_index_uint');
      this.rm = matchMedia('(prefers-reduced-motion: reduce)').matches;
      this.angle = .35; this.vel = .35; this.base = .35; this.boost = 0; this.drag = null; this.tilt = { x: 0, z: 0, tx: 0, tz: 0 }; this.mouse = { x: .5, y: .5 };
      this.liq = hex(this.o.liquid); this.liqTo = this.liq.slice(); this.bob = 0; this.visible = true;
      this.build(); this.events(); this.resize();
      this.loop = this.loop.bind(this); this.t0 = performance.now(); this.last = this.t0; requestAnimationFrame(this.loop);
    }
    prog(vs, fs) { const gl = this.gl, mk = (t, s) => { const x = gl.createShader(t); gl.shaderSource(x, s); gl.compileShader(x); if (!gl.getShaderParameter(x, gl.COMPILE_STATUS)) console.warn(gl.getShaderInfoLog(x)); return x; };
      const p = gl.createProgram(); gl.attachShader(p, mk(gl.VERTEX_SHADER, vs)); gl.attachShader(p, mk(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(p); if (!gl.getProgramParameter(p, gl.LINK_STATUS)) console.warn(gl.getProgramInfoLog(p)); p.u = {}; return p; }
    U(p, n) { return p.u[n] !== undefined ? p.u[n] : (p.u[n] = this.gl.getUniformLocation(p, n)); }
    mesh(g) { const gl = this.gl, b = a => { const x = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, x); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(a), gl.STATIC_DRAW); return x; };
      const ib = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(g.idx), gl.STATIC_DRAW);
      return { p: b(g.pos), n: b(g.nor), t: b(g.uv), i: ib, c: g.idx.length }; }
    build() {
      const gl = this.gl, seg = 128;
      const prof = smoothProfile(PROFILE, 10);
      this.glass = this.mesh(lathe(prof, seg));
      // líquido: mismo perfil, más chico, cortado a la altura de llenado y con tapa plana
      const fill = 1.02, lp = prof.filter(p => p[1] <= fill).map(p => [p[0] * .955, p[1]]); const top = lp[lp.length - 1];
      lp.push([top[0] * .6, fill + .004], [0, fill + .006]);
      this.liquidM = this.mesh(lathe(lp, seg));
      const cap = [[.286, 1.4], [.305, 1.41], [.31, 1.45], [.31, 1.68], [.302, 1.72], [.27, 1.745], [0, 1.75]];
      this.cap = this.mesh(lathe(smoothProfile(cap, 6), seg));
      this.pG = this.prog(V, F_GLASS); this.pL = this.prog(V, F_LIQ); this.pC = this.prog(V, F_CAP); this.pS = this.prog(V_SHADOW, F_SHADOW);
      this.quad = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, this.quad); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      this.tex = gl.createTexture(); this.drawLabel();
      if (document.fonts && document.fonts.load) document.fonts.load(`800 100px "${this.o.font}"`).then(() => this.drawLabel()).catch(() => { });
    }
    drawLabel() { const gl = this.gl, cv = labelTexture(this.o.font); gl.bindTexture(gl.TEXTURE_2D, this.tex); gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, cv); gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      const an = gl.getExtension('EXT_texture_filter_anisotropic'); if (an) gl.texParameterf(gl.TEXTURE_2D, an.TEXTURE_MAX_ANISOTROPY_EXT, 8); }
    setLiquid(h) { this.liqTo = hex(h); }
    kick(v) { this.boost = clamp(this.boost + v, -14, 14); }
    events() {
      const c = this.cv; let lastY = scrollY, lastT = performance.now(), lm = null;
      addEventListener('scroll', () => { const now = performance.now(), dt = Math.max(16, now - lastT), dy = scrollY - lastY; lastY = scrollY; lastT = now; this.kick(clamp(dy / dt * 1.6, -3, 3)); }, { passive: true });
      addEventListener('pointermove', e => {
        this.mouse.x = e.clientX / innerWidth; this.mouse.y = e.clientY / innerHeight;
        const now = performance.now(); if (lm && !this.drag) { const sp = Math.hypot(e.clientX - lm.x, e.clientY - lm.y) / Math.max(8, now - lm.t); this.kick(Math.sign(e.clientX - lm.x || 1) * clamp(sp * .5, 0, 1.2)); }
        lm = { x: e.clientX, y: e.clientY, t: now };
        if (this.drag) { const dx = e.clientX - this.drag.x; this.drag.x = e.clientX; this.angle += dx * .012; this.drag.v = dx * .012 / Math.max(.008, (now - this.drag.t) / 1000); this.drag.t = now; }
      }, { passive: true });
      if (this.o.interactive) {
        c.addEventListener('pointerdown', e => { this.drag = { x: e.clientX, t: performance.now(), v: 0 }; c.setPointerCapture(e.pointerId); c.classList.add('grabbing'); });
        const up = () => { if (!this.drag) return; this.vel = clamp(this.drag.v, -18, 18); this.boost = this.vel - this.base; this.drag = null; c.classList.remove('grabbing'); };
        c.addEventListener('pointerup', up); c.addEventListener('pointercancel', up);
      }
      this.ro = new ResizeObserver(() => this.resize()); this.ro.observe(c);
      new IntersectionObserver(es => { this.visible = es[0].isIntersecting; }).observe(c);
    }
    resize() { const gl = this.gl, r = this.cv.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 2); this.cv.width = Math.max(1, r.width * d); this.cv.height = Math.max(1, r.height * d); gl.viewport(0, 0, this.cv.width, this.cv.height); this.aspect = r.width / Math.max(1, r.height); }
    draw(m, p) { const gl = this.gl; [['aP', m.p, 3], ['aN', m.n, 3], ['aT', m.t, 2]].forEach(([n, b, s]) => { const l = gl.getAttribLocation(p, n); if (l < 0) return; gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.enableVertexAttribArray(l); gl.vertexAttribPointer(l, s, gl.FLOAT, false, 0, 0); });
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, m.i); gl.drawElements(gl.TRIANGLES, m.c, gl.UNSIGNED_INT, 0); }
    loop(now) {
      requestAnimationFrame(this.loop); if (!this.visible) { this.last = now; return; }
      const gl = this.gl, dt = Math.min(.05, (now - this.last) / 1000); this.last = now; const t = (now - this.t0) / 1000;
      // velocidad de giro: base + impulso (scroll / mouse) que se disipa
      if (!this.drag) { this.boost *= Math.pow(.12, dt); this.vel = lerp(this.vel, (this.rm ? .12 : this.base) + this.boost, 1 - Math.pow(.02, dt)); this.angle += this.vel * dt; }
      this.tilt.tx = (this.mouse.y - .5) * .22; this.tilt.tz = -(this.mouse.x - .5) * .12 - clamp(this.vel * .006, -.05, .05);
      this.tilt.x = lerp(this.tilt.x, this.tilt.tx, 1 - Math.pow(.05, dt)); this.tilt.z = lerp(this.tilt.z, this.tilt.tz, 1 - Math.pow(.05, dt));
      for (let i = 0; i < 3; i++) this.liq[i] = lerp(this.liq[i], this.liqTo[i], 1 - Math.pow(.04, dt));
      const bob = this.rm ? 0 : Math.sin(t * 1.3) * .045;
      const cam = [0, .3, 7.6], P = M4.persp(30 * Math.PI / 180, this.aspect, .1, 40), Vm = M4.look(cam, [0, .1, 0]);
      const s = this.aspect < .8 ? .86 : 1, Mm = M4.model(this.angle, this.tilt.x, this.tilt.z, (this.mouse.x - .5) * .18, bob - .05, s);
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      // sombra
      gl.disable(gl.DEPTH_TEST); gl.useProgram(this.pS); const lq = gl.getAttribLocation(this.pS, 'aQ'); gl.bindBuffer(gl.ARRAY_BUFFER, this.quad); gl.enableVertexAttribArray(lq); gl.vertexAttribPointer(lq, 2, gl.FLOAT, false, 0, 0);
      gl.uniformMatrix4fv(this.U(this.pS, 'uPr'), false, P); gl.uniformMatrix4fv(this.U(this.pS, 'uVi'), false, Vm); gl.uniform3f(this.U(this.pS, 'uC'), (this.mouse.x - .5) * .18, -1.62, 0);
      gl.uniform2f(this.U(this.pS, 'uS'), .95 - bob * 1.2, .5); gl.uniform1f(this.U(this.pS, 'uA'), 1 - bob * 2); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); gl.disableVertexAttribArray(lq);
      const setP = (p, inset) => { gl.useProgram(p); gl.uniformMatrix4fv(this.U(p, 'uPr'), false, P); gl.uniformMatrix4fv(this.U(p, 'uVi'), false, Vm); gl.uniformMatrix4fv(this.U(p, 'uMo'), false, Mm); gl.uniform3fv(this.U(p, 'uCam'), cam); gl.uniform1f(this.U(p, 'uTime'), t); gl.uniform1f(this.U(p, 'uInset'), inset || 0); };
      gl.enable(gl.DEPTH_TEST); gl.enable(gl.CULL_FACE);
      // 1) cara interior del vidrio (atrás)
      gl.cullFace(gl.FRONT); gl.depthMask(false); setP(this.pG); gl.uniform1f(this.U(this.pG, 'uFront'), 0); gl.uniform3f(this.U(this.pG, 'uTint'), .86, .9, .88); gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, this.tex); gl.uniform1i(this.U(this.pG, 'uTex'), 0); this.draw(this.glass, this.pG);
      // 2) líquido y tapa (opacos)
      gl.depthMask(true); gl.cullFace(gl.BACK); setP(this.pL); gl.uniform3fv(this.U(this.pL, 'uLiq'), this.liq); this.draw(this.liquidM, this.pL);
      setP(this.pC); this.draw(this.cap, this.pC);
      // 3) cara exterior del vidrio con la etiqueta
      gl.depthMask(false); setP(this.pG); gl.uniform1f(this.U(this.pG, 'uFront'), 1); this.draw(this.glass, this.pG); gl.depthMask(true);
      gl.disable(gl.CULL_FACE);
    }
  }
  window.Botella3D = Botella3D;
})();
