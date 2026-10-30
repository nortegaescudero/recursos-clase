// Juego de preguntas, individual o por dos equipos (Estrella contra Rayo).
var Juego = (function () {
  "use strict";
  var C = Comun, raiz, marcador, cfg = { tema: "todos", n: 10, equipos: 1 }, J = null;
  var EQUIPOS = ["Equipo Estrella", "Equipo Rayo"];

  function opcion(grupo, valor, titulo, sub) { return '<button class="opt" data-g="' + grupo + '" data-v="' + valor + '" aria-pressed="' + (String(cfg[grupo]) === String(valor)) + '">' + titulo + (sub ? "<small>" + sub + "</small>" : "") + "</button>"; }
  function pantallaInicio() {
    J = null; marcador.hidden = true;
    var temas = '<div class="opts" style="grid-template-columns:repeat(3,1fr)">' + opcion("tema", "todos", "De todo", "Mezcla de los 5 temas") +
      Object.keys(PREGUNTAS.TEMAS).map(function (k) { return opcion("tema", k, PREGUNTAS.TEMAS[k]); }).join("") + "</div>";
    raiz.innerHTML = '<div class="card"><h2>Juego de preguntas</h2><p>Elegid el tema y los jugadores. Los botones son grandes, pensados para la pizarra digital.</p>' +
      "<h3>Tema</h3>" + temas + "<h3>Número de preguntas</h3><div class=\"opts\" style=\"grid-template-columns:repeat(3,1fr)\">" + opcion("n", 6, "6 preguntas") + opcion("n", 10, "10 preguntas") + opcion("n", 16, "16 preguntas") + "</div>" +
      '<h3>Jugadores</h3><div class="opts">' + opcion("equipos", 1, "Individual", "Toda la clase junta o una sola persona.") + opcion("equipos", 2, "Dos equipos", "Equipo Estrella contra Equipo Rayo, por turnos.") + "</div>" +
      '<div class="acciones"><button class="btn" id="jEmpezar">¡Empezar!</button></div></div>';
    raiz.querySelectorAll(".opt").forEach(function (b) {
      b.onclick = function () { var g = b.dataset.g; cfg[g] = g === "tema" ? b.dataset.v : +b.dataset.v; raiz.querySelectorAll('.opt[data-g="' + g + '"]').forEach(function (x) { x.setAttribute("aria-pressed", x === b); }); };
    });
    C.$("jEmpezar").onclick = empezar;
    panel();
  }
  function empezar() {
    var lista = PREGUNTAS.LISTA.filter(function (q) { return cfg.tema === "todos" || q.t === cfg.tema; });
    if (cfg.tema === "todos") {   // repartidas entre los temas
      var porTema = {}; C.barajar(lista).forEach(function (q) { (porTema[q.t] = porTema[q.t] || []).push(q); });
      var mezcla = [], temas = Object.keys(porTema); for (var i = 0; mezcla.length < lista.length; i++) { var tq = porTema[temas[i % temas.length]]; if (tq.length) mezcla.push(tq.shift()); }
      lista = mezcla;
    } else lista = C.barajar(lista);
    J = { preguntas: lista.slice(0, cfg.n), n: 0, puntos: [0, 0], hechas: [0, 0], turno: 0, equipos: cfg.equipos };
    preguntar();
  }
  function preguntar() {
    var q = J.preguntas[J.n], orden = C.barajar([0, 1, 2, 3].slice(0, q.o.length)), eq = J.equipos === 2 ? J.turno : -1;
    pintarMarcador();
    raiz.innerHTML = '<div class="card"><span class="qtag' + (eq >= 0 ? " t" + eq : "") + '">Pregunta ' + (J.n + 1) + " de " + J.preguntas.length + " · " + (eq >= 0 ? "Turno del " + EQUIPOS[eq] : PREGUNTAS.TEMAS[q.t]) + "</span>" +
      "<h2>" + q.p + '</h2><div class="opts">' + orden.map(function (i) { return '<button class="opt" data-i="' + i + '">' + q.o[i] + "</button>"; }).join("") + '</div><div id="jFb"></div>' +
      '<div class="acciones" id="jAcc" hidden><button class="btn" id="jSeguir">' + (J.n + 1 < J.preguntas.length ? "Siguiente pregunta" : "Ver resultados") + "</button></div></div>";
    raiz.querySelectorAll(".opt").forEach(function (b) {
      b.onclick = function () {
        var bien = b.dataset.i === "0", e = J.equipos === 2 ? J.turno : 0;
        raiz.querySelectorAll(".opt").forEach(function (x) { x.disabled = true; if (x.dataset.i === "0") x.classList.add("ok"); else if (x === b) x.classList.add("mal"); });
        J.hechas[e]++; if (bien) J.puntos[e]++;
        C.$("jFb").innerHTML = '<div class="fb ' + (bien ? "ok" : "mal") + '"><b>' + (bien ? "¡Correcto!" : "¡Casi! Era: " + q.o[0]) + "</b>" + q.e + "</div>";
        C.$("jAcc").hidden = false; sonido(bien);
        J.n++; if (J.equipos === 2) J.turno = 1 - J.turno;
        pintarMarcador(); panel();
        C.$("jSeguir").onclick = function () { if (J.n < J.preguntas.length) preguntar(); else resultados(); };
      };
    });
    panel();
  }
  function resultados() {
    var h;
    if (J.equipos === 2) {
      var a = J.puntos[0], b = J.puntos[1];
      h = "<p>" + (a === b ? "¡Empate! Los dos equipos lo han hecho genial." : "¡Gana el " + EQUIPOS[a > b ? 0 : 1] + "!") + '</p><div class="podio">' +
        [0, 1].map(function (i) { return '<div class="' + (J.puntos[i] >= J.puntos[1 - i] ? "gana" : "") + '">' + EQUIPOS[i] + "<b>" + J.puntos[i] + "</b>de " + J.hechas[i] + " preguntas</div>"; }).join("") + "</div>";
    } else {
      var p = J.puntos[0], tot = J.hechas[0], r = tot ? p / tot : 0, est = r >= 0.9 ? 3 : r >= 0.6 ? 2 : r >= 0.3 ? 1 : 0;
      h = '<div class="estrellas">' + "★★★".slice(0, est) + '<span style="color:#d4d9e3">' + "★★★".slice(est) + "</span></div><p><b>" + p + " aciertos de " + tot + ".</b> " +
        (est === 3 ? "¡Sois unos expertos en evolución!" : est === 2 ? "¡Muy bien! Repasad las que habéis fallado." : "Volved a mirar las secciones y probad otra vez.") + "</p>";
    }
    marcador.hidden = true;
    raiz.innerHTML = '<div class="card"><h2>¡Fin de la partida!</h2>' + h + '<div class="acciones"><button class="btn alt" id="jOtraConfig">Cambiar tema</button><button class="btn" id="jOtra">Jugar otra vez</button></div></div>';
    C.$("jOtra").onclick = empezar; C.$("jOtraConfig").onclick = pantallaInicio;
    J.terminada = true; panel();
  }
  function pintarMarcador() {
    marcador.hidden = false;
    marcador.innerHTML = (J.equipos === 2 ? [0, 1].map(function (i) { return '<span class="equipo' + (J.turno === i && !J.terminada ? " turno" : "") + '">' + (i ? "⚡ Rayo" : "★ Estrella") + ": " + J.puntos[i] + "</span>"; }).join("")
      : '<span class="equipo">Aciertos: ' + J.puntos[0] + "</span>");
  }
  function panel() {
    var t = cfg.tema === "todos" ? "De todo" : PREGUNTAS.TEMAS[cfg.tema];
    C.panel('<span class="kicker">Modo juego</span><h3>' + (J ? "Partida en marcha" : "¿Cuánto sabéis?") + "</h3>" +
      (J ? '<p>Tema: <b>' + t + "</b></p>" + (J.equipos === 2 && !J.terminada ? '<div class="caja recuerda"><b class="t">Turno</b>Responde el <b>' + EQUIPOS[J.turno] + "</b>.</div>" : "") +
        '<table class="tabla"><tr><th>Pregunta</th><td>' + Math.min(J.n + (J.terminada ? 0 : 1), J.preguntas.length) + " de " + J.preguntas.length + "</td></tr>" +
        (J.equipos === 2 ? "<tr><th>★ Estrella</th><td>" + J.puntos[0] + " aciertos</td></tr><tr><th>⚡ Rayo</th><td>" + J.puntos[1] + " aciertos</td></tr>" : "<tr><th>Aciertos</th><td>" + J.puntos[0] + "</td></tr>") + "</table>" +
        (J.terminada ? "" : '<div class="acciones" style="justify-content:flex-start"><button class="btn alt" id="jSalir">Terminar partida</button></div>')
        : "<p>Hay <b>" + PREGUNTAS.LISTA.length + " preguntas</b> sobre los cinco temas de la web. Se pueden jugar todas mezcladas o solo las de un tema.</p>" +
          '<div class="caja dato"><b class="t">Por equipos</b>Los equipos responden por turnos. Gana el que más preguntas acierte.</div>' +
          '<div class="caja recuerda"><b class="t">Consejo</b>Antes de jugar, repasad las secciones: el ADN, la mitosis y la meiosis, la herencia, la selección natural y la evolución humana.</div>'));
    var s = C.$("jSalir"); if (s) s.onclick = function () { if (confirm("¿Terminar la partida ahora?")) resultados(); };
  }
  var audio = null;
  function sonido(bien) {
    try {
      audio = audio || new (window.AudioContext || window.webkitAudioContext)();
      var t = audio.currentTime;
      (bien ? [523, 659, 784] : [330, 262]).forEach(function (f, i) {
        var o = audio.createOscillator(), g = audio.createGain(); o.type = bien ? "triangle" : "sawtooth"; o.frequency.value = f;
        g.gain.setValueAtTime(0.0001, t + i * 0.11); g.gain.exponentialRampToValueAtTime(bien ? 0.18 : 0.07, t + i * 0.11 + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.11 + 0.25);
        o.connect(g); g.connect(audio.destination); o.start(t + i * 0.11); o.stop(t + i * 0.11 + 0.3);
      });
    } catch (e) { /* sin sonido */ }
  }
  function crear(cont) {
    var fondo = C.el("div", { class: "juego-fondo" }); cont.appendChild(fondo);
    raiz = C.el("div", { style: "width:100%;display:grid;place-items:center" }); fondo.appendChild(raiz);
    marcador = C.el("div", { class: "marcador" }); marcador.hidden = true; cont.appendChild(marcador);
    pantallaInicio();
  }
  return { crear: crear, mostrar: function () { C.alTick(null); panel(); } };
})();
