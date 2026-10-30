// Sección 1: viaje con lupa desde un ser vivo hasta el ADN (6 niveles con zoom animado).
var SeccionADN = (function () {
  "use strict";
  var C = Comun, L, barra, nivel = 0, trans = null, t0 = 0, mutacion = false, btnAlejar, btnAcercar, btnMut, pastillas;
  var COL = { A: "#2fa36b", T: "#e5534b", C: "#3d6fd8", G: "#f2b705" };
  var PAR = { A: "T", T: "A", C: "G", G: "C" };
  var SECUENCIA = "ATGCGTACCGATTAGCCATGGCTAAGTCGATCCGA";
  var GEN = [13, 21];   // trozo de la secuencia que forma el gen
  var NIVELES = [
    { nombre: "Un ser vivo", foco: [520, 300, 26] },
    { nombre: "La célula", foco: [500, 280, 92] },
    { nombre: "El núcleo", foco: [612, 228, 44] },
    { nombre: "El cromosoma", foco: [560, 150, 34] },
    { nombre: "El ADN", foco: [500, 270, 110] },
    { nombre: "Genes y alelos", foco: [500, 280, 1] }
  ];

  // ---------- dibujos de cada nivel ----------
  function serVivo(g, t) {
    // persona
    var x = 470, y = 120;
    g.fillStyle = "#f1c7a3"; g.strokeStyle = "#1f2a44"; g.lineWidth = 3;
    g.beginPath(); g.arc(x, y, 42, 0, Math.PI * 2); g.fill(); g.stroke();
    g.fillStyle = "#5a3d2b"; g.beginPath(); g.arc(x, y - 8, 43, Math.PI * 1.05, Math.PI * 1.95); g.fill();
    g.fillStyle = "#1f2a44"; g.beginPath(); g.arc(x - 14, y + 4, 4, 0, 7); g.arc(x + 14, y + 4, 4, 0, 7); g.fill();
    g.beginPath(); g.arc(x, y + 14, 12, 0.2, Math.PI - 0.2); g.stroke();
    g.fillStyle = "#3d6fd8"; C.redondo(g, x - 52, y + 50, 104, 150, 30); g.fill(); g.stroke();
    g.strokeStyle = "#f1c7a3"; g.lineWidth = 22; g.lineCap = "round";
    g.beginPath(); g.moveTo(x - 48, y + 75); g.lineTo(x - 95, y + 175); g.moveTo(x + 48, y + 75); g.lineTo(x + 52, y + 180); g.stroke();
    g.strokeStyle = "#2b3550"; g.beginPath(); g.moveTo(x - 25, y + 195); g.lineTo(x - 30, y + 320); g.moveTo(x + 25, y + 195); g.lineTo(x + 30, y + 320); g.stroke();
    g.lineCap = "butt";
    // planta y bacteria
    g.strokeStyle = "#2e8b57"; g.lineWidth = 6; g.beginPath(); g.moveTo(760, 450); g.quadraticCurveTo(770, 330, 750, 250); g.stroke();
    [[750, 300, -0.6], [765, 360, 0.6], [752, 260, 0.3]].forEach(function (h) { g.save(); g.translate(h[0], h[1]); g.rotate(h[2]); g.fillStyle = "#58b06e"; g.beginPath(); g.ellipse(h[2] > 0 ? 30 : -30, 0, 34, 14, 0, 0, 7); g.fill(); g.stroke(); g.restore(); });
    g.fillStyle = "#e5534b"; g.beginPath(); g.arc(752, 235, 18, 0, 7); g.fill(); g.stroke();
    g.fillStyle = "#9fd17a"; C.redondo(g, 190, 400, 80, 36, 18); g.fill(); g.stroke();
    g.strokeStyle = "#4c7d33"; g.beginPath(); g.moveTo(270, 418); g.quadraticCurveTo(295, 400, 310, 425); g.stroke();
    C.texto(g, "Persona", x, 470, 20); C.texto(g, "Planta", 760, 480, 20); C.texto(g, "Bacteria", 230, 470, 20);
    lupa(g, 520, 300, 26, t);
  }
  function lupa(g, x, y, r, t) {
    var p = 1 + Math.sin(t * 3) * 0.08;
    g.strokeStyle = "#f2b705"; g.lineWidth = 5; g.beginPath(); g.arc(x, y, r * p, 0, 7); g.stroke();
    g.lineWidth = 8; g.beginPath(); g.moveTo(x + r * 0.7 * p, y + r * 0.7 * p); g.lineTo(x + r * 1.6, y + r * 1.6); g.stroke();
  }
  function celula(g, t) {
    g.fillStyle = "#fde8d6"; g.strokeStyle = "#c98a5a"; g.lineWidth = 6;
    g.beginPath(); g.ellipse(500, 280, 330, 215, 0, 0, 7); g.fill(); g.stroke();
    // retículo
    g.strokeStyle = "#e7b9a0"; g.lineWidth = 3;
    for (var i = 0; i < 4; i++) { g.beginPath(); g.arc(500, 280, 120 + i * 14, 2.4 + i * 0.1, 3.6 + i * 0.1); g.stroke(); }
    // mitocondrias
    [[300, 200, 0.4], [700, 360, -0.5], [690, 180, 0.9], [320, 380, -0.2]].forEach(function (m) {
      g.save(); g.translate(m[0], m[1]); g.rotate(m[2]); g.fillStyle = "#f4a259"; g.strokeStyle = "#b5651d"; g.lineWidth = 3;
      g.beginPath(); g.ellipse(0, 0, 44, 22, 0, 0, 7); g.fill(); g.stroke();
      g.beginPath(); g.moveTo(-34, 0); for (var k = -30; k <= 32; k += 8) g.lineTo(k, (k / 8) % 2 ? 9 : -9); g.stroke(); g.restore();
    });
    g.fillStyle = "#c9846b"; for (i = 0; i < 40; i++) { var a = i * 2.39, rr = 140 + (i * 37) % 150; g.beginPath(); g.arc(500 + Math.cos(a) * rr * 1.15, 280 + Math.sin(a) * rr * 0.7, 3.5, 0, 7); g.fill(); }
    // núcleo
    g.fillStyle = "#e3d2f5"; g.strokeStyle = "#8a5cc7"; g.lineWidth = 5; g.beginPath(); g.arc(500, 280, 92, 0, 7); g.fill(); g.stroke();
    g.fillStyle = "#b393de"; g.beginPath(); g.arc(520, 270, 26, 0, 7); g.fill();
    g.strokeStyle = "#8a5cc7"; g.lineWidth = 2;
    for (i = 0; i < 6; i++) { g.beginPath(); g.moveTo(440 + i * 20, 230 + (i % 2) * 30); g.bezierCurveTo(470, 300, 520 + i * 6, 220, 560, 320 - i * 8); g.stroke(); }
    C.etiqueta(g, "Membrana", 175, 150); C.etiqueta(g, "Citoplasma", 790, 470); C.etiqueta(g, "Mitocondria", 300, 140); C.etiqueta(g, "Núcleo", 500, 405, { fondo: "#f2b705" });
    lupa(g, 500, 280, 100, t);
  }
  function nucleo(g, t) {
    g.fillStyle = "#efe4fa"; g.strokeStyle = "#8a5cc7"; g.lineWidth = 10; g.beginPath(); g.arc(500, 280, 240, 0, 7); g.fill(); g.stroke();
    g.strokeStyle = "#fff"; g.lineWidth = 3; g.beginPath(); g.arc(500, 280, 240, 0, 7); g.stroke();
    for (var i = 0; i < 18; i++) { var a = i / 18 * Math.PI * 2; g.fillStyle = "#fff"; g.beginPath(); g.arc(500 + Math.cos(a) * 240, 280 + Math.sin(a) * 240, 6, 0, 7); g.fill(); }
    // cromatina
    g.strokeStyle = "rgba(122,74,190,.55)"; g.lineWidth = 3;
    var s = 11; for (i = 0; i < 26; i++) { s = (s * 9301 + 49297) % 233280; var x1 = 330 + (s % 340); s = (s * 9301 + 49297) % 233280; var y1 = 120 + (s % 320);
      g.beginPath(); g.moveTo(x1, y1); g.bezierCurveTo(x1 + 60, y1 - 50, x1 - 40, y1 + 70, x1 + 30, y1 + 40); g.stroke(); }
    // cromosomas condensados
    [[420, 210, 0.4, "#3d6fd8"], [612, 228, -0.3, "#e5534b"], [470, 360, 1.1, "#e5534b"], [580, 370, 2.2, "#3d6fd8"]].forEach(function (c) { cromosomaX(g, c[0], c[1], 40, c[2], c[3], 11); });
    C.etiqueta(g, "Envoltura nuclear", 260, 70); C.etiqueta(g, "Cromatina (ADN desenrollado)", 760, 470);
    C.etiqueta(g, "Cromosoma", 690, 160, { fondo: "#f2b705" });
    lupa(g, 612, 228, 50, t);
  }
  function cromosomaX(g, x, y, largo, ang, color, grosor, bandas) {
    g.save(); g.translate(x, y); g.rotate(ang); g.lineCap = "round";
    [-0.28, 0.28].forEach(function (a) {
      g.save(); g.rotate(a);
      g.strokeStyle = "#1f2a44"; g.lineWidth = grosor + 4; g.beginPath(); g.moveTo(0, -largo); g.lineTo(0, largo); g.stroke();
      g.strokeStyle = color; g.lineWidth = grosor; g.beginPath(); g.moveTo(0, -largo); g.lineTo(0, largo); g.stroke();
      if (bandas) { g.strokeStyle = "rgba(0,0,0,.25)"; g.lineWidth = grosor; bandas.forEach(function (b) { g.beginPath(); g.moveTo(0, b * largo); g.lineTo(0, b * largo + largo * 0.06); g.stroke(); }); }
      g.restore();
    });
    g.fillStyle = "#1f2a44"; g.beginPath(); g.arc(0, 0, grosor * 0.55, 0, 7); g.fill();
    g.restore(); g.lineCap = "butt";
  }
  function cromosoma(g, t) {
    cromosomaX(g, 500, 290, 210, 0, "#8a5cc7", 62, [-0.85, -0.6, -0.42, -0.2, 0.25, 0.45, 0.7, 0.88]);
    // detalle: la fibra enrollada
    g.save(); g.beginPath(); g.arc(560, 150, 34, 0, 7); g.clip();
    g.strokeStyle = "#f2e8ff"; g.lineWidth = 3; for (var y = 110; y < 190; y += 7) { g.beginPath(); g.ellipse(560, y, 30, 4, 0, 0, 7); g.stroke(); }
    g.restore();
    C.etiqueta(g, "Cromátida", 265, 120); C.flecha(g, 320, 130, 410, 160, "#1f2a44", 3);
    C.etiqueta(g, "Cromátida hermana", 760, 470); C.flecha(g, 700, 455, 610, 420, "#1f2a44", 3);
    C.etiqueta(g, "Centrómero", 250, 300); C.flecha(g, 310, 300, 470, 292, "#1f2a44", 3);
    C.etiqueta(g, "ADN muy enrollado", 790, 120, { fondo: "#f2b705" });
    lupa(g, 560, 150, 38, t);
  }
  function adn(g, t) {
    var y0 = 270, amp = 92, x0 = 60, x1 = 940, paso = (x1 - x0) / (SECUENCIA.length - 1), giro = t * 1.4;
    var pares = [];
    for (var i = 0; i < SECUENCIA.length; i++) {
      var x = x0 + i * paso, fase = i * 0.42 + giro, s = Math.sin(fase), c = Math.cos(fase);
      var b = SECUENCIA[i]; if (mutacion && i === 16) b = "A";
      pares.push({ x: x, ya: y0 + amp * s, yb: y0 - amp * s, prof: c, base: b, i: i });
    }
    // cadenas de detrás, peldaños y cadenas de delante
    function cadena(signo, delante) {
      g.lineWidth = 12; g.lineCap = "round";
      for (var k = 0; k < pares.length - 1; k++) {
        var p = pares[k], q = pares[k + 1], z = signo * (p.prof + q.prof) / 2;
        if ((z > 0) !== delante) continue;
        g.strokeStyle = delante ? "#5b6a8a" : "#a9b3c8";
        g.beginPath(); g.moveTo(p.x, signo > 0 ? p.ya : p.yb); g.lineTo(q.x, signo > 0 ? q.ya : q.yb); g.stroke();
      }
    }
    // zona del gen
    var gx0 = pares[GEN[0]].x - paso / 2, gx1 = pares[GEN[1]].x + paso / 2;
    g.fillStyle = "rgba(242,183,5,.18)"; g.fillRect(gx0, y0 - amp - 30, gx1 - gx0, amp * 2 + 60);
    cadena(1, false); cadena(-1, false);
    pares.forEach(function (p) {
      var arriba = Math.min(p.ya, p.yb), abajo = Math.max(p.ya, p.yb), mitad = (p.ya + p.yb) / 2;
      g.lineWidth = 9; g.lineCap = "butt";
      g.strokeStyle = COL[p.base]; g.beginPath(); g.moveTo(p.x, p.ya); g.lineTo(p.x, mitad); g.stroke();
      g.strokeStyle = COL[PAR[p.base]]; g.beginPath(); g.moveTo(p.x, mitad); g.lineTo(p.x, p.yb); g.stroke();
      if (Math.abs(p.ya - p.yb) > 60) {
        C.texto(g, p.base, p.x, p.ya + (p.ya < p.yb ? -20 : 20), 15, "#1f2a44");
        C.texto(g, PAR[p.base], p.x, p.yb + (p.yb < p.ya ? -20 : 20), 15, "#1f2a44");
      }
      if (mutacion && p.i === 16) { g.strokeStyle = "#e5534b"; g.lineWidth = 4; g.beginPath(); g.arc(p.x, mitad, 26, 0, 7); g.stroke(); }
    });
    cadena(1, true); cadena(-1, true);
    g.lineCap = "butt";
    // llave del gen
    g.strokeStyle = "#b58800"; g.lineWidth = 4; g.beginPath(); g.moveTo(gx0, y0 - amp - 34); g.lineTo(gx0, y0 - amp - 48); g.lineTo(gx1, y0 - amp - 48); g.lineTo(gx1, y0 - amp - 34); g.stroke();
    C.etiqueta(g, mutacion ? "Gen con una mutación → un alelo nuevo" : "Un gen", (gx0 + gx1) / 2, y0 - amp - 66, { fondo: "#f2b705" });
    // leyenda de bases
    var ly = 500;
    [["A", "Adenina"], ["T", "Timina"], ["C", "Citosina"], ["G", "Guanina"]].forEach(function (b, i) {
      var x = 175 + i * 190; g.fillStyle = COL[b[0]]; C.redondo(g, x - 70, ly - 16, 32, 32, 7); g.fill(); g.strokeStyle = "#1f2a44"; g.lineWidth = 2; g.stroke();
      C.texto(g, b[0], x - 54, ly + 1, 18, "#fff"); C.texto(g, b[1], x - 30, ly, 18, "#1f2a44", "left");
    });
    C.texto(g, "A siempre con T · C siempre con G", 500, 540, 17, "#56607a");
  }
  function alelos(g, t) {
    function homologo(x, color, alelo, quien) {
      g.save(); g.translate(x, 260); g.lineCap = "round";
      g.strokeStyle = "#1f2a44"; g.lineWidth = 60; g.beginPath(); g.moveTo(0, -170); g.lineTo(0, 170); g.stroke();
      g.strokeStyle = color; g.lineWidth = 52; g.beginPath(); g.moveTo(0, -170); g.lineTo(0, 170); g.stroke();
      g.strokeStyle = "rgba(0,0,0,.22)"; g.lineWidth = 52; g.lineCap = "butt";
      [-140, -95, -20, 60, 120].forEach(function (b) { g.beginPath(); g.moveTo(0, b); g.lineTo(0, b + 10); g.stroke(); });
      g.fillStyle = "#1f2a44"; g.beginPath(); g.ellipse(0, 10, 32, 9, 0, 0, 7); g.fill();
      var p = 1 + Math.sin(t * 3) * 0.05;
      g.fillStyle = "#f2b705"; g.strokeStyle = "#1f2a44"; g.lineWidth = 3; C.redondo(g, -34 * p, -70, 68 * p, 30, 6); g.fill(); g.stroke();
      C.texto(g, alelo, 0, -54, 22, "#1f2a44");
      C.texto(g, quien, 0, 210, 18, color === "#3d6fd8" ? "#2a4fa3" : "#b23a33");
      g.restore(); g.lineCap = "butt";
    }
    homologo(310, "#3d6fd8", "A", "Del padre"); homologo(470, "#e5534b", "a", "De la madre");
    C.flecha(g, 560, 205, 380, 200, "#b58800", 3);
    C.etiqueta(g, "El mismo gen, en el mismo sitio", 690, 190, { fondo: "#f2b705" });
    C.etiqueta(g, "Cromosomas homólogos", 390, 40);
    // flor resultante
    var fx = 760, fy = 360;
    g.strokeStyle = "#2e8b57"; g.lineWidth = 6; g.beginPath(); g.moveTo(fx, fy + 20); g.lineTo(fx, fy + 140); g.stroke();
    for (var i = 0; i < 6; i++) { var a = i / 6 * Math.PI * 2 + t * 0.2; g.fillStyle = "#8a5cc7"; g.strokeStyle = "#1f2a44"; g.lineWidth = 2; g.beginPath(); g.ellipse(fx + Math.cos(a) * 34, fy + Math.sin(a) * 34, 28, 16, a, 0, 7); g.fill(); g.stroke(); }
    g.fillStyle = "#f2b705"; g.beginPath(); g.arc(fx, fy, 18, 0, 7); g.fill(); g.stroke();
    C.texto(g, "Genotipo: Aa → flor morada", fx, fy + 170, 18);
  }
  var DIBUJOS = [serVivo, celula, nucleo, cromosoma, adn, alelos];

  // ---------- textos del panel ----------
  var PANEL = [
    '<span class="kicker">Nivel 1 · Ser vivo</span><h3>Todo empieza en las células</h3><p>Todos los seres vivos (personas, plantas, animales, hongos, bacterias…) estamos formados por <b>células</b>. Una persona tiene unos <b>30 billones</b> de células.</p><p>Dentro de casi todas ellas está guardada la misma información: las <b>instrucciones</b> para fabricar y hacer funcionar ese ser vivo.</p><div class="caja recuerda"><b class="t">Vamos de viaje</b>Pulsa <b>«Acercar»</b> para hacer zoom con la lupa y descubrir dónde están esas instrucciones.</div>',
    '<span class="kicker">Nivel 2 · La célula</span><h3>La célula y su núcleo</h3><p>Una célula animal tiene <b>membrana</b>, <b>citoplasma</b> (con orgánulos como las mitocondrias) y un <b>núcleo</b>.</p><p>El núcleo es como el «archivo» de la célula: ahí se guarda el <b>ADN</b>, la molécula que lleva la información genética.</p><div class="caja dato"><b class="t">¿Todas las células tienen núcleo?</b>Las bacterias no: son células <b>procariotas</b> y su ADN está suelto en el citoplasma. Las nuestras son <b>eucariotas</b>.</div>',
    '<span class="kicker">Nivel 3 · El núcleo</span><h3>Cromatina y cromosomas</h3><p>Normalmente el ADN está desenrollado dentro del núcleo formando la <b>cromatina</b>, como una madeja de hilos.</p><p>Cuando la célula va a dividirse, el ADN se enrolla muchísimo y se ven los <b>cromosomas</b>.</p><div class="caja recuerda"><b class="t">Recuerda</b>Las personas tenemos <b>46 cromosomas</b> en cada célula, es decir, <b>23 parejas</b>: un cromosoma de cada pareja viene del padre y el otro de la madre.</div>',
    '<span class="kicker">Nivel 4 · El cromosoma</span><h3>Las partes de un cromosoma</h3><p>Antes de dividirse, la célula copia su ADN. Por eso cada cromosoma tiene forma de <b>X</b>: está formado por dos <b>cromátidas hermanas</b>, idénticas, unidas por el <b>centrómero</b>.</p><p>Cada cromátida es una sola molécula de ADN, larguísima y muy enrollada.</p><div class="caja dato"><b class="t">¿Sabías que…?</b>Si estiráramos el ADN de una sola célula humana, mediría unos <b>2 metros</b>.</div>',
    '<span class="kicker">Nivel 5 · El ADN</span><h3>La doble hélice</h3><p>El ADN tiene forma de <b>escalera de caracol</b> (doble hélice). Los peldaños son parejas de <b>bases nitrogenadas</b>: <span class="base" style="background:#2fa36b">A</span>–<span class="base" style="background:#e5534b">T</span> y <span class="base" style="background:#3d6fd8">C</span>–<span class="base" style="background:#f2b705">G</span>.</p><p>El orden de las bases es la información. Un <b>gen</b> es un trozo de ADN con las instrucciones para un <b>carácter</b> (por ejemplo, el color de una flor).</p><div class="caja recuerda"><b class="t">Mutaciones</b>Pulsa <b>«Mutación»</b>: a veces una base cambia al copiar el ADN. Así aparecen <b>versiones nuevas de los genes</b>. Las mutaciones son la fuente de la <b>variación</b> sobre la que actúa la evolución.</div>',
    '<span class="kicker">Nivel 6 · Genes y alelos</span><h3>Genes y alelos</h3><p>Los cromosomas van por parejas (<b>homólogos</b>): uno del padre y otro de la madre. Los dos tienen los mismos genes en el mismo sitio.</p><p>Pero cada gen puede tener <b>versiones distintas</b>, llamadas <b>alelos</b>. Por ejemplo: <b>A</b> (flor morada) y <b>a</b> (flor blanca).</p><table class="tabla"><tr><th>Genotipo</th><th>Se llama</th><th>Flor</th></tr><tr><td>AA</td><td>Homocigoto dominante</td><td>Morada</td></tr><tr><td>Aa</td><td>Heterocigoto</td><td>Morada</td></tr><tr><td>aa</td><td>Homocigoto recesivo</td><td>Blanca</td></tr></table><div class="caja recuerda"><b class="t">Recuerda</b><b>Genotipo</b>: los alelos que tienes. <b>Fenotipo</b>: lo que se ve. El alelo <b>dominante</b> (A) se impone al <b>recesivo</b> (a).</div>'
  ];

  // ---------- transiciones ----------
  function ir(n) {
    if (n < 0 || n >= NIVELES.length || trans) return;
    trans = { de: nivel, a: n, t: 0 }; nivel = n; mutacion = false; actualizarBarra();
  }
  function dibujarNivel(g, i, t, escala, foco, alfa) {
    g.save(); g.globalAlpha = alfa;
    if (escala !== 1) { g.translate(foco[0], foco[1]); g.scale(escala, escala); g.translate(-foco[0], -foco[1]); }
    DIBUJOS[i](g, t); g.restore();
  }
  function tick(dt, t) {
    if (!L.empezar()) return;
    var g = L.g;
    if (trans) {
      trans.t += dt / 1.1; var k = C.suave(trans.t), entra = trans.a > trans.de;
      var fDe = NIVELES[entra ? trans.de : trans.a].foco, zoom = 520 / Math.max(fDe[2], 20);
      if (entra) { dibujarNivel(g, trans.de, t, 1 + (zoom - 1) * k, fDe, 1 - k); dibujarNivel(g, trans.a, t, 0.35 + 0.65 * k, [500, 280], k); }
      else { dibujarNivel(g, trans.de, t, 1 - 0.65 * k, [500, 280], 1 - k); dibujarNivel(g, trans.a, t, zoom - (zoom - 1) * k, fDe, k); }
      if (trans.t >= 1) trans = null;
    } else dibujarNivel(g, nivel, t, 1, null, 1);
  }

  function actualizarBarra() {
    barra.titulo((nivel + 1) + "/" + NIVELES.length, NIVELES[nivel].nombre);
    btnAlejar.disabled = nivel === 0; btnAcercar.disabled = nivel === NIVELES.length - 1;
    btnMut.hidden = nivel !== 4; btnMut.setAttribute("aria-pressed", mutacion);
    pastillas.querySelectorAll("button").forEach(function (b, i) { b.setAttribute("aria-pressed", i === nivel); });
    C.panel(PANEL[nivel]);
  }

  function crear(cont) {
    var lz = C.el("div", { class: "lienzo" }); cont.appendChild(lz); L = C.lienzo(lz);
    var n = parseInt(new URLSearchParams(location.search).get("n"), 10); if (n >= 1 && n <= NIVELES.length) nivel = n - 1;
    mutacion = new URLSearchParams(location.search).get("mut") === "1";
    L.cv.style.cursor = "pointer"; L.cv.onclick = function () { ir(nivel + 1); };
    barra = C.barra(cont);
    var gr = barra.grupo();
    btnMut = C.boton(gr, "Mutación", function () { mutacion = !mutacion; actualizarBarra(); }, "amarillo", "Cambiar una base del gen");
    pastillas = C.el("div", { class: "pastillas" }); gr.appendChild(pastillas);
    NIVELES.forEach(function (n, i) { var b = C.el("button", { title: n.nombre, "aria-label": n.nombre }); b.onclick = function () { ir(i); }; pastillas.appendChild(b); });
    btnAlejar = C.boton(gr, "‹ Alejar", function () { ir(nivel - 1); }, "", "Nivel anterior");
    btnAcercar = C.boton(gr, "Acercar ›", function () { ir(nivel + 1); }, "verde", "Siguiente nivel");
  }
  return { crear: crear, mostrar: function () { actualizarBarra(); C.alTick(tick); }, ir: ir };
})();
