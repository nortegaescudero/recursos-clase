// Contenidos de la sección «La sangre»: componentes, fichas y textos de las animaciones.
var SANGRE = (function () {
  "use strict";
  var COMPONENTES = {
    plasma: { nombre: "Plasma", color: "#f2c94c", grupo: "Plasma",
      resumen: "La parte líquida de la sangre. Es amarillento.",
      ficha: "<p>Es la parte <b>líquida</b> de la sangre y supone más o menos el <b>55 %</b> de su volumen. Es de color amarillento y está formado sobre todo por <b>agua (90 %)</b>.</p>" +
        "<p>Lleva disueltas muchas sustancias: <b>nutrientes</b> (glucosa, aminoácidos…), <b>sales minerales</b>, <b>hormonas</b>, <b>desechos</b> como la urea, parte del <b>CO₂</b> y <b>proteínas</b> como el fibrinógeno (coagulación) o los anticuerpos (defensa).</p>",
      recuerda: "El plasma <b>transporta</b> casi todo lo que viaja por la sangre, menos el oxígeno, que va en los glóbulos rojos." },
    hematie: { nombre: "Glóbulos rojos", alias: "Hematíes o eritrocitos", color: "#e53935", grupo: "Células",
      resumen: "Transportan el oxígeno. Son los más abundantes.",
      ficha: "<p>Tienen forma de <b>disco hundido por el centro</b> (bicóncavo) y <b>no tienen núcleo</b>: así cabe más hemoglobina y pueden doblarse para pasar por los capilares.</p>" +
        "<p>Están llenos de <b>hemoglobina</b>, una proteína con hierro que atrapa el <b>oxígeno</b> en los pulmones y lo suelta en los tejidos. También llevan parte del <b>CO₂</b>.</p>",
      datos: { cuantos: "Unos 5 millones por mm³", tamano: "7–8 µm", vida: "Unos 120 días", forma: "Disco bicóncavo, sin núcleo" },
      recuerda: "Si hay pocos glóbulos rojos o poca hemoglobina, la persona tiene <b>anemia</b>: se cansa mucho porque a sus células les llega poco oxígeno." },
    neutrofilo: { nombre: "Neutrófilo", alias: "Glóbulo blanco fagocito", color: "#9b7fd1", grupo: "Glóbulos blancos",
      resumen: "Se come a los microbios (fagocitosis).",
      ficha: "<p>Es el <b>glóbulo blanco más abundante</b>. Su núcleo está dividido en <b>varios lóbulos</b>.</p>" +
        "<p>Es un <b>fagocito</b>: cuando detecta una bacteria, la rodea con unas prolongaciones (<b>pseudópodos</b>), la engulle y la digiere. Esto se llama <b>fagocitosis</b>.</p>",
      datos: { cuantos: "Más de la mitad de los glóbulos blancos", tamano: "10–12 µm", vida: "Unos días", forma: "Núcleo con varios lóbulos" },
      recuerda: "El pus de una herida infectada está formado, sobre todo, por neutrófilos que han luchado contra las bacterias." },
    linfocito: { nombre: "Linfocito", alias: "Glóbulo blanco", color: "#6a5acd", grupo: "Glóbulos blancos",
      resumen: "Fabrica anticuerpos contra los microbios.",
      ficha: "<p>Es un glóbulo blanco pequeño con un <b>núcleo grande y redondo</b> que lo ocupa casi todo.</p>" +
        "<p>Algunos linfocitos fabrican <b>anticuerpos</b>: proteínas que se pegan a los microbios y los marcan para que otros glóbulos blancos los destruyan. Otros atacan directamente a las células infectadas. Además, <b>recuerdan</b> a los microbios que ya conocen.</p>",
      datos: { cuantos: "Un 25–35 % de los glóbulos blancos", tamano: "7–10 µm", vida: "De días a años", forma: "Núcleo grande y redondo" },
      recuerda: "Las <b>vacunas</b> funcionan gracias a la memoria de los linfocitos." },
    monocito: { nombre: "Monocito", alias: "Glóbulo blanco", color: "#8e6bb8", grupo: "Glóbulos blancos",
      resumen: "El más grande. Se convierte en macrófago.",
      ficha: "<p>Es la <b>célula más grande</b> de la sangre. Su núcleo tiene forma de <b>riñón</b> o de herradura.</p>" +
        "<p>Cuando sale de la sangre y entra en los tejidos se transforma en <b>macrófago</b>, un fagocito enorme que se come microbios, células muertas y restos.</p>",
      datos: { cuantos: "Un 3–8 % de los glóbulos blancos", tamano: "15–20 µm", vida: "Meses (como macrófago)", forma: "Núcleo en forma de riñón" },
      recuerda: "Además de neutrófilos, linfocitos y monocitos, hay otros glóbulos blancos menos abundantes: los <b>eosinófilos</b> y los <b>basófilos</b>." },
    plaqueta: { nombre: "Plaquetas", alias: "Trombocitos", color: "#c38ad6", grupo: "Fragmentos",
      resumen: "Taponan las heridas (coagulación).",
      ficha: "<p>No son células completas, sino <b>pequeños fragmentos</b> de una célula grande de la médula ósea. No tienen núcleo.</p>" +
        "<p>Cuando se rompe un vaso sanguíneo, se pegan en la herida y forman un <b>tapón</b>. Después ayudan a formar una red de <b>fibrina</b> que atrapa glóbulos rojos: el <b>coágulo</b>.</p>",
      datos: { cuantos: "150 000 – 400 000 por mm³", tamano: "2–3 µm", vida: "Unos 10 días", forma: "Fragmentos sin núcleo" },
      recuerda: "La costra de una herida es un coágulo que se ha secado." }
  };

  var INTRO =
    '<span class="kicker">Un tejido líquido</span><h3>¿De qué está hecha la sangre?</h3>' +
    '<p>La sangre es un <b>tejido líquido</b>. Una persona adulta tiene unos <b>5 litros</b>. Está formada por:</p>' +
    '<ul class="lista"><li>El <b>plasma</b> (55 %): la parte líquida.</li><li>Las <b>células sanguíneas</b> (45 %): glóbulos rojos, glóbulos blancos y plaquetas.</li></ul>' +
    '<p>Todas las células de la sangre se fabrican en la <b>médula ósea roja</b>, dentro de algunos huesos (como el fémur, el esternón o la cadera).</p>' +
    '<div class="caja recuerda"><b class="t">Pruébalo</b>Pulsa en cualquier célula de la gota de sangre, o en la lista de abajo, para ver su ficha.</div>';

  var MODOS = {
    micro: { nombre: "Al microscopio", pasos: [{ t: 0, txt: "Una gota de sangre vista al microscopio. Pulsa en cualquier componente para ver qué es." }] },
    defensa: { nombre: "Defensa", dur: 15, pasos: [
      { t: 0, txt: "1 · Una bacteria ha entrado en la sangre a través de una herida." },
      { t: 3, txt: "2 · Un linfocito fabrica anticuerpos, que se pegan a la bacteria y la marcan." },
      { t: 6.5, txt: "3 · Un neutrófilo detecta la bacteria y la rodea con sus pseudópodos." },
      { t: 9.5, txt: "4 · La engulle y la digiere: esto es la fagocitosis." },
      { t: 13, txt: "¡Bacteria eliminada! Los glóbulos blancos nos defienden de las infecciones." }] },
    coagulacion: { nombre: "Coagulación", dur: 17, pasos: [
      { t: 0, txt: "1 · La sangre circula por dentro de un vaso sanguíneo." },
      { t: 2.5, txt: "2 · Se produce una herida: el vaso se rompe y empieza a salir sangre." },
      { t: 6, txt: "3 · Las plaquetas se pegan en la herida y forman un tapón." },
      { t: 10, txt: "4 · Se forma una red de fibrina que atrapa glóbulos rojos: es el coágulo." },
      { t: 14, txt: "¡Herida cerrada! La sangre ya no sale." }] },
    tubo: { nombre: "Tubo de sangre", dur: 9, pasos: [
      { t: 0, txt: "Un tubo con sangre recién sacada. A simple vista parece un líquido rojo y uniforme." },
      { t: 2, txt: "La centrifugadora gira muy deprisa y separa los componentes según lo que pesan…" },
      { t: 6, txt: "Abajo quedan las células rojas (45 %), en medio una capa fina de glóbulos blancos y plaquetas (menos del 1 %) y arriba el plasma (55 %)." }] }
  };

  var FICHAS_MODO = {
    defensa: '<span class="kicker">El sistema inmunitario</span><h3>Los glóbulos blancos nos defienden</h3>' +
      '<p>Los <b>glóbulos blancos</b> o <b>leucocitos</b> tienen núcleo, son más grandes que los glóbulos rojos y mucho menos abundantes (entre 5 000 y 10 000 por mm³).</p>' +
      '<ul class="lista"><li><b>Fagocitos</b> (neutrófilos y monocitos): se comen a los microbios. Es la <b>fagocitosis</b>.</li><li><b>Linfocitos</b>: fabrican <b>anticuerpos</b> que marcan a los microbios para destruirlos.</li></ul>' +
      '<div class="caja recuerda"><b class="t">Recuerda</b>Cuando tenemos una infección, aumenta el número de glóbulos blancos en la sangre. Por eso los análisis de sangre ayudan a detectarlas.</div>',
    coagulacion: '<span class="kicker">Taponar las heridas</span><h3>La coagulación</h3>' +
      '<p>Cuando se rompe un vaso sanguíneo, el cuerpo cierra la herida para no perder sangre:</p>' +
      '<ol class="lista"><li>El vaso se <b>contrae</b> para que salga menos sangre.</li><li>Las <b>plaquetas</b> se pegan en la herida y forman un <b>tapón</b>.</li><li>El fibrinógeno del plasma se convierte en hilos de <b>fibrina</b>, que forman una red y atrapan glóbulos rojos: el <b>coágulo</b>.</li></ol>' +
      '<div class="caja dato"><b class="t">¿Sabías que…?</b>Las personas con <b>hemofilia</b> tienen problemas de coagulación: sus heridas tardan mucho en dejar de sangrar.</div>',
    tubo: '<span class="kicker">Si separamos la sangre</span><h3>La sangre centrifugada</h3>' +
      '<p>Si metemos sangre en un tubo y la hacemos girar muy deprisa en una <b>centrifugadora</b>, sus componentes se separan en capas:</p>' +
      '<table class="tabla"><tr><th>Capa</th><th>Qué es</th><th>%</th></tr>' +
      '<tr><td>Arriba</td><td>Plasma (amarillento)</td><td>55 %</td></tr>' +
      '<tr><td>En medio</td><td>Glóbulos blancos y plaquetas (capa blanca muy fina)</td><td>&lt; 1 %</td></tr>' +
      '<tr><td>Abajo</td><td>Glóbulos rojos</td><td>45 %</td></tr></table>' +
      '<div class="caja recuerda"><b class="t">Recuerda</b>El porcentaje de glóbulos rojos se llama <b>hematocrito</b>. Se mira en los análisis de sangre.</div>'
  };

  return { COMPONENTES: COMPONENTES, INTRO: INTRO, MODOS: MODOS, FICHAS_MODO: FICHAS_MODO,
    ORDEN: ["plasma", "hematie", "neutrofilo", "linfocito", "monocito", "plaqueta"] };
})();
