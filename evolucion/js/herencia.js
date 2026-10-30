// Sección 3: herencia mendeliana con guisantes (A = amarillo, dominante; a = verde, recesivo) y cuadro de Punnett.
var SeccionHerencia = (function () {
  "use strict";
  var C = Comun, raiz, barra, padres = ["AA", "aa"], temporizadores = [];
  var AMARILLO = ["#fff3a6", "#f5d33b", "#c9a40e"], VERDE = ["#d8f2b5", "#7bbf4a", "#4d8a26"];

  function guisante(gen, tam) {
    var c = gen.indexOf("A") >= 0 ? AMARILLO : VERDE, id = "g" + Math.random().toString(36).slice(2, 8);
    return '<svg width="' + tam + '" height="' + tam + '" viewBox="0 0 60 60" aria-hidden="true"><defs><radialGradient id="' + id + '" cx="38%" cy="35%" r="70%">' +
      '<stop offset="0" stop-color="' + c[0] + '"/><stop offset=".55" stop-color="' + c[1] + '"/><stop offset="1" stop-color="' + c[2] + '"/></radialGradient></defs>' +
      '<circle cx="30" cy="31" r="25" fill="url(#' + id + ')" stroke="#1f2a44" stroke-width="2.5"/><ellipse cx="22" cy="21" rx="7" ry="4" fill="#fff" opacity=".6" transform="rotate(-25 22 21)"/></svg>';
  }
  function fenotipo(gen) { return gen.indexOf("A") >= 0 ? "Amarilla" : "Verde"; }
  function nombreGen(gen) { return gen === "Aa" ? "Heterocigoto" : gen === "AA" ? "Homocigoto dominante" : "Homocigoto recesivo"; }
  function ordenar(a, b) { return (a === "A" ? "A" : "") + (b === "A" ? "A" : "") + (a === "a" ? "a" : "") + (b === "a" ? "a" : ""); }

  function pintar(animar) {
    temporizadores.forEach(clearTimeout); temporizadores = [];
    var h = "";
    [0, 1].forEach(function (i) {
      h += '<div class="padre"><h3>' + (i ? "Planta 2" : "Planta 1") + "</h3>" + guisante(padres[i], 74) +
        '<div><b>' + padres[i] + "</b> · semilla " + fenotipo(padres[i]).toLowerCase() + '</div><small style="color:#56607a">' + nombreGen(padres[i]) + "</small>" +
        '<div class="genos">' + ["AA", "Aa", "aa"].map(function (g) { return '<button data-p="' + i + '" data-g="' + g + '" aria-pressed="' + (g === padres[i]) + '">' + g + "</button>"; }).join("") + "</div></div>";
      if (!i) h += '<div class="cruce">×</div>';
    });
    var g1 = padres[0].split(""), g2 = padres[1].split(""), hijos = [];
    var tab = '<div class="tablero"><div class="vacio"></div>' + g2.map(function (x) { return '<div class="g">' + x + "<small style='font-family:var(--body);font-size:11px;display:block'>gameto</small></div>"; }).join("");
    g1.forEach(function (a) {
      tab += '<div class="g">' + a + "</div>";
      g2.forEach(function (b) { var hijo = ordenar(a, b); hijos.push(hijo); tab += '<div class="hijo' + (animar ? "" : " ver") + '">' + guisante(hijo, 48) + "<span>" + hijo + "</span><small>" + fenotipo(hijo) + "</small></div>"; });
    });
    tab += "</div>";
    var cuenta = function (f) { return hijos.filter(f).length / 4 * 100; };
    var res = '<div class="resumen"><h3>Descendientes</h3>' +
      [["AA", "#c9a40e"], ["Aa", "#f5d33b"], ["aa", "#7bbf4a"]].map(function (g) { var p = cuenta(function (x) { return x === g[0]; }); return '<div class="barraP"><span style="width:34px">' + g[0] + '</span><span class="b"><i style="width:' + p + "%;background:" + g[1] + '"></i></span><span style="width:44px;text-align:right">' + p + " %</span></div>"; }).join("") +
      '<h3 style="margin-top:12px">Lo que se ve</h3>' +
      [["Amarillas", "#f5d33b", function (x) { return x.indexOf("A") >= 0; }], ["Verdes", "#7bbf4a", function (x) { return x === "aa"; }]].map(function (g) { var p = cuenta(g[2]); return '<div class="barraP"><span style="width:90px">' + g[0] + '</span><span class="b"><i style="width:' + p + "%;background:" + g[1] + '"></i></span><span style="width:44px;text-align:right">' + p + " %</span></div>"; }).join("") +
      '<p style="margin:10px 0 0;font-size:14px;color:#56607a">Cada casilla tiene un 25 % de probabilidad.</p></div>';
    raiz.innerHTML = h + '<div class="punnett">' + tab + res + "</div>";
    raiz.querySelectorAll(".genos button").forEach(function (b) { b.onclick = function () { padres[+b.dataset.p] = b.dataset.g; pintar(true); }; });
    if (animar) raiz.querySelectorAll(".hijo").forEach(function (d, i) { temporizadores.push(setTimeout(function () { d.classList.add("ver"); }, 250 + i * 380)); });
    barra.titulo("", padres[0] + " × " + padres[1]);
    panel();
  }

  function panel() {
    var caso = padres.slice().sort().join(" × ");
    var nota = caso === "AA × aa" ? "Es el primer cruce de Mendel: todos los hijos son <b>Aa</b> y amarillos. El verde «desaparece»… pero sigue escondido." :
      caso === "Aa × Aa" ? "Es el segundo cruce de Mendel: vuelve a aparecer el verde. Sale la proporción <b>3 amarillas : 1 verde</b>." :
      caso === "Aa × aa" ? "Es un <b>cruzamiento prueba</b>: sirve para saber si una planta amarilla es AA o Aa." : "Prueba otros cruces con los botones de cada planta.";
    C.panel('<span class="kicker">Las leyes de Mendel</span><h3>¿Cómo se heredan los caracteres?</h3>' +
      "<p>En el siglo XIX, <b>Gregor Mendel</b> cruzó plantas de guisante y descubrió cómo se transmiten los caracteres. Aquí vemos el color de la semilla:</p>" +
      '<ul class="lista"><li><b>A</b>: alelo amarillo, <b>dominante</b>.</li><li><b>a</b>: alelo verde, <b>recesivo</b> (solo se ve si no hay ninguna A).</li></ul>' +
      "<p>Cada planta tiene <b>dos alelos</b> y pasa <b>uno</b> a cada gameto (por la meiosis). En la fecundación se juntan un gameto de cada planta.</p>" +
      '<div class="caja recuerda"><b class="t">Este cruce</b>' + nota + "</div>" +
      '<h4>Prueba los cruces de Mendel</h4><p>1.º <b>AA × aa</b> (generación parental) → 2.º <b>Aa × Aa</b> (los hijos entre sí). Usa los botones de abajo.</p>' +
      '<div class="caja dato"><b class="t">¿Y la evolución?</b>La reproducción sexual <b>mezcla alelos</b> en cada generación: por eso los hijos son distintos entre sí. Sobre esa variedad actúa la <b>selección natural</b>.</div>');
  }

  function crear(cont) {
    var lz = C.el("div", { class: "lienzo" }); cont.appendChild(lz);
    raiz = C.el("div", { class: "herencia" }); lz.appendChild(raiz);
    barra = C.barra(cont);
    var g = barra.grupo();
    C.boton(g, "1.º AA × aa", function () { padres = ["AA", "aa"]; pintar(true); }, "", "Primer cruce de Mendel");
    C.boton(g, "2.º Aa × Aa", function () { padres = ["Aa", "Aa"]; pintar(true); }, "", "Segundo cruce de Mendel");
    C.boton(g, "Cruzar", function () { pintar(true); }, "verde", "Ver el cruce otra vez");
    var q = new URLSearchParams(location.search).get("p"); if (/^(AA|Aa|aa)-(AA|Aa|aa)$/.test(q || "")) padres = q.split("-");
  }
  return { crear: crear, mostrar: function () { pintar(false); C.alTick(null); } };
})();
