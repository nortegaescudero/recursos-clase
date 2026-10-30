// Sección 5: evolución humana. Línea del tiempo de los homínidos y cráneo de cada especie (dibujado a partir
// de unas medidas: altura de la bóveda, frente, arco de las cejas, cara hacia delante y mentón).
var SeccionHumanos = (function () {
  "use strict";
  var C = Comun, raiz, barra, sel = 5, comparar = true, jugando = false, reloj = null, btnPlay, btnComp;
  var ESPECIES = [
    { nombre: "Australopithecus afarensis", apodo: "«Lucy»", desde: 3.9, hasta: 2.9, fila: 0, color: "#c98a5a", cerebro: 430, altura: "1,1 – 1,5 m",
      lugar: ["África"], herramientas: "No fabricaba herramientas de piedra", dato: "Ya caminaba sobre dos piernas (bípedo), pero aún trepaba a los árboles.",
      craneo: { h: 58, frente: 0.95, cejas: 9, cara: 58, menton: -10, largo: 175, escala: 0.82 } },
    { nombre: "Homo habilis", apodo: "«El hábil»", desde: 2.4, hasta: 1.4, fila: 1, color: "#d9a441", cerebro: 610, altura: "1,0 – 1,35 m",
      lugar: ["África"], herramientas: "Las primeras herramientas de piedra tallada (cantos tallados)", dato: "Se le llama «hábil» porque es el primero que fabricaba herramientas.",
      craneo: { h: 70, frente: 0.75, cejas: 9, cara: 42, menton: -8, largo: 180, escala: 0.86 } },
    { nombre: "Homo erectus", apodo: "«El erguido»", desde: 1.9, hasta: 0.11, fila: 2, color: "#5aa36a", cerebro: 950, altura: "1,5 – 1,8 m",
      lugar: ["África", "Asia", "Europa"], herramientas: "Bifaces (hachas de mano) y dominio del fuego", dato: "Fue el primer homínido que salió de África y se extendió por Asia.",
      craneo: { h: 72, frente: 0.85, cejas: 17, cara: 30, menton: -6, largo: 212, escala: 0.96 } },
    { nombre: "Homo antecessor", apodo: "De Atapuerca (Burgos)", desde: 1.2, hasta: 0.8, fila: 3, color: "#3d8fbf", cerebro: 1000, altura: "1,6 – 1,8 m",
      lugar: ["Europa"], herramientas: "Herramientas de piedra tallada", dato: "Sus fósiles se encontraron en la sierra de Atapuerca (Burgos), muy cerca de La Rioja. Son de los europeos más antiguos.",
      craneo: { h: 82, frente: 0.6, cejas: 12, cara: 22, menton: -2, largo: 200, escala: 0.98 } },
    { nombre: "Homo neanderthalensis", apodo: "Neandertal", desde: 0.4, hasta: 0.04, fila: 4, color: "#8a5cc7", cerebro: 1500, altura: "1,55 – 1,7 m",
      lugar: ["Europa", "Asia"], herramientas: "Herramientas de piedra muy elaboradas, fuego, adornos", dato: "Enterraban a sus muertos. Convivió con Homo sapiens y algunos tenemos un poco de ADN neandertal.",
      craneo: { h: 86, frente: 0.65, cejas: 15, cara: 24, menton: -3, largo: 222, escala: 1.05 } },
    { nombre: "Homo sapiens", apodo: "Nosotros", desde: 0.3, hasta: 0, fila: 5, color: "#e5534b", cerebro: 1350, altura: "1,5 – 1,9 m",
      lugar: ["África", "Europa", "Asia", "América", "Oceanía"], herramientas: "Herramientas de todo tipo, arte, escritura… y tecnología", dato: "Apareció en África hace unos 300 000 años y desde allí se extendió por todo el planeta.",
      craneo: { h: 106, frente: 0.08, cejas: 3, cara: 8, menton: 12, largo: 190, escala: 1 } }
  ];
  var X0 = 70, X1 = 940, MA = 4.2;
  function xDe(ma) { return X0 + (MA - ma) / MA * (X1 - X0); }

  // perfil del cráneo mirando a la izquierda (en una caja de unos 260 × 200)
  function craneo(p, x, y, esc, estilo) {
    var s = p.escala * esc, H = p.h, B = p.cejas, P = p.cara, L = p.largo, fr = p.frente;
    function pt(px, py) { return (x + px * s).toFixed(1) + " " + (y + py * s).toFixed(1); }
    var d = "M" + pt(0, 0) +
      " C" + pt(6 + fr * 30, -H * 0.5) + " " + pt(20 + fr * 45, -H * 0.95) + " " + pt(70 + fr * 25, -H) +
      " C" + pt(L * 0.62, -H * 1.02) + " " + pt(L * 0.95, -H * 0.75) + " " + pt(L, -H * 0.3) +
      " C" + pt(L * 1.02, 5) + " " + pt(L * 0.92, 30) + " " + pt(L * 0.8, 34) +
      " L" + pt(L * 0.55, 36) + " C" + pt(L * 0.48, 70) + " " + pt(L * 0.42, 100) + " " + pt(L * 0.32, 104) +
      " L" + pt(-P * 0.35 + p.menton, 108) + " C" + pt(-P * 0.55 + p.menton, 104) + " " + pt(-P * 0.7, 84) + " " + pt(-P * 0.75, 70) +
      " L" + pt(-P, 58) + " C" + pt(-P * 1.02, 42) + " " + pt(-P * 0.8, 34) + " " + pt(-P * 0.62, 30) +
      " C" + pt(-P * 0.7, 18) + " " + pt(-B * 0.6, 10) + " " + pt(-B, 4) + " C" + pt(-B * 0.8, -4) + " " + pt(-2, -3) + " " + pt(0, 0) + "Z";
    if (estilo === "fantasma") return '<path d="' + d + '" fill="none" stroke="#e5534b" stroke-width="3" stroke-dasharray="10 7" opacity=".75"/>';
    var ojo = '<ellipse cx="' + (x + 18 * s) + '" cy="' + (y + 18 * s) + '" rx="' + (17 * s) + '" ry="' + (15 * s) + '" fill="#4a3d2c"/>';
    var dientes = "";
    for (var i = 0; i < 4; i++) dientes += '<rect x="' + (x + (-P * 0.86 + i * 12) * s) + '" y="' + (y + 62 * s) + '" width="' + (10 * s) + '" height="' + (11 * s) + '" rx="2" fill="#fffaf0" stroke="#8c7a5a" stroke-width="1.5"/>';
    var mand = '<path d="M' + pt(L * 0.55, 36) + " Q" + pt(L * 0.3, 52) + " " + pt(-P * 0.75, 70) + '" fill="none" stroke="#8c7a5a" stroke-width="3"/>';
    var pomulo = '<path d="M' + pt(30, 40) + " Q" + pt(60, 34) + " " + pt(85, 44) + '" fill="none" stroke="#8c7a5a" stroke-width="3"/>';
    var nariz = '<path d="M' + pt(-P * 0.5, 30) + " L" + pt(-P * 0.35, 46) + " L" + pt(-P * 0.15, 44) + '" fill="#cbb994" stroke="#8c7a5a" stroke-width="2"/>';
    return '<path d="' + d + '" fill="#f1e6cc" stroke="#1f2a44" stroke-width="4" stroke-linejoin="round"/>' + ojo + pomulo + nariz + mand + dientes;
  }

  function pintar() {
    var e = ESPECIES[sel], s = '<svg viewBox="0 0 1000 560" preserveAspectRatio="xMidYMid meet" style="font-family:\'Atkinson Hyperlegible\',sans-serif">';
    // línea del tiempo
    s += '<rect x="30" y="12" width="940" height="200" rx="16" fill="#fff" stroke="#1f2a44" stroke-width="2.5"/>';
    s += '<line x1="' + X0 + '" y1="178" x2="' + X1 + '" y2="178" stroke="#1f2a44" stroke-width="3"/>';
    for (var m = 4; m >= 0; m -= 0.5) { var xm = xDe(m); s += '<line x1="' + xm + '" y1="172" x2="' + xm + '" y2="184" stroke="#1f2a44" stroke-width="2"/>'; if (m % 1 === 0) s += '<text x="' + xm + '" y="200" font-size="13" text-anchor="middle" fill="#56607a" font-weight="700">' + (m ? "hace " + m + " M. a." : "Hoy") + "</text>"; }
    ESPECIES.forEach(function (sp, i) {
      var x1 = xDe(sp.desde), x2 = Math.max(xDe(sp.hasta), x1 + 26), y = 22 + sp.fila * 25, on = i === sel;
      s += '<g class="sp" data-i="' + i + '" style="cursor:pointer"><rect x="' + x1 + '" y="' + y + '" width="' + (x2 - x1) + '" height="21" rx="10.5" fill="' + sp.color + '" stroke="#1f2a44" stroke-width="' + (on ? 4 : 2) + '" opacity="' + (on ? 1 : 0.75) + '"/>' +
        '<text x="' + (sp.hasta < 0.2 ? x1 - 8 : x2 + 8) + '" y="' + (y + 16) + '" font-size="' + (on ? 16 : 14) + '" font-weight="700" font-style="italic" fill="#1f2a44" text-anchor="' + (sp.hasta < 0.2 ? "end" : "start") + '">' + sp.nombre.replace("Australopithecus", "Australopithecus") + "</text></g>";
    });
    // cráneo
    s += '<rect x="30" y="224" width="500" height="324" rx="16" fill="#fffdf6" stroke="#1f2a44" stroke-width="2.5"/>';
    s += craneo(e.craneo, 185, 400, 1.12);
    if (comparar && sel !== 5) s += craneo(ESPECIES[5].craneo, 185, 400, 1.12, "fantasma") + '<text x="510" y="535" font-size="14" text-anchor="end" fill="#e5534b" font-weight="700">- - - Homo sapiens</text>';
    s += '<text x="50" y="252" font-size="15" font-weight="700" fill="#56607a">CRÁNEO DE PERFIL</text>';
    // ficha
    s += '<rect x="550" y="224" width="420" height="324" rx="16" fill="#fff" stroke="' + e.color + '" stroke-width="4"/>';
    s += '<text x="572" y="260" font-size="' + (e.nombre.length > 22 ? 24 : 27) + '" font-style="italic" font-family="Lilita One, sans-serif" fill="#1f2a44">' + e.nombre + "</text>";
    s += '<text x="572" y="284" font-size="15" fill="#56607a" font-weight="700">' + e.apodo + "</text>";
    s += '<text x="572" y="304" font-size="14" fill="#56607a">' + fecha(e) + "</text>";
    s += '<text x="572" y="332" font-size="15" font-weight="700" fill="#1f2a44">Cerebro: ' + e.cerebro + " cm³</text>";
    s += '<rect x="572" y="340" width="376" height="18" rx="9" fill="#eef2ea" stroke="#1f2a44" stroke-width="2"/><rect x="572" y="340" width="' + (376 * e.cerebro / 1550) + '" height="18" rx="9" fill="' + e.color + '"/>';
    s += '<line x1="' + (572 + 376 * 1350 / 1550) + '" y1="334" x2="' + (572 + 376 * 1350 / 1550) + '" y2="364" stroke="#e5534b" stroke-width="3" stroke-dasharray="4 3"/>';
    s += '<text x="' + (572 + 376 * 1350 / 1550) + '" y="376" font-size="11" text-anchor="middle" fill="#e5534b" font-weight="700">nosotros</text>';
    s += fila("Altura", e.altura, 398) + fila("Herramientas", e.herramientas, 424) + fila("Dónde vivió", e.lugar.join(", "), 466);
    s += '<foreignObject x="566" y="484" width="392" height="60"><div xmlns="http://www.w3.org/1999/xhtml" style="font-size:13.5px;line-height:1.25;background:#fff6d6;border:2px solid #1f2a44;border-radius:10px;padding:6px 9px">' + e.dato + "</div></foreignObject>";
    s += "</svg>";
    raiz.innerHTML = s;
    raiz.querySelectorAll(".sp").forEach(function (gEl) { gEl.onclick = function () { ir(+gEl.dataset.i); }; });
    barra.titulo((sel + 1) + "/" + ESPECIES.length, e.nombre);
  }
  function fila(et, val, y) {
    return '<foreignObject x="566" y="' + (y - 18) + '" width="392" height="46"><div xmlns="http://www.w3.org/1999/xhtml" style="font-size:15px;line-height:1.25"><b>' + et + ":</b> " + val + "</div></foreignObject>";
  }
  function fecha(e) {
    var f = function (m) { return m >= 1 ? String(m).replace(".", ",") + " millones de años" : m > 0 ? Math.round(m * 1000) + " 000 años" : "hoy"; };
    return "de hace " + f(e.desde) + " a " + (e.hasta ? "hace " + f(e.hasta) : "hoy");
  }
  function ir(i) { sel = (i + ESPECIES.length) % ESPECIES.length; pintar(); }
  function jugar(on) {
    jugando = on; btnPlay.innerHTML = on ? C.ICONOS.pausa : C.ICONOS.play; clearInterval(reloj);
    if (on) reloj = setInterval(function () { if (sel === ESPECIES.length - 1) jugar(false); else ir(sel + 1); }, 3500);
  }
  function panel() {
    C.panel('<span class="kicker">Nuestra historia</span><h3>La evolución humana</h3>' +
      "<p>Los seres humanos no venimos del chimpancé: los dos <b>compartimos un antepasado común</b> que vivió en África hace unos <b>6 o 7 millones de años</b>. Desde entonces, cada línea ha evolucionado por su lado.</p>" +
      "<p>Nuestra evolución no es una fila de especies, sino un <b>arbusto</b>: varias especies de homínidos <b>convivieron</b> en el tiempo y muchas se extinguieron sin dejar descendientes.</p>" +
      '<h4>Los grandes cambios</h4><ul class="lista"><li><b>Bipedismo</b>: caminar erguidos sobre dos piernas (fue lo primero).</li><li><b>Cerebro más grande</b>: de unos 400 cm³ a unos 1350 cm³.</li><li>Cara más plana, mandíbula y dientes más pequeños, y aparece el <b>mentón</b>.</li><li><b>Herramientas</b>, <b>fuego</b>, lenguaje, arte y cultura.</li></ul>' +
      '<div class="caja recuerda"><b class="t">¡Pruébalo!</b>Pulsa en cada especie de la línea del tiempo. La línea discontinua roja es el cráneo de <b>Homo sapiens</b>: compara la frente, las cejas y la cara.</div>' +
      '<div class="caja dato"><b class="t">Atapuerca</b>En la sierra de Atapuerca (Burgos) hay uno de los yacimientos más importantes del mundo, con fósiles de <b>Homo antecessor</b> y de antepasados de los neandertales.</div>');
  }
  function crear(cont) {
    var lz = C.el("div", { class: "lienzo" }); cont.appendChild(lz);
    raiz = C.el("div", { style: "position:absolute;inset:0;display:grid" }); lz.appendChild(raiz);
    barra = C.barra(cont);
    var g1 = barra.grupo();
    btnComp = C.boton(g1, "Comparar con nosotros", function () { comparar = !comparar; btnComp.setAttribute("aria-pressed", comparar); pintar(); }); btnComp.setAttribute("aria-pressed", "true");
    var g2 = barra.grupo();
    C.boton(g2, C.ICONOS.ant, function () { jugar(false); ir(sel - 1); }, "", "Especie anterior");
    btnPlay = C.boton(g2, C.ICONOS.play, function () { if (!jugando && sel === ESPECIES.length - 1) sel = 0; jugar(!jugando); pintar(); }, "amarillo", "Recorrer la línea del tiempo");
    C.boton(g2, C.ICONOS.sig, function () { jugar(false); ir(sel + 1); }, "", "Especie siguiente");
    var q = parseInt(new URLSearchParams(location.search).get("e"), 10); sel = q >= 1 && q <= ESPECIES.length ? q - 1 : 0;
  }
  return { crear: crear, mostrar: function () { pintar(); panel(); C.alTick(null); }, ESPECIES: ESPECIES };
})();
