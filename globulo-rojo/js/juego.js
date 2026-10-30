// Modo juego: «Ruta con preguntas», «¿Dónde estoy?» y «¿Quién soy?», individual o por dos equipos.
var Juego = (function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var P = DATOS.PASOS, C = SANGRE.COMPONENTES;
  var cfg = { tipo: "ruta", equipos: 1 }, J = null;

  function barajar(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function azar(a) { return a[Math.floor(Math.random() * a.length)]; }
  function mostrar(id, on) { $(id).hidden = !on; }

  // ---------- configuración ----------
  $("setTipo").innerHTML = Object.keys(JUEGO.TIPOS).map(function (k) {
    return '<button class="opt" data-v="' + k + '" aria-pressed="' + (k === cfg.tipo) + '">' + JUEGO.TIPOS[k].nombre + '<small>' + JUEGO.TIPOS[k].desc + '</small></button>';
  }).join("");
  function grupoOpciones(id, clave) {
    $(id).querySelectorAll(".opt").forEach(function (b) {
      b.onclick = function () {
        cfg[clave] = clave === "equipos" ? +b.dataset.v : b.dataset.v;
        $(id).querySelectorAll(".opt").forEach(function (x) { x.setAttribute("aria-pressed", x === b); });
      };
    });
  }
  grupoOpciones("setTipo", "tipo"); grupoOpciones("setJug", "equipos");

  function abrir() {
    terminarRonda();
    J = null;
    Secciones.ir("juego", cfg.tipo === "quien" ? "sangre" : "ruta");
    mostrar("ovSetup", true); mostrar("ovPregunta", false); mostrar("ovFin", false); mostrar("marcador", false); mostrar("btnYaLoSe", false);
    lado();
  }
  function cerrar() {
    terminarRonda(); J = null;
    ["ovSetup", "ovPregunta", "ovFin", "marcador", "btnYaLoSe"].forEach(function (id) { mostrar(id, false); });
    $("stage").classList.remove("preguntando");
  }
  function terminarRonda() {
    Ruta.alFin(null); Ruta.jugar(false);
    $("stage").classList.remove("modo-misterio");
  }
  $("btnSetupVolver").onclick = function () { Secciones.ir("ruta"); };
  $("btnSetupGo").onclick = empezar;
  $("btnFinOtra").onclick = function () { mostrar("ovFin", false); mostrar("ovSetup", true); lado(); };
  $("btnFinExplicar").onclick = function () { Secciones.ir("ruta"); };

  // ---------- partida ----------
  function empezar() {
    J = { tipo: cfg.tipo, equipos: cfg.equipos, puntos: [0, 0], hechas: [0, 0], turno: 0, n: 0, total: 0 };
    mostrar("ovSetup", false);
    if (J.tipo === "ruta") {
      J.total = Object.keys(JUEGO.RUTA).length;
      Secciones.ir("juego", "ruta");
      Ruta.ir(0); Ruta.alFin(finPasoRuta); Ruta.jugar(true);
    } else if (J.tipo === "donde") {
      J.rondas = barajar(JUEGO.DONDE).slice(0, 6); J.total = J.rondas.length;
      Secciones.ir("juego", "ruta");
      rondaDonde();
    } else {
      J.rondas = barajar(JUEGO.QUIEN).slice(0, 8); J.total = J.rondas.length;
      Secciones.ir("juego", "sangre"); Secciones.modoSangre("micro");
      $("stage").classList.add("modo-misterio");
      setTimeout(rondaQuien, 600);
    }
    marcador(); lado();
  }

  // Ruta con preguntas: al acabar cada paso con pregunta, se para y pregunta
  function finPasoRuta(id) {
    if (!JUEGO.RUTA[id]) { seguirRuta(id); return; }
    var q = azar(JUEGO.RUTA[id]);
    preguntar(P[Ruta.indice(id)].titulo, q.p, q.o, 0, q.e, function () { seguirRuta(id); });
  }
  function seguirRuta(id) {
    if (id === "ven") { fin(); return; }
    Ruta.siguiente(); Ruta.alFin(finPasoRuta); Ruta.jugar(true);
  }

  // ¿Dónde estoy?: se recorre un tramo sin nombres y hay que adivinarlo
  function rondaDonde() {
    var id = J.rondas[J.n];
    $("stage").classList.add("modo-misterio");
    Ruta.ir(Ruta.indice(id));
    Ruta.alFin(function () { preguntaDonde(id); });
    Ruta.jugar(true);
    mostrar("btnYaLoSe", true);
    $("btnYaLoSe").onclick = function () { Ruta.alFin(null); Ruta.jugar(false); preguntaDonde(id); };
  }
  function preguntaDonde(id) {
    mostrar("btnYaLoSe", false); Ruta.alFin(null);
    var otros = barajar(JUEGO.DONDE.filter(function (x) { return x !== id; })).slice(0, 3);
    var nombre = function (x) { return P[Ruta.indice(x)].titulo; };
    preguntar("¿Dónde estoy?", "¿En qué parte del recorrido está el glóbulo rojo?", [nombre(id)].concat(otros.map(nombre)), 0,
      P[Ruta.indice(id)].recuerda.replace(/<[^>]+>/g, ""), function () { if (J.n >= J.total) fin(); else rondaDonde(); },
      function () { $("stage").classList.remove("modo-misterio"); });
  }

  // ¿Quién soy?: pistas sobre los componentes de la sangre
  function rondaQuien() {
    var q = J.rondas[J.n], ops = SANGRE.ORDEN.slice();
    $("stage").classList.add("modo-misterio"); Sangre.elegir(null);
    preguntar("¿Quién soy?", "«" + q.p + "»", ops.map(function (k) { return '<i class="ico-comp" style="background:' + C[k].color + '"></i>' + C[k].nombre; }), ops.indexOf(q.r),
      "Es: " + C[q.r].nombre + (C[q.r].alias ? " (" + C[q.r].alias.toLowerCase() + ")" : "") + ". " + C[q.r].resumen, function () { if (J.n >= J.total) fin(); else rondaQuien(); },
      function () { $("stage").classList.remove("modo-misterio"); Sangre.elegir(q.r); }, true);
  }

  // ---------- pregunta en pantalla ----------
  function preguntar(tag, titulo, opciones, buena, explicacion, despues, alResponder, sinBarajar) {
    var orden = opciones.map(function (o, i) { return i; });
    if (!sinBarajar) orden = barajar(orden);
    var equipo = J.equipos === 2 ? J.turno : -1;
    $("qTag").className = "qtag" + (equipo >= 0 ? " turno" + equipo : "");
    $("qTag").textContent = "Pregunta " + (J.n + 1) + " de " + J.total + " · " + (equipo >= 0 ? "Turno del " + JUEGO.EQUIPOS[equipo] : tag);
    $("qTitulo").textContent = titulo;
    $("qOpts").innerHTML = orden.map(function (i) { return '<button class="opt" data-i="' + i + '">' + opciones[i] + "</button>"; }).join("");
    $("qFb").innerHTML = ""; mostrar("qAcciones", false);
    $("qOpts").querySelectorAll(".opt").forEach(function (b) {
      b.onclick = function () {
        var acierto = +b.dataset.i === buena;
        $("qOpts").querySelectorAll(".opt").forEach(function (x) {
          x.disabled = true;
          if (+x.dataset.i === buena) x.classList.add("ok"); else if (x === b) x.classList.add("mal");
        });
        var eq = J.equipos === 2 ? J.turno : 0;
        J.hechas[eq]++; if (acierto) J.puntos[eq]++;
        $("qFb").innerHTML = '<div class="fb ' + (acierto ? "ok" : "mal") + '"><b>' + (acierto ? "¡Correcto!" : "¡Casi! La respuesta era: " + opciones[buena].replace(/<[^>]+>/g, "")) + "</b>" + explicacion + "</div>";
        mostrar("qAcciones", true); $("btnQSeguir").focus();
        if (alResponder) alResponder();
        sonido(acierto);
        J.n++; if (J.equipos === 2) J.turno = 1 - J.turno;
        marcador(); lado();
      };
    });
    $("btnQSeguir").onclick = function () { mostrar("ovPregunta", false); $("stage").classList.remove("preguntando"); despues(); };
    mostrar("ovPregunta", true); $("stage").classList.add("preguntando");
  }

  function fin() {
    J.terminada = true;
    terminarRonda(); mostrar("btnYaLoSe", false); mostrar("ovPregunta", false); $("stage").classList.remove("preguntando");
    var html;
    if (J.equipos === 2) {
      var a = J.puntos[0], b = J.puntos[1];
      html = '<p>' + (a === b ? "¡Empate! Los dos equipos lo han hecho genial." : "¡Gana el " + JUEGO.EQUIPOS[a > b ? 0 : 1] + "!") + "</p>" +
        '<div class="podio">' + [0, 1].map(function (i) { return '<div class="' + (J.puntos[i] >= J.puntos[1 - i] ? "gana" : "") + '">' + JUEGO.EQUIPOS[i] + "<b>" + J.puntos[i] + "</b>de " + J.hechas[i] + " preguntas</div>"; }).join("") + "</div>";
    } else {
      var p = J.puntos[0], tot = J.hechas[0], pct = tot ? p / tot : 0, est = pct >= 0.9 ? 3 : pct >= 0.6 ? 2 : pct >= 0.3 ? 1 : 0;
      html = '<div class="estrellas">' + "★★★".slice(0, est) + '<span style="color:#d4d9e3">' + "★★★".slice(est) + "</span></div>" +
        "<p><b>" + p + " aciertos de " + tot + " preguntas.</b> " + (est === 3 ? "¡Sois unos expertos del aparato circulatorio!" : est === 2 ? "¡Muy bien! Repasad las que habéis fallado." : "Volved a mirar la explicación y probad otra vez.") + "</p>";
    }
    $("finCuerpo").innerHTML = html;
    mostrar("ovFin", true); mostrar("marcador", false);
    $("stage").classList.remove("modo-misterio");
    lado();
  }

  // ---------- marcador y panel ----------
  function marcador() {
    if (!J) { mostrar("marcador", false); return; }
    var h = J.equipos === 2 ? [0, 1].map(function (i) { return '<span class="equipo' + (J.turno === i ? " turno" : "") + '">' + (i ? "⚡ " : "★ ") + JUEGO.EQUIPOS[i].replace("Equipo ", "") + ": " + J.puntos[i] + "</span>"; }).join("")
      : '<span class="equipo">Aciertos: ' + J.puntos[0] + " / " + J.n + "</span>";
    $("marcador").innerHTML = h + '<span class="equipo">' + Math.min(J.n + 1, J.total) + " / " + J.total + "</span>";
    mostrar("marcador", true);
  }
  function lado() {
    var t = JUEGO.TIPOS[(J && J.tipo) || cfg.tipo];
    $("jLado").innerHTML = '<span class="kicker">Modo juego</span><h3>' + (J ? t.nombre : "Elegid la partida") + "</h3>" +
      (J ? "<p>" + t.desc + "</p>" + (J.terminada ? '<div class="caja recuerda"><b class="t">Partida terminada</b>Pulsad «Jugar otra vez» para empezar otra.</div>' : J.equipos === 2 ? '<div class="caja recuerda"><b class="t">Turno</b>Responde el <b>' + JUEGO.EQUIPOS[J.turno] + "</b>.</div>" : "") +
        '<div class="ficha-datos"><b>Pregunta</b><span>' + Math.min(J.n + 1, J.total) + " de " + J.total + "</span>" +
        (J.equipos === 2 ? "<b>★ Estrella</b><span>" + J.puntos[0] + " aciertos</span><b>⚡ Rayo</b><span>" + J.puntos[1] + " aciertos</span>" : "<b>Aciertos</b><span>" + J.puntos[0] + "</span>") + "</div>" +
        (J.terminada ? "" : '<div class="actions" style="justify-content:flex-start"><button class="btn alt" id="btnAbandonar">Terminar partida</button></div>')
        : "<p>Hay tres tipos de partida:</p><ul class=\"lista\">" + Object.keys(JUEGO.TIPOS).map(function (k) { return "<li><b>" + JUEGO.TIPOS[k].nombre + ":</b> " + JUEGO.TIPOS[k].desc + "</li>"; }).join("") + "</ul>" +
          '<div class="caja dato"><b class="t">Por equipos</b>Los equipos responden por turnos. Gana el que más preguntas acierte.</div>');
    var b = $("btnAbandonar"); if (b) b.onclick = function () { if (confirm("¿Terminar la partida ahora?")) fin(); };
  }

  // ---------- sonido ----------
  var audio = null;
  function sonido(bien) {
    try {
      audio = audio || new (window.AudioContext || window.webkitAudioContext)();
      var t = audio.currentTime;
      (bien ? [523, 659, 784] : [330, 262]).forEach(function (f, i) {
        var o = audio.createOscillator(), g = audio.createGain(); o.type = bien ? "triangle" : "sawtooth"; o.frequency.value = f;
        g.gain.setValueAtTime(0.0001, t + i * 0.11); g.gain.exponentialRampToValueAtTime(bien ? 0.18 : 0.08, t + i * 0.11 + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.11 + 0.25);
        o.connect(g); g.connect(audio.destination); o.start(t + i * 0.11); o.stop(t + i * 0.11 + 0.3);
      });
    } catch (e) { /* sin sonido */ }
  }

  return { abrir: abrir, cerrar: cerrar };
})();
