// Cambio de sección, pantalla completa y enlaces directos (?s=division).
(function () {
  "use strict";
  var $ = Comun.$;
  var SECCIONES = { adn: "SeccionADN", division: "SeccionDivision", herencia: "SeccionHerencia", seleccion: "SeccionSeleccion", humanos: "SeccionHumanos", juego: "Juego" };
  var creadas = {};
  function mostrar(s) {
    var mod = window[SECCIONES[s]]; if (!mod) return;
    Object.keys(SECCIONES).forEach(function (k) { $("sec-" + k).hidden = k !== s; });
    document.querySelectorAll("#tabs button").forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.s === s); });
    if (!creadas[s]) { mod.crear($("sec-" + s)); creadas[s] = true; }
    Comun.alTick(null);
    mod.mostrar();
  }
  document.querySelectorAll("#tabs button").forEach(function (b) { b.onclick = function () { mostrar(b.dataset.s); }; });
  $("btnFull").onclick = function () {
    if (document.fullscreenElement) document.exitFullscreen(); else if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(function () {});
  };
  var q = new URLSearchParams(location.search);
  mostrar(SECCIONES[q.get("s")] ? q.get("s") : "adn");
  window.App = { mostrar: mostrar, parametro: function (k) { return q.get(k); } };
})();
