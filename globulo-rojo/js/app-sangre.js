// Cambio de sección (La ruta / La sangre) y panel de la sección «La sangre».
(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var C = SANGRE.COMPONENTES, iniciada = false, modo = "micro";

  function ficha(tipo) {
    if (!tipo) return SANGRE.INTRO + lista();
    var c = C[tipo], d = c.datos;
    return '<span class="kicker">' + c.grupo + (c.alias ? " · " + c.alias : "") + '</span><h3>' + c.nombre + '</h3>' + c.ficha +
      (d ? '<div class="ficha-datos"><b>Cuántos</b><span>' + d.cuantos + '</span><b>Tamaño</b><span>' + d.tamano + '</span><b>Viven</b><span>' + d.vida + '</span><b>Forma</b><span>' + d.forma + '</span></div>' : "") +
      '<div class="caja recuerda"><b class="t">Recuerda</b>' + c.recuerda + '</div>' + lista(tipo);
  }
  function lista(sel) {
    return '<h4>Los componentes</h4><ul class="partes">' + SANGRE.ORDEN.map(function (k) {
      return '<li><button data-c="' + k + '" aria-pressed="' + (k === sel) + '"><i style="background:' + C[k].color + '"></i><span><b>' + C[k].nombre + '</b><small>' + C[k].resumen + '</small></span></button></li>';
    }).join("") + "</ul>";
  }
  function mostrarFicha(html) {
    $("sFicha").innerHTML = html;
    $("sFicha").querySelectorAll("button[data-c]").forEach(function (b) {
      b.onclick = function () {
        if (modo !== "micro") ponerModo("micro");
        Sangre.elegir(b.dataset.c); mostrarFicha(ficha(b.dataset.c)); $("sFicha").scrollTop = 0;
      };
    });
    pestana("ficha");
  }
  function pestana(q) {
    document.querySelectorAll("#ladoSangre .ptabs button").forEach(function (x) { x.setAttribute("aria-selected", x.dataset.q === q); });
    $("sFicha").hidden = q !== "ficha"; $("sComparar").hidden = q !== "comparar";
  }
  document.querySelectorAll("#ladoSangre .ptabs button").forEach(function (b) { b.onclick = function () { pestana(b.dataset.q); }; });
  $("sComparar").innerHTML = '<span class="kicker">Para estudiar</span><h3>Comparamos las células de la sangre</h3>' +
    '<table class="tabla"><tr><th></th><th>Glóbulos rojos</th><th>Glóbulos blancos</th><th>Plaquetas</th></tr>' +
    '<tr><td><b>Otros nombres</b></td><td>Hematíes, eritrocitos</td><td>Leucocitos</td><td>Trombocitos</td></tr>' +
    '<tr><td><b>Núcleo</b></td><td>No</td><td>Sí</td><td>No (son fragmentos)</td></tr>' +
    '<tr><td><b>Cuántos por mm³</b></td><td>≈ 5 millones</td><td>5 000 – 10 000</td><td>150 000 – 400 000</td></tr>' +
    '<tr><td><b>Función</b></td><td>Transportar el oxígeno</td><td>Defensa frente a infecciones</td><td>Coagulación</td></tr>' +
    '<tr><td><b>Viven</b></td><td>≈ 120 días</td><td>De días a años</td><td>≈ 10 días</td></tr></table>' +
    '<div class="caja dato"><b class="t">¿Dónde se fabrican?</b>Todas las células de la sangre nacen en la <b>médula ósea roja</b>. Los glóbulos rojos viejos se destruyen en el <b>bazo</b> y en el <b>hígado</b>.</div>';

  function ponerModo(m, t0) {
    modo = m; Sangre.modo(m, t0);
    document.querySelectorAll("#sModos button[data-m]").forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.m === m); });
    mostrarFicha(m === "micro" ? ficha(null) : SANGRE.FICHAS_MODO[m] + lista());
  }
  document.querySelectorAll("#sModos button[data-m]").forEach(function (b) { b.onclick = function () { ponerModo(b.dataset.m); }; });
  $("sRepetir").onclick = function () { Sangre.repetir(); };

  // ---------- secciones ----------
  function seccion(s, vistaJuego) {
    var v = s === "juego" ? (vistaJuego || "ruta") : s;
    if (v === "sangre" && !iniciada) {
      iniciada = Sangre.iniciar($("sceneSangre"), $("labelsSangre"));
      Sangre.alElegir(function (tipo) { mostrarFicha(ficha(tipo)); });
      Sangre.alPaso(function (txt, i, n) { $("sPasoTxt").textContent = txt; $("sPasoNo").textContent = n > 1 ? (i + 1) + "/" + n : "i"; });
      ponerModo("micro");
    }
    document.body.dataset.seccion = s;
    document.querySelectorAll(".tabs button[data-s]").forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.s === s); });
    $("vistaRuta").hidden = v !== "ruta"; $("vistaSangre").hidden = v !== "sangre";
    $("ladoRuta").hidden = s !== "ruta"; $("ladoSangre").hidden = s !== "sangre"; $("ladoJuego").hidden = s !== "juego";
    $("circSel").hidden = s !== "ruta";
    $("stage").classList.toggle("en-sangre", v === "sangre"); $("stage").classList.toggle("en-juego", s === "juego");
    Escena.activar(v === "ruta"); if (iniciada) Sangre.activar(v === "sangre");
    if (window.Juego && !vistaJuego) { if (s === "juego") Juego.abrir(); else Juego.cerrar(); }
  }
  window.Secciones = { ir: seccion, modoSangre: function (m) { ponerModo(m); } };
  document.querySelectorAll(".tabs button[data-s]").forEach(function (b) { b.onclick = function () { if (!b.disabled) seccion(b.dataset.s); }; });
  document.body.dataset.seccion = "ruta";
  var q = new URLSearchParams(location.search);
  if (q.get("seccion") === "sangre") { seccion("sangre"); if (q.get("vista") && SANGRE.MODOS[q.get("vista")]) ponerModo(q.get("vista"), parseFloat(q.get("t")) || 0);
    if (C[q.get("ver")]) { Sangre.elegir(q.get("ver")); mostrarFicha(ficha(q.get("ver"))); } }
})();
