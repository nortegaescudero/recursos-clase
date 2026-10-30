// Sección 4: selección natural con las polillas del abedul (Biston betularia).
// Los alumnos hacen de pájaro y cazan polillas; las que sobreviven tienen hijos como ellas.
var SeccionSeleccion = (function () {
  "use strict";
  var C = Comun, L, barra, N = 24, polillas = [], ambiente = "limpio", gen = 1, historia = [], modo = "espera", tiempo = 0, efectos = [], autoPasos = 0, autoT = 0;
  var cortezas = {}, btnLimpio, btnHollin, btnJugar, btnAuto, mensaje = "";
  var TRONCO = { x: 40, y: 20, w: 700, h: 520 };
  var semilla = 7; function rnd() { semilla = (semilla * 16807) % 2147483647; return (semilla - 1) / 2147483646; }

  // ---------- corteza del abedul (limpia o con hollín) ----------
  function corteza(tipo) {
    var cv = document.createElement("canvas"); cv.width = TRONCO.w; cv.height = TRONCO.h; var g = cv.getContext("2d"), s = 11;
    var r = function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
    var limpio = tipo === "limpio";
    g.fillStyle = limpio ? "#d8d3c4" : "#3d3836"; g.fillRect(0, 0, cv.width, cv.height);
    for (var i = 0; i < 260; i++) {   // vetas horizontales típicas del abedul y líquenes
      g.fillStyle = limpio ? (r() < 0.5 ? "rgba(120,110,95,.35)" : "rgba(245,242,232,.7)") : (r() < 0.5 ? "rgba(20,18,18,.55)" : "rgba(95,88,82,.45)");
      var w = 20 + r() * 110, h = 3 + r() * 7; g.fillRect(r() * cv.width - 20, r() * cv.height, w, h);
    }
    for (i = 0; i < 160; i++) {
      g.fillStyle = limpio ? (r() < 0.6 ? "rgba(170,182,150,.55)" : "rgba(110,105,95,.4)") : "rgba(15,14,14,.5)";
      g.beginPath(); g.ellipse(r() * cv.width, r() * cv.height, 6 + r() * 22, 4 + r() * 14, r() * 3, 0, 7); g.fill();
    }
    return cv;
  }

  // ---------- polillas ----------
  function colocar(oscura) {
    for (var intento = 0; intento < 200; intento++) {
      var x = TRONCO.x + 50 + rnd() * (TRONCO.w - 100), y = TRONCO.y + 45 + rnd() * (TRONCO.h - 90);
      if (polillas.every(function (p) { return !p.viva || Math.hypot(p.x - x, p.y - y) > 62; })) return { x: x, y: y, a: (rnd() - 0.5) * 1.2, oscura: oscura, viva: true, salto: 0 };
    }
    return { x: x, y: y, a: 0, oscura: oscura, viva: true, salto: 0 };
  }
  function poblacion(oscuras) {
    polillas = []; var lista = []; for (var i = 0; i < N; i++) lista.push(i < oscuras);
    C.barajar(lista).forEach(function (o) { polillas.push(colocar(o)); });
  }
  function dibujarPolilla(g, p) {
    g.save(); g.translate(p.x, p.y); g.rotate(p.a); var s = 1 + p.salto * 0.25; g.scale(s, s);
    var ala = p.oscura ? "#2f2b2a" : "#e9e3d1", mota = p.oscura ? "rgba(120,110,100,.8)" : "rgba(90,82,70,.75)";
    g.fillStyle = ala; g.strokeStyle = p.oscura ? "#1a1716" : "#8c836f"; g.lineWidth = 1.5;
    [-1, 1].forEach(function (l) {
      g.beginPath(); g.moveTo(0, -4); g.quadraticCurveTo(l * 34, -20, l * 30, 6); g.quadraticCurveTo(l * 18, 16, 0, 8); g.closePath(); g.fill(); g.stroke();
      g.fillStyle = mota; for (var i = 0; i < 6; i++) { g.beginPath(); g.arc(l * (8 + (i * 7) % 18), -6 + (i * 5) % 13, 1.8, 0, 7); g.fill(); } g.fillStyle = ala;
    });
    g.fillStyle = p.oscura ? "#1a1716" : "#7d745f"; g.beginPath(); g.ellipse(0, 2, 3.5, 11, 0, 0, 7); g.fill();
    g.strokeStyle = g.fillStyle; g.lineWidth = 1.2; g.beginPath(); g.moveTo(-1, -8); g.lineTo(-7, -17); g.moveTo(1, -8); g.lineTo(7, -17); g.stroke();
    g.restore();
  }
  function porcentajeOscuras() { var v = polillas.filter(function (p) { return p.viva; }); return v.length ? Math.round(v.filter(function (p) { return p.oscura; }).length / v.length * 100) : 0; }

  // ---------- caza y nueva generación ----------
  function cazar(p) {
    p.viva = false; efectos.push({ x: p.x, y: p.y, t: 0, txt: "¡Ñam!" });
  }
  function nuevaGeneracion() {
    var vivas = polillas.filter(function (p) { return p.viva; });
    if (!vivas.length) { poblacion(Math.round(N / 2)); return; }
    var hijos = [];
    for (var i = 0; i < N; i++) {
      var madre = vivas[Math.floor(rnd() * vivas.length)], o = madre.oscura;
      if (rnd() < 0.03) o = !o;   // mutación
      hijos.push(o);
    }
    polillas = []; hijos.forEach(function (o) { polillas.push(colocar(o)); });
    gen++; historia.push(porcentajeOscuras());
  }
  // el pájaro automático ve mejor las polillas que contrastan con la corteza
  function visibilidad(p) { return (ambiente === "limpio") === p.oscura ? 1 : 0.12; }
  function cazaAutomatica() {
    var vivas = polillas.filter(function (p) { return p.viva; }), total = vivas.reduce(function (s, p) { return s + visibilidad(p); }, 0), r = rnd() * total;
    for (var i = 0; i < vivas.length; i++) { r -= visibilidad(vivas[i]); if (r <= 0) { cazar(vivas[i]); return; } }
  }

  // ---------- gráfica ----------
  function grafica(g) {
    var x0 = 790, y0 = 60, w = 185, h = 300;
    g.fillStyle = "#fff"; g.strokeStyle = "#1f2a44"; g.lineWidth = 2.5; C.redondo(g, x0 - 14, y0 - 46, w + 28, h + 120, 16); g.fill(); g.stroke();
    C.texto(g, "% de polillas oscuras", x0 + w / 2, y0 - 22, 16);
    g.strokeStyle = "#d4dccf"; g.lineWidth = 1; for (var p = 0; p <= 100; p += 25) { var yy = y0 + h - p / 100 * h; g.beginPath(); g.moveTo(x0, yy); g.lineTo(x0 + w, yy); g.stroke(); C.texto(g, p + "", x0 - 2, yy, 11, "#56607a", "right", false); }
    var pts = historia.slice(-12), n = Math.max(pts.length, 2);
    g.strokeStyle = "#2f2b2a"; g.lineWidth = 4; g.beginPath();
    pts.forEach(function (v, i) { var x = x0 + 10 + i / (n - 1) * (w - 20), y = y0 + h - v / 100 * h; if (i) g.lineTo(x, y); else g.moveTo(x, y); }); g.stroke();
    g.fillStyle = "#f2b705"; pts.forEach(function (v, i) { var x = x0 + 10 + i / (n - 1) * (w - 20), y = y0 + h - v / 100 * h; g.beginPath(); g.arc(x, y, 5, 0, 7); g.fill(); g.stroke(); });
    C.texto(g, "Generaciones →", x0 + w / 2, y0 + h + 16, 13, "#56607a");
    var vivas = polillas.filter(function (q) { return q.viva; });
    C.texto(g, "Generación " + gen, x0 + w / 2, y0 + h + 42, 19);
    C.texto(g, "Claras: " + vivas.filter(function (q) { return !q.oscura; }).length + "   Oscuras: " + vivas.filter(function (q) { return q.oscura; }).length, x0 + w / 2, y0 + h + 64, 15, "#56607a");
  }

  function tick(dt, t) {
    if (!L.empezar()) return;
    var g = L.g;
    if (!cortezas[ambiente]) cortezas[ambiente] = corteza(ambiente);
    g.save(); C.redondo(g, TRONCO.x, TRONCO.y, TRONCO.w, TRONCO.h, 18); g.clip(); g.drawImage(cortezas[ambiente], TRONCO.x, TRONCO.y); g.restore();
    g.strokeStyle = "#1f2a44"; g.lineWidth = 3; C.redondo(g, TRONCO.x, TRONCO.y, TRONCO.w, TRONCO.h, 18); g.stroke();
    polillas.forEach(function (p) { if (p.viva) { p.salto = Math.max(0, p.salto - dt * 3); dibujarPolilla(g, p); } });
    efectos = efectos.filter(function (e) { e.t += dt; return e.t < 0.8; });
    efectos.forEach(function (e) { g.save(); g.globalAlpha = 1 - e.t / 0.8; C.etiqueta(g, e.txt, e.x, e.y - e.t * 40, { fondo: "#f2b705", tam: 16 }); g.restore(); });
    grafica(g);
    // modos
    if (modo === "jugando") {
      tiempo -= dt;
      var cazadas = polillas.filter(function (p) { return !p.viva; }).length;
      C.etiqueta(g, "Tiempo: " + Math.max(0, Math.ceil(tiempo)) + " s · Cazadas: " + cazadas, TRONCO.x + TRONCO.w / 2, 52, { tam: 22, fondo: "#fff" });
      if (tiempo <= 0 || cazadas >= N / 2) { modo = "fin"; mensaje = "¡Fin! Pulsa «Siguiente generación»: las supervivientes tendrán hijos."; pintarBarra(); }
    } else if (modo === "auto") {
      autoT += dt;
      if (autoT > 0.09) { autoT = 0;
        if (polillas.filter(function (p) { return !p.viva; }).length < N / 2) cazaAutomatica();
        else { autoPasos--; nuevaGeneracion(); if (autoPasos <= 0) { modo = "espera"; mensaje = ""; pintarBarra(); } }
      }
    }
    if (mensaje) C.etiqueta(g, mensaje, TRONCO.x + TRONCO.w / 2, TRONCO.y + TRONCO.h - 30, { tam: 18, fondo: "#fff6d6" });
  }

  // ---------- controles ----------
  function reiniciar() { semilla = 7; gen = 1; poblacion(ambiente === "limpio" ? 4 : 12); historia = [porcentajeOscuras()]; modo = "espera"; mensaje = ""; pintarBarra(); }
  function ponerAmbiente(a) { ambiente = a; btnLimpio.setAttribute("aria-pressed", a === "limpio"); btnHollin.setAttribute("aria-pressed", a !== "limpio"); mensaje = ""; modo = "espera"; pintarBarra(); }
  function jugar() {
    if (modo === "fin") { nuevaGeneracion(); modo = "espera"; mensaje = ""; pintarBarra(); return; }
    modo = "jugando"; tiempo = 12; mensaje = ""; pintarBarra();
  }
  function auto() { if (modo === "fin") nuevaGeneracion(); modo = "auto"; autoPasos = 8; autoT = 0; mensaje = "El pájaro caza durante 8 generaciones…"; pintarBarra(); }
  function pintarBarra() {
    barra.titulo("", ambiente === "limpio" ? "Bosque limpio" : "Bosque con hollín (Revolución Industrial)");
    btnJugar.innerHTML = modo === "fin" ? "Siguiente generación ›" : "Sé el pájaro (12 s)";
    btnJugar.disabled = modo === "jugando" || modo === "auto"; btnAuto.disabled = modo === "jugando" || modo === "auto";
    panel();
  }
  function panel() {
    C.panel('<span class="kicker">Darwin y la selección natural</span><h3>La polilla del abedul</h3>' +
      "<p>En Inglaterra vivía una polilla con dos formas: <b>clara</b> (la mayoría) y <b>oscura</b> (muy rara, por una mutación). De día descansan sobre la corteza de los árboles y los <b>pájaros</b> se las comen.</p>" +
      "<p>Con la <b>Revolución Industrial</b>, el hollín de las fábricas ennegreció los troncos. En pocos años casi todas las polillas eran oscuras.</p>" +
      '<div class="caja recuerda"><b class="t">¡Pruébalo!</b>Pulsa <b>«Sé el pájaro»</b> y caza todas las polillas que veas en 12 segundos. Después pasa a la siguiente generación. Prueba en los dos bosques y mira la gráfica.</div>' +
      "<h4>Las ideas de Darwin</h4><ol class=\"lista\"><li><b>Variación</b>: los individuos de una especie son distintos entre sí.</li><li><b>Herencia</b>: muchas de esas diferencias pasan a los hijos.</li><li><b>Selección</b>: nacen más de los que pueden sobrevivir; los <b>mejor adaptados</b> al ambiente sobreviven y tienen más hijos.</li><li><b>Evolución</b>: generación tras generación, la población cambia.</li></ol>" +
      '<h4>Lamarck y Darwin</h4><table class="tabla"><tr><th>Lamarck (1809)</th><th>Darwin (1859)</th></tr><tr><td>Las jirafas estiraban el cuello para llegar a las hojas altas y ese cuello largo pasaba a sus hijos.</td><td>Ya había jirafas con el cuello más largo que otras: llegaban a más hojas, sobrevivían más y tenían más hijos.</td></tr><tr><td>❌ Los caracteres adquiridos <b>no se heredan</b>.</td><td>✅ Es la explicación que acepta hoy la ciencia.</td></tr></table>' +
      '<div class="caja dato"><b class="t">¡Ojo!</b>Las polillas no cambian de color «para» esconderse: la mutación aparece al azar. El ambiente solo <b>selecciona</b> a las que ya estaban mejor adaptadas.</div>');
  }
  function crear(cont) {
    var lz = C.el("div", { class: "lienzo" }); cont.appendChild(lz); L = C.lienzo(lz);
    L.cv.style.cursor = "crosshair";
    L.cv.addEventListener("pointerdown", function (ev) {
      if (modo !== "jugando") return;
      var p = L.punto(ev), mejor = null, d = 34;
      polillas.forEach(function (q) { if (!q.viva) return; var dd = Math.hypot(q.x - p.x, q.y - p.y); if (dd < d) { d = dd; mejor = q; } });
      if (mejor) cazar(mejor); else efectos.push({ x: p.x, y: p.y, t: 0, txt: "¡Fallo!" });
    });
    barra = C.barra(cont);
    var g1 = barra.grupo();
    btnLimpio = C.boton(g1, "Bosque limpio", function () { ponerAmbiente("limpio"); }); btnHollin = C.boton(g1, "Bosque con hollín", function () { ponerAmbiente("hollin"); });
    var g2 = barra.grupo();
    btnJugar = C.boton(g2, "Sé el pájaro (12 s)", jugar, "amarillo");
    btnAuto = C.boton(g2, "Automático", auto, "", "El ordenador hace de pájaro durante 8 generaciones");
    C.boton(g2, C.ICONOS.reinicio, reiniciar, "", "Volver a empezar");
    var q = new URLSearchParams(location.search);
    ponerAmbiente(q.get("amb") === "hollin" ? "hollin" : "limpio"); reiniciar();
    var gq = parseInt(q.get("gen"), 10); if (gq > 1) { for (var i = 1; i < gq; i++) { while (polillas.filter(function (p) { return !p.viva; }).length < N / 2) cazaAutomatica(); nuevaGeneracion(); } efectos = []; }
  }
  return { crear: crear, mostrar: function () { pintarBarra(); C.alTick(tick); }, estado: function () { return { modo: modo, tiempo: tiempo, vivas: polillas.filter(function (p) { return p.viva; }).length, gen: gen }; } };
})();
