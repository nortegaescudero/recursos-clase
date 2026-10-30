// Utilidades compartidas: lienzos con coordenadas fijas (1000 × 560), bucle de animación,
// panel lateral y barra inferior de cada sección.
var Comun = (function () {
  "use strict";
  var W = 1000, H = 560;
  function $(id) { return document.getElementById(id); }
  function el(tag, attrs, html) {
    var e = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) { if (k === "class") e.className = attrs[k]; else e.setAttribute(k, attrs[k]); });
    if (html !== undefined) e.innerHTML = html;
    return e;
  }

  // Lienzo que dibuja en coordenadas lógicas W × H, centrado y escalado para que quepa.
  function lienzo(contenedor) {
    var cv = el("canvas"), g = cv.getContext("2d"), L = { cv: cv, g: g, s: 1, ox: 0, oy: 0, W: W, H: H };
    contenedor.appendChild(cv);
    L.ajustar = function () {
      var r = cv.getBoundingClientRect(), dpr = Math.min(2, window.devicePixelRatio || 1);
      if (!r.width || !r.height) return false;
      if (cv.width !== Math.round(r.width * dpr) || cv.height !== Math.round(r.height * dpr)) { cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr); }
      L.s = Math.min(r.width / W, r.height / H); L.ox = (r.width - W * L.s) / 2; L.oy = (r.height - H * L.s) / 2;
      L.dpr = dpr; L.rw = r.width; L.rh = r.height;
      return true;
    };
    L.empezar = function () {   // borra y deja el sistema de coordenadas listo
      if (!L.ajustar()) return false;
      g.setTransform(L.dpr, 0, 0, L.dpr, 0, 0); g.clearRect(0, 0, L.rw, L.rh);
      g.setTransform(L.s * L.dpr, 0, 0, L.s * L.dpr, L.ox * L.dpr, L.oy * L.dpr);
      return true;
    };
    L.punto = function (ev) { var r = cv.getBoundingClientRect(); return { x: (ev.clientX - r.left - L.ox) / L.s, y: (ev.clientY - r.top - L.oy) / L.s }; };
    return L;
  }

  // Texto con el tipo de letra de la web
  function texto(g, t, x, y, tam, color, alin, negrita) {
    g.font = (negrita === false ? "" : "bold ") + tam + "px 'Atkinson Hyperlegible','Segoe UI',sans-serif";
    g.fillStyle = color || "#1f2a44"; g.textAlign = alin || "center"; g.textBaseline = "middle"; g.fillText(t, x, y);
  }
  function etiqueta(g, t, x, y, opc) {
    opc = opc || {};
    g.font = "bold " + (opc.tam || 17) + "px 'Atkinson Hyperlegible','Segoe UI',sans-serif";
    var w = g.measureText(t).width + 20, h = (opc.tam || 17) + 12;
    g.fillStyle = opc.fondo || "rgba(255,255,255,.95)"; g.strokeStyle = opc.borde || "#1f2a44"; g.lineWidth = 2;
    redondo(g, x - w / 2, y - h / 2, w, h, h / 2); g.fill(); g.stroke();
    g.fillStyle = opc.color || "#1f2a44"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(t, x, y + 1);
  }
  function redondo(g, x, y, w, h, r) {
    g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
  }
  function flecha(g, x1, y1, x2, y2, color, ancho) {
    var a = Math.atan2(y2 - y1, x2 - x1); g.strokeStyle = g.fillStyle = color || "#1f2a44"; g.lineWidth = ancho || 3; g.lineCap = "round";
    g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2 - Math.cos(a) * 8, y2 - Math.sin(a) * 8); g.stroke();
    g.beginPath(); g.moveTo(x2, y2); g.lineTo(x2 - Math.cos(a - 0.45) * 15, y2 - Math.sin(a - 0.45) * 15); g.lineTo(x2 - Math.cos(a + 0.45) * 15, y2 - Math.sin(a + 0.45) * 15); g.closePath(); g.fill();
  }

  // Bucle de animación único (con respaldo si el navegador deja de pintar)
  var tick = null, ultimo = performance.now(), ultimoCuadro = 0;
  function cuadro() {
    var ahora = performance.now(), dt = Math.min(0.25, (ahora - ultimo) / 1000); ultimo = ahora; ultimoCuadro = ahora;
    if (tick) tick(dt, ahora / 1000);
  }
  function bucle() { cuadro(); requestAnimationFrame(bucle); }
  requestAnimationFrame(bucle);
  setInterval(function () { if (performance.now() - ultimoCuadro > 300) cuadro(); }, 100);

  // Barra inferior: título con número + grupos de botones
  function barra(cont) {
    var b = el("div", { class: "barra" });
    b.innerHTML = '<div class="titulo"><span class="num"></span><h2></h2></div>';
    cont.appendChild(b);
    return { el: b, titulo: function (n, t) { b.querySelector(".num").textContent = n; b.querySelector(".num").hidden = !n; b.querySelector("h2").textContent = t; },
      grupo: function () { var gr = el("div", { class: "grupo" }); b.appendChild(gr); return gr; } };
  }
  function boton(gr, html, fn, clase, titulo) { var b = el("button", { class: "cbtn " + (clase || ""), title: titulo || "" }, html); b.onclick = fn; gr.appendChild(b); return b; }
  var ICONOS = {
    play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.5v15L20 12z"/></svg>',
    pausa: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 4.5h4v15H6zM14 4.5h4v15h-4z"/></svg>',
    ant: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 5h2.6v14H6zM20 5v14L9.5 12z"/></svg>',
    sig: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M15.4 5H18v14h-2.6zM4 5v14l10.5-7z"/></svg>',
    reinicio: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12a8 8 0 1 0 2.4-5.7"/><path d="M4 4v5h5"/></svg>'
  };

  var panelActual = "";
  function panel(html) { if (html !== panelActual) { $("panel").innerHTML = html; $("panel").scrollTop = 0; panelActual = html; } }
  function suave(t) { t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t); }
  function mezclar(a, b, t) { return a + (b - a) * t; }
  function barajar(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), x = a[i]; a[i] = a[j]; a[j] = x; } return a; }

  return { W: W, H: H, $: $, el: el, lienzo: lienzo, texto: texto, etiqueta: etiqueta, redondo: redondo, flecha: flecha,
    alTick: function (f) { tick = f; }, barra: barra, boton: boton, ICONOS: ICONOS, panel: panel, suave: suave, mezclar: mezclar, barajar: barajar };
})();
