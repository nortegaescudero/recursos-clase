// Sección 2: mitosis y meiosis animadas fase a fase. Célula con 2n = 4: dos parejas de cromosomas
// (largo y corto); azul = del padre, rojo = de la madre.
var SeccionDivision = (function () {
  "use strict";
  var C = Comun, L, barra, modo = "mitosis", fase = 0, k = 1, desde = null, jugando = false, espera = 0, btnPlay, btnMit, btnMei;
  var PI2 = Math.PI / 2, AZUL = "#3d6fd8", ROJO = "#e5534b";
  var CROMOS = { Ap: { len: 128, col: AZUL, otro: ROJO }, Am: { len: 128, col: ROJO, otro: AZUL }, Bp: { len: 72, col: AZUL, otro: ROJO }, Bm: { len: 72, col: ROJO, otro: AZUL } };
  var IDS = []; Object.keys(CROMOS).forEach(function (c) { IDS.push(c + "0", c + "1"); });

  // ---------- construcción de las fases ----------
  function celdas(lista) { var r = []; for (var i = 0; i < 4; i++) r.push(lista[Math.floor(i * lista.length / 4)]); return r; }
  function fotograma(o) {
    var f = { nombre: o.nombre, texto: o.texto, grosor: o.grosor || 13, largo: o.largo || 1, nucleo: o.nucleo || 0, husos: o.husos || null, placa: o.placa || null,
      celulas: celdas(o.celulas), cruce: !!o.cruce, crom: {}, etiquetas: o.etiquetas || [] };
    return f;
  }
  function par(f, c, x, y, a, sep) { f.crom[c + "0"] = { x: x, y: y, a: a + sep }; f.crom[c + "1"] = { x: x, y: y, a: a - sep }; }
  function una(f, id, x, y, a) { f.crom[id] = { x: x, y: y, a: a }; }
  var UNA = [{ x: 500, y: 270, rx: 270, ry: 205 }];
  function interfase(f, sep) { par(f, "Ap", 445, 220, 0.7, sep); par(f, "Am", 565, 300, -0.5, sep); par(f, "Bp", 470, 325, 1.3, sep); par(f, "Bm", 560, 210, 2.2, sep); }

  var MITOSIS = (function () {
    var F = [];
    var f = fotograma({ nombre: "Interfase", celulas: UNA, grosor: 4, largo: 1.25, nucleo: 1,
      texto: "La célula crece y trabaja. Su ADN está desenrollado (cromatina) dentro del núcleo." }); interfase(f, 0); F.push(f);
    f = fotograma({ nombre: "Interfase: se copia el ADN", celulas: UNA, grosor: 5, largo: 1.25, nucleo: 1,
      texto: "Antes de dividirse, la célula <b>copia su ADN</b>. Ahora cada cromosoma tiene dos cromátidas idénticas." }); interfase(f, 0.12); F.push(f);
    f = fotograma({ nombre: "Profase", celulas: UNA, nucleo: 0.3,
      texto: "El ADN se enrolla y se ven los <b>cromosomas</b> con forma de X. La envoltura del núcleo empieza a desaparecer." });
    par(f, "Ap", 400, 200, 0.5, 0.3); par(f, "Am", 600, 330, -0.6, 0.3); par(f, "Bp", 430, 350, 1.4, 0.3); par(f, "Bm", 590, 195, 2.3, 0.3); F.push(f);
    f = fotograma({ nombre: "Metafase", celulas: UNA, husos: [[255, 270], [745, 270]], placa: [500], largo: 0.72,
      texto: "Los cromosomas se colocan en fila en el <b>centro de la célula</b> (placa ecuatorial), enganchados a los hilos del <b>huso</b>.",
      etiquetas: [["Huso", 320, 120], ["Placa ecuatorial", 500, 498]] });
    par(f, "Ap", 500, 128, PI2, 0.3); par(f, "Bp", 500, 222, PI2, 0.3); par(f, "Am", 500, 316, PI2, 0.3); par(f, "Bm", 500, 410, PI2, 0.3); F.push(f);
    f = fotograma({ nombre: "Anafase", celulas: [{ x: 500, y: 270, rx: 310, ry: 185 }], husos: [[225, 270], [775, 270]], largo: 0.72,
      texto: "Las <b>cromátidas hermanas se separan</b> y cada una va hacia un polo de la célula." });
    ["Ap", "Bp", "Am", "Bm"].forEach(function (c, i) { var y = 270 + ([128, 222, 316, 410][i] - 270) * 0.8; una(f, c + "0", 665, y, PI2 + 0.15); una(f, c + "1", 335, y, PI2 - 0.15); }); F.push(f);
    f = fotograma({ nombre: "Telofase y citocinesis", celulas: [{ x: 335, y: 270, rx: 195, ry: 170 }, { x: 665, y: 270, rx: 195, ry: 170 }], nucleo: 0.6, grosor: 9,
      texto: "Se forman dos núcleos nuevos y la célula se <b>estrangula</b> por el centro hasta partirse en dos." });
    var pos = [[-30, -45, 0.6], [35, -20, 2.2], [-35, 45, 1.3], [30, 45, -0.5]];
    ["Ap", "Bm", "Bp", "Am"].forEach(function (c, i) { var p = pos[i]; una(f, c + "1", 335 + p[0], 270 + p[1], p[2]); una(f, c + "0", 665 + p[0], 270 + p[1], p[2]); }); F.push(f);
    f = fotograma({ nombre: "Resultado: 2 células hijas", celulas: [{ x: 265, y: 255, rx: 205, ry: 180 }, { x: 735, y: 255, rx: 205, ry: 180 }], nucleo: 1, grosor: 9,
      texto: "Salen <b>2 células idénticas</b> a la madre, con el <b>mismo número de cromosomas</b> (2n = 4).",
      etiquetas: [["2n = 4", 265, 475, true], ["2n = 4", 735, 475, true]] });
    ["Ap", "Bm", "Bp", "Am"].forEach(function (c, i) { var p = pos[i]; una(f, c + "1", 265 + p[0] * 1.3, 255 + p[1] * 1.3, p[2]); una(f, c + "0", 735 + p[0] * 1.3, 255 + p[1] * 1.3, p[2]); }); F.push(f);
    return F;
  })();

  var MEIOSIS = (function () {
    var F = [];
    var f = fotograma({ nombre: "Interfase", celulas: UNA, grosor: 4, largo: 1.25, nucleo: 1,
      texto: "Una célula con <b>2n = 4</b> cromosomas: dos del padre (azul) y dos de la madre (rojo)." }); interfase(f, 0); F.push(f);
    f = fotograma({ nombre: "Interfase: se copia el ADN", celulas: UNA, grosor: 5, largo: 1.25, nucleo: 1,
      texto: "Igual que en la mitosis, primero se <b>copia el ADN</b>." }); interfase(f, 0.12); F.push(f);
    f = fotograma({ nombre: "Profase I: se juntan las parejas", celulas: UNA, nucleo: 0.35,
      texto: "Los cromosomas <b>homólogos</b> (el del padre y el de la madre) se <b>emparejan</b>." });
    par(f, "Ap", 432, 198, 0.55, 0.26); par(f, "Am", 410, 233, 0.55, 0.26); par(f, "Bp", 560, 322, 1.25, 0.26); par(f, "Bm", 524, 334, 1.25, 0.26); F.push(f);
    f = fotograma({ nombre: "Profase I: sobrecruzamiento", celulas: UNA, nucleo: 0.35, cruce: true,
      texto: "Los homólogos <b>intercambian trozos</b> de ADN: es el <b>sobrecruzamiento</b>. Así se mezclan genes del padre y de la madre.",
      etiquetas: [["¡Intercambio!", 300, 140, false, "#f2b705"]] });
    par(f, "Ap", 432, 198, 0.55, 0.26); par(f, "Am", 410, 233, 0.55, 0.26); par(f, "Bp", 560, 322, 1.25, 0.26); par(f, "Bm", 524, 334, 1.25, 0.26); F.push(f);
    f = fotograma({ nombre: "Metafase I", celulas: UNA, husos: [[255, 270], [745, 270]], placa: [500], cruce: true,
      texto: "Las <b>parejas</b> se colocan en el centro, cada homólogo mirando a un polo. Cómo se colocan es <b>al azar</b>." });
    par(f, "Ap", 468, 185, PI2, 0.28); par(f, "Am", 532, 185, PI2, 0.28); par(f, "Bm", 468, 350, PI2, 0.28); par(f, "Bp", 532, 350, PI2, 0.28); F.push(f);
    f = fotograma({ nombre: "Anafase I", celulas: [{ x: 500, y: 270, rx: 310, ry: 185 }], husos: [[225, 270], [775, 270]], cruce: true,
      texto: "Se separan los <b>homólogos</b> (no las cromátidas): cada cromosoma entero va a un polo." });
    par(f, "Ap", 330, 200, PI2, 0.28); par(f, "Bm", 330, 340, PI2, 0.28); par(f, "Am", 670, 200, PI2, 0.28); par(f, "Bp", 670, 340, PI2, 0.28); F.push(f);
    f = fotograma({ nombre: "Telofase I", celulas: [{ x: 290, y: 270, rx: 210, ry: 190 }, { x: 710, y: 270, rx: 210, ry: 190 }], nucleo: 0.5, cruce: true,
      texto: "Salen <b>2 células con la mitad de cromosomas</b> (n = 2), aunque cada cromosoma todavía tiene dos cromátidas.",
      etiquetas: [["n = 2", 290, 490, true], ["n = 2", 710, 490, true]] });
    par(f, "Ap", 265, 220, 0.4, 0.28); par(f, "Bm", 305, 325, 1.4, 0.28); par(f, "Am", 695, 225, -0.4, 0.28); par(f, "Bp", 735, 325, 2.0, 0.28); F.push(f);
    f = fotograma({ nombre: "Metafase II", celulas: [{ x: 290, y: 270, rx: 210, ry: 190 }, { x: 710, y: 270, rx: 210, ry: 190 }], husos: [[110, 270], [470, 270], [530, 270], [890, 270]], placa: [290, 710], cruce: true, largo: 0.85,
      texto: "Empieza la <b>segunda división</b>: en cada célula los cromosomas se colocan en el centro, como en una mitosis." });
    par(f, "Ap", 290, 200, PI2, 0.28); par(f, "Bm", 290, 340, PI2, 0.28); par(f, "Am", 710, 200, PI2, 0.28); par(f, "Bp", 710, 340, PI2, 0.28); F.push(f);
    f = fotograma({ nombre: "Anafase II", celulas: [{ x: 290, y: 270, rx: 205, ry: 175 }, { x: 710, y: 270, rx: 205, ry: 175 }], husos: [[100, 270], [480, 270], [520, 270], [900, 270]], cruce: true, largo: 0.85,
      texto: "Ahora sí se separan las <b>cromátidas hermanas</b>." });
    [["Ap", 290, 200], ["Bm", 290, 340], ["Am", 710, 200], ["Bp", 710, 340]].forEach(function (c) { una(f, c[0] + "0", c[1] + 95, c[2] * 0.9 + 27, PI2 + 0.15); una(f, c[0] + "1", c[1] - 95, c[2] * 0.9 + 27, PI2 - 0.15); }); F.push(f);
    var cel4 = [{ x: 128, y: 255, rx: 118, ry: 150 }, { x: 376, y: 255, rx: 118, ry: 150 }, { x: 624, y: 255, rx: 118, ry: 150 }, { x: 872, y: 255, rx: 118, ry: 150 }];
    f = fotograma({ nombre: "Resultado: 4 gametos distintos", celulas: cel4, nucleo: 1, grosor: 11, cruce: true,
      texto: "Salen <b>4 células</b> con <b>la mitad de cromosomas</b> (n = 2) y <b>todas distintas</b>: son los <b>gametos</b> (óvulos o espermatozoides).",
      etiquetas: [["n = 2", 128, 455, true], ["n = 2", 376, 455, true], ["n = 2", 624, 455, true], ["n = 2", 872, 455, true]] });
    f.celulas = cel4;
    [["Ap1", "Bm1", 0], ["Ap0", "Bm0", 1], ["Am1", "Bp1", 2], ["Am0", "Bp0", 3]].forEach(function (c) { var x = cel4[c[2]].x; una(f, c[0], x - 25, 225, 0.35); una(f, c[1], x + 28, 300, 1.35); }); F.push(f);
    return F;
  })();

  function frames() { return modo === "mitosis" ? MITOSIS : MEIOSIS; }

  // ---------- dibujo ----------
  function mezclarF(a, b, t) {
    var r = { grosor: C.mezclar(a.grosor, b.grosor, t), largo: C.mezclar(a.largo, b.largo, t), nucleo: C.mezclar(a.nucleo, b.nucleo, t), cruce: t > 0.5 ? b.cruce : a.cruce, celulas: [], crom: {} };
    for (var i = 0; i < 4; i++) { var p = a.celulas[i], q = b.celulas[i]; r.celulas.push({ x: C.mezclar(p.x, q.x, t), y: C.mezclar(p.y, q.y, t), rx: C.mezclar(p.rx, q.rx, t), ry: C.mezclar(p.ry, q.ry, t) }); }
    IDS.forEach(function (id) { var p = a.crom[id], q = b.crom[id]; r.crom[id] = { x: C.mezclar(p.x, q.x, t), y: C.mezclar(p.y, q.y, t), a: C.mezclar(p.a, q.a, t) }; });
    r.husoA = (a.husos ? 1 - t : 0); r.husoB = (b.husos ? t : 0); r.husosA = a.husos; r.husosB = b.husos;
    r.placa = t > 0.5 ? b.placa : a.placa; r.placaAlfa = (a.placa ? 1 - t : 0) + (b.placa ? t : 0);
    return r;
  }
  function cromatida(g, id, c, grosor, largo, cruce) {
    var info = CROMOS[id.slice(0, 2)], len = info.len * largo, ca = Math.cos(c.a), sa = Math.sin(c.a);
    var x1 = c.x - ca * len / 2, y1 = c.y - sa * len / 2, x2 = c.x + ca * len / 2, y2 = c.y + sa * len / 2;
    g.lineCap = "round";
    g.strokeStyle = "#1f2a44"; g.lineWidth = grosor + 4; g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke();
    g.strokeStyle = info.col; g.lineWidth = grosor; g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke();
    // trozo intercambiado: la cromátida «de dentro» de cada pareja lleva la punta del otro color
    var cambia = cruce && (id === "Ap1" || id === "Am0" || id === "Bp1" || id === "Bm0");
    if (cambia) { g.strokeStyle = info.otro; g.lineWidth = grosor; g.beginPath(); g.moveTo(x1 + (x2 - x1) * 0.62, y1 + (y2 - y1) * 0.62); g.lineTo(x2, y2); g.stroke(); }
    g.lineCap = "butt";
  }
  function dibujar(g, F, t) {
    var cel = F.celulas;
    // células: primero el relleno y después los bordes (así se ve el surco al partirse)
    g.fillStyle = "#fde9d9"; cel.forEach(function (c) { g.beginPath(); g.ellipse(c.x, c.y, c.rx, c.ry, 0, 0, 7); g.fill(); });
    g.strokeStyle = "#c98a5a"; g.lineWidth = 5; cel.forEach(function (c) { g.beginPath(); g.ellipse(c.x, c.y, c.rx, c.ry, 0, 0, 7); g.stroke(); });
    // núcleos
    if (F.nucleo > 0.02) {
      g.save(); g.globalAlpha = F.nucleo; g.fillStyle = "rgba(200,170,240,.35)"; g.strokeStyle = "#8a5cc7"; g.lineWidth = 3; g.setLineDash([10, 6]);
      var vistos = {}; cel.forEach(function (c) { var k2 = Math.round(c.x) + "," + Math.round(c.y); if (vistos[k2]) return; vistos[k2] = 1; var r = Math.min(c.rx, c.ry) * 0.68; g.beginPath(); g.arc(c.x, c.y, r, 0, 7); g.fill(); g.stroke(); });
      g.restore();
    }
    // huso: hilos desde los polos hasta los centrómeros
    [[F.husosA, F.husoA], [F.husosB, F.husoB]].forEach(function (h) {
      if (!h[0] || h[1] < 0.02) return;
      g.save(); g.globalAlpha = h[1] * 0.85; g.strokeStyle = "#7c8aa5"; g.lineWidth = 1.6;
      IDS.forEach(function (id) {
        // el polo más cercano; si la cromátida está justo en medio de dos polos, la «0» va a la derecha y la «1» a la izquierda
        var c = F.crom[id], orden = h[0].slice().sort(function (p, q) { return Math.hypot(p[0] - c.x, p[1] - c.y) - Math.hypot(q[0] - c.x, q[1] - c.y); });
        var mejor = orden[0];
        if (orden[1] && Math.abs(Math.hypot(orden[0][0] - c.x, orden[0][1] - c.y) - Math.hypot(orden[1][0] - c.x, orden[1][1] - c.y)) < 40)
          mejor = (id[2] === "0") === (orden[0][0] > orden[1][0]) ? orden[0] : orden[1];
        g.beginPath(); g.moveTo(mejor[0], mejor[1]); g.lineTo(c.x, c.y); g.stroke();
      });
      g.fillStyle = "#7c8aa5"; h[0].forEach(function (p) { g.beginPath(); g.arc(p[0], p[1], 8, 0, 7); g.fill(); });
      g.restore();
    });
    if (F.placa && F.placaAlfa > 0.05) { g.save(); g.globalAlpha = F.placaAlfa; g.strokeStyle = "#b58800"; g.lineWidth = 3; g.setLineDash([12, 8]); F.placa.forEach(function (x) { g.beginPath(); g.moveTo(x, 90); g.lineTo(x, 450); g.stroke(); }); g.restore(); }
    // cromátidas (y centrómeros)
    IDS.forEach(function (id) { cromatida(g, id, F.crom[id], F.grosor, F.largo, F.cruce); });
    if (F.grosor > 7) { g.fillStyle = "#1f2a44"; IDS.forEach(function (id) { if (id[2] !== "0") return; var a = F.crom[id], b = F.crom[id.slice(0, 2) + "1"]; if (Math.hypot(a.x - b.x, a.y - b.y) < 6) { g.beginPath(); g.arc(a.x, a.y, F.grosor * 0.5, 0, 7); g.fill(); } }); }
  }
  function tick(dt, t) {
    if (!L.empezar()) return;
    var Fs = frames(), F = Fs[fase];
    if (k < 1) { k = Math.min(1, k + dt / 1.3); }
    var actual = desde && k < 1 ? mezclarF(desde, F, C.suave(k)) : mezclarF(F, F, 1);
    dibujar(L.g, actual, t);
    if (k >= 1) F.etiquetas.forEach(function (e) { C.etiqueta(L.g, e[0], e[1], e[2], { tam: e[3] ? 22 : 17, fondo: e[4] || (e[3] ? "#d9f0e1" : undefined) }); });
    if (jugando && k >= 1) { espera += dt; if (espera > 2.8) { espera = 0; if (fase < Fs.length - 1) ir(fase + 1); else jugar(false); } }
  }

  // ---------- controles y panel ----------
  function ir(n) {
    var Fs = frames(); n = Math.max(0, Math.min(Fs.length - 1, n));
    desde = mezclarF(Fs[fase], Fs[fase], 1); fase = n; k = 0; espera = 0; pintar();
  }
  function jugar(on) { jugando = on; btnPlay.innerHTML = on ? C.ICONOS.pausa : C.ICONOS.play; if (on && fase === frames().length - 1) { fase = 0; k = 1; desde = null; pintar(); } }
  function ponerModo(m) { modo = m; fase = 0; k = 1; desde = null; jugar(false); btnMit.setAttribute("aria-pressed", m === "mitosis"); btnMei.setAttribute("aria-pressed", m === "meiosis"); pintar(); }
  var COMPARA = '<h4>Mitosis y meiosis</h4><table class="tabla"><tr><th></th><th>Mitosis</th><th>Meiosis</th></tr>' +
    '<tr><td><b>Divisiones</b></td><td>Una</td><td>Dos seguidas</td></tr><tr><td><b>Células que salen</b></td><td>2</td><td>4</td></tr>' +
    '<tr><td><b>Cromosomas</b></td><td>Los mismos (2n)</td><td>La mitad (n)</td></tr><tr><td><b>Las hijas son…</b></td><td>Idénticas a la madre</td><td>Distintas entre sí</td></tr>' +
    '<tr><td><b>¿Para qué?</b></td><td>Crecer y reparar tejidos</td><td>Formar gametos (reproducción sexual)</td></tr></table>';
  function pintar() {
    var Fs = frames(), F = Fs[fase];
    barra.titulo((fase + 1) + "/" + Fs.length, F.nombre);
    var intro = modo === "mitosis"
      ? '<span class="kicker">Mitosis · fase ' + (fase + 1) + " de " + Fs.length + "</span>"
      : '<span class="kicker">Meiosis · fase ' + (fase + 1) + " de " + Fs.length + "</span>";
    var extra = modo === "mitosis"
      ? '<div class="caja verde"><b class="t">¿Para qué sirve la mitosis?</b>Para <b>crecer</b>, <b>reparar</b> heridas y reponer células. Cada célula hija recibe una copia exacta del ADN.</div>'
      : '<div class="caja verde"><b class="t">¿Para qué sirve la meiosis?</b>Para fabricar los <b>gametos</b>. Al unirse un óvulo (n) y un espermatozoide (n) en la fecundación, se recupera el número normal: <b>n + n = 2n</b>.</div><div class="caja recuerda"><b class="t">Y la evolución…</b>El <b>sobrecruzamiento</b> y el reparto <b>al azar</b> de los cromosomas hacen que cada hijo sea único: es una gran fuente de <b>variabilidad</b>.</div>';
    C.panel(intro + "<h3>" + F.nombre + "</h3><p>" + F.texto + "</p>" + extra + COMPARA +
      '<div class="caja dato"><b class="t">Colores</b><span style="color:#2a4fa3;font-weight:700">Azul</span>: cromosomas que vienen del padre. <span style="color:#b23a33;font-weight:700">Rojo</span>: de la madre. Hay una pareja de cromosomas largos y otra de cortos (2n = 4).</div>');
  }
  function crear(cont) {
    var lz = C.el("div", { class: "lienzo" }); cont.appendChild(lz); L = C.lienzo(lz);
    barra = C.barra(cont);
    var g1 = barra.grupo();
    btnMit = C.boton(g1, "Mitosis", function () { ponerModo("mitosis"); }); btnMei = C.boton(g1, "Meiosis", function () { ponerModo("meiosis"); });
    var g2 = barra.grupo();
    C.boton(g2, C.ICONOS.reinicio, function () { ir(0); }, "", "Volver al principio");
    C.boton(g2, C.ICONOS.ant, function () { jugar(false); ir(fase - 1); }, "", "Fase anterior");
    btnPlay = C.boton(g2, C.ICONOS.play, function () { jugar(!jugando); }, "amarillo", "Reproducir");
    C.boton(g2, C.ICONOS.sig, function () { jugar(false); ir(fase + 1); }, "", "Fase siguiente");
    var q = new URLSearchParams(location.search);
    ponerModo(q.get("m") === "meiosis" ? "meiosis" : "mitosis");
    var f = parseInt(q.get("f"), 10); if (f >= 1 && f <= frames().length) { fase = f - 1; pintar(); }
  }
  return { crear: crear, mostrar: function () { pintar(); C.alTick(tick); } };
})();
