// Interfaz: reproducción de la ruta, panel lateral, estado del glóbulo, sonido del latido y pantalla completa.
(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var P = DATOS.PASOS;
  var VELOCIDADES = [0.5, 1, 2], VEL_BASE = 1.15, PAUSA_PASO = 2.2;
  var st = { circ: "completa", lista: DATOS.CIRCULACIONES.completa.pasos, i: 0, t: 0, jugando: false, vel: 1, espera: 0, sonido: true };

  if (!Escena.iniciar($("scene"), $("labels"))) { $("loading").hidden = true; $("sinWebgl").hidden = false; return; }
  setTimeout(function () { $("loading").hidden = true; }, 400);

  function pasoActual() { return st.lista[st.i]; }

  // ---------- panel y estado ----------
  function pintarPaso() {
    var k = pasoActual(), p = P[k];
    $("stepNo").textContent = (st.i + 1) + "/" + st.lista.length;
    $("stepTitle").textContent = p.titulo;
    $("pPaso").innerHTML =
      '<span class="kicker">Paso ' + (st.i + 1) + ' de ' + st.lista.length + ' · Circulación ' + (p.circ === "pulmonar" ? "pulmonar (menor)" : "general (mayor)") + '</span>' +
      '<h3>' + p.titulo + '</h3>' +
      '<p><span class="etiq ' + (p.vaso === "Capilar" ? "cap" : p.o2[1] > 0.5 ? "o2" : "co2") + '">' + p.vaso + '</span>' +
      '<span class="etiq ' + (p.o2[1] > 0.5 ? "o2" : "co2") + '">' + (p.o2[0] !== p.o2[1] ? (p.o2[1] > p.o2[0] ? "Se carga de oxígeno" : "Suelta el oxígeno") : p.o2[1] > 0.5 ? "Sangre rica en O₂" : "Sangre pobre en O₂") + '</span></p>' +
      '<p>' + p.texto + '</p>' +
      '<div class="caja recuerda"><b class="t">Recuerda</b>' + p.recuerda + '</div>' +
      (p.dato ? '<div class="caja dato"><b class="t">¿Sabías que…?</b>' + p.dato + '</div>' : "");
    Escena.estado.zoom = p.gases ? 5.2 : /Cavidad|Válvula/.test(p.vaso) ? 8 : 11;
    Escena.estado.zona = /Cavidad|Válvula/.test(p.vaso) ? "corazon" : p.gases === "pulmon" ? "pulmon" : null;
    $("circTxt").textContent = p.circ === "pulmonar" ? "Pulmonar" : "General";
    $("vasoTxt").textContent = p.vaso;
  }
  function pintarEstado() {
    var p = P[pasoActual()], o2 = p.o2[0] + (p.o2[1] - p.o2[0]) * st.t;
    Escena.estado.paso = pasoActual(); Escena.estado.t = st.t; Escena.estado.o2 = o2;
    Escena.estado.gases = p.gases && st.t > 0.04 && st.t < 0.97 ? p.gases : null;
    $("o2Barra").style.width = Math.round(8 + o2 * 92) + "%";
    $("o2Txt").textContent = p.o2[0] !== p.o2[1] ? (p.o2[1] > p.o2[0] ? "Cargando oxígeno…" : "Soltando oxígeno…") : o2 > 0.5 ? "Mucho" : "Poco";
  }

  // ---------- reproducción ----------
  function irA(i, t) {
    st.i = (i + st.lista.length) % st.lista.length; st.t = t || 0; st.espera = 0;
    pintarPaso(); pintarEstado();
  }
  function tick(dt) {
    if (!st.jugando) return;
    if (st.espera > 0) { st.espera -= dt * st.vel; if (st.espera <= 0) irA(st.i + 1, 0); return; }
    var k = pasoActual(), lento = P[k].gases ? 0.45 : 1;
    st.t += dt * VEL_BASE * st.vel * lento / Escena.longitudes()[k];
    if (st.t >= 1) {
      st.t = 1;
      if (st.alFin) { var f = st.alFin; jugar(false); pintarEstado(); f(P[k].id); return; }   // en el juego: parar y preguntar
      st.espera = PAUSA_PASO;
    }
    pintarEstado();
  }
  Escena.alTick(tick);
  function jugar(on) {
    st.jugando = on;
    $("playIcon").innerHTML = on ? '<path d="M6 4.5h4v15H6zM14 4.5h4v15h-4z"/>' : '<path d="M7 4.5v15L20 12z"/>';
    $("btnPlay").setAttribute("aria-label", on ? "Pausar" : "Reproducir");
    if (on) seguir(true);
  }
  function seguir(on) {
    Escena.estado.seguir = on; $("btnFollow").setAttribute("aria-pressed", on);
    if (on) { Escena.resaltar(null); marcarParte(null); Escena.vista("seguir"); }
  }

  $("btnPlay").onclick = function () { jugar(!st.jugando); };
  $("btnNext").onclick = function () { irA(st.i + 1, 0); seguir(true); Escena.saltar(); };
  $("btnPrev").onclick = function () { irA(st.t > 0.15 ? st.i : st.i - 1, 0); seguir(true); Escena.saltar(); };
  $("btnRestart").onclick = function () { irA(0, 0); seguir(true); Escena.saltar(); };
  $("btnSpeed").onclick = function () { st.vel = VELOCIDADES[(VELOCIDADES.indexOf(st.vel) + 1) % VELOCIDADES.length]; $("speedTxt").textContent = String(st.vel).replace(".", ",") + "×"; };
  $("btnFollow").onclick = function () { seguir(!Escena.estado.seguir); };
  $("btnOverview").onclick = function () { seguir(false); Escena.vista("todo"); };
  $("btnClean").onclick = function () { var on = this.getAttribute("aria-pressed") !== "true"; this.setAttribute("aria-pressed", on); $("labels").classList.toggle("sin-nombres", on); };

  // Lo que necesita el juego para manejar la ruta
  window.Ruta = {
    ir: function (i) {
      st.circ = "completa"; st.lista = DATOS.CIRCULACIONES.completa.pasos;
      document.querySelectorAll("#circSel button").forEach(function (x) { x.setAttribute("aria-pressed", x.dataset.c === "completa"); });
      irA(i, 0); seguir(true); Escena.saltar();
    },
    jugar: jugar, siguiente: function () { irA(st.i + 1, 0); },
    alFin: function (f) { st.alFin = f; }, indice: function (id) { return P.findIndex(function (p) { return p.id === id; }); }
  };

  // tipo de circulación
  document.querySelectorAll("#circSel button").forEach(function (b) {
    b.onclick = function () {
      st.circ = b.dataset.c; st.lista = DATOS.CIRCULACIONES[st.circ].pasos;
      document.querySelectorAll("#circSel button").forEach(function (x) { x.setAttribute("aria-pressed", x === b); });
      irA(0, 0); seguir(true); Escena.saltar();
    };
  });

  // ---------- panel lateral ----------
  $("pCirc").innerHTML = DATOS.FICHA_CIRCULACION;
  function marcarParte(id) { document.querySelectorAll(".partes button").forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.id === id); }); }
  $("pCorazon").innerHTML = DATOS.FICHA_CORAZON_INTRO + '<ul class="partes">' + DATOS.PARTES.map(function (p) {
    return '<li><button data-id="' + p.id + '" aria-pressed="false"><i style="background:' + p.color + '"></i><span><b>' + p.nombre + '</b><small>' + p.txt + '</small></span></button></li>';
  }).join("") + "</ul>";
  document.querySelectorAll(".partes button").forEach(function (b) {
    b.onclick = function () {
      var ya = b.getAttribute("aria-pressed") === "true";
      if (ya) { seguir(true); return; }
      jugar(false); Escena.estado.seguir = false; $("btnFollow").setAttribute("aria-pressed", false);
      Escena.resaltar(b.dataset.id); marcarParte(b.dataset.id);
    };
  });
  document.querySelectorAll(".ptabs button").forEach(function (b) {
    b.onclick = function () {
      document.querySelectorAll(".ptabs button").forEach(function (x) { x.setAttribute("aria-selected", x === b); });
      $("pPaso").hidden = b.dataset.p !== "paso"; $("pCirc").hidden = b.dataset.p !== "circ"; $("pCorazon").hidden = b.dataset.p !== "corazon";
    };
  });

  // ---------- teclado ----------
  document.addEventListener("keydown", function (e) {
    if (/INPUT|TEXTAREA/.test(e.target.tagName) || document.body.dataset.seccion !== "ruta") return;
    if (e.code === "Space") { e.preventDefault(); jugar(!st.jugando); }
    else if (e.key === "ArrowRight") $("btnNext").onclick();
    else if (e.key === "ArrowLeft") $("btnPrev").onclick();
    else if (e.key === "r" || e.key === "R") $("btnRestart").onclick();
  });

  // ---------- sonido del latido ----------
  var audio = null;
  function golpe(fuerte) {
    if (!st.sonido) return;
    try {
      audio = audio || new (window.AudioContext || window.webkitAudioContext)();
      if (audio.state === "suspended") return;
      var t = audio.currentTime, o = audio.createOscillator(), g = audio.createGain();
      o.type = "sine"; o.frequency.setValueAtTime(fuerte === 1 ? 62 : 52, t); o.frequency.exponentialRampToValueAtTime(34, t + 0.16);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(fuerte === 1 ? 0.5 : 0.32, t + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
      o.connect(g); g.connect(audio.destination); o.start(t); o.stop(t + 0.22);
    } catch (e) { /* sin sonido */ }
  }
  Escena.alLatir(golpe);
  document.addEventListener("pointerdown", function () { try { audio = audio || new (window.AudioContext || window.webkitAudioContext)(); if (audio.state === "suspended") audio.resume(); } catch (e) {} }, true);
  $("btnSound").onclick = function () { st.sonido = !st.sonido; this.classList.toggle("off", !st.sonido); this.title = st.sonido ? "Sonido del latido" : "Sonido desactivado"; };

  // ---------- pantalla completa ----------
  $("btnFull").onclick = function () {
    var d = document;
    if (d.fullscreenElement) d.exitFullscreen(); else if (d.documentElement.requestFullscreen) d.documentElement.requestFullscreen().catch(function () {});
  };

  // Enlace directo a un paso: index.html?paso=5 (útil para preparar la clase)
  var q = new URLSearchParams(location.search), pq = parseInt(q.get("paso"), 10);
  irA(pq >= 1 && pq <= P.length ? pq - 1 : 0, parseFloat(q.get("t")) || 0);
  if (q.get("vista") === "todo") { seguir(false); Escena.vista("todo"); }
  Escena.saltar();
})();
