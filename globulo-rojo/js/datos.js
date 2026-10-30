// Contenidos y recorrido del glóbulo rojo.
// Coordenadas de la maqueta: x = derecha de la pantalla, y = arriba, z = hacia quien mira.
// Como en los libros, el lado DERECHO del corazón se dibuja a la IZQUIERDA de la pantalla.
var DATOS = (function () {
  "use strict";

  // Cavidades del corazón: centro y radios del elipsoide
  var CAVIDADES = {
    AD: { c: [-1.05, 0.95, 0.15], r: [0.85, 0.75, 0.75], nombre: "Aurícula derecha", sangre: "co2" },
    VD: { c: [-0.85, -0.85, 0.30], r: [0.95, 1.15, 0.80], nombre: "Ventrículo derecho", sangre: "co2" },
    AI: { c: [1.05, 1.00, -0.25], r: [0.85, 0.75, 0.75], nombre: "Aurícula izquierda", sangre: "o2" },
    VI: { c: [0.85, -0.95, -0.05], r: [1.05, 1.35, 0.90], nombre: "Ventrículo izquierdo", sangre: "o2" }
  };
  var VALVULAS = {
    tricuspide: { p: [-0.95, 0.12, 0.22], normal: [0, 1, 0], nombre: "Válvula tricúspide" },
    pulmonar: { p: [-0.25, 0.62, 0.78], normal: [0.05, 1, 0.1], nombre: "Válvula pulmonar" },
    mitral: { p: [0.95, 0.10, -0.15], normal: [0, 1, 0], nombre: "Válvula mitral" },
    aortica: { p: [0.27, 0.62, 0.36], normal: [0, 1, 0], nombre: "Válvula aórtica" }
  };

  // Pasos de la ruta. puntos = camino del glóbulo en ese paso (el último punto de un paso es el primero del siguiente).
  // o2 = oxígeno al empezar y al terminar el paso (0 = poco, 1 = mucho). valvula = la que atraviesa.
  var PASOS = [
    { id: "ad", titulo: "Aurícula derecha", vaso: "Cavidad del corazón", circ: "general", o2: [0.15, 0.15],
      puntos: [[-1.4, 0.7, -0.3], [-1.15, 1.05, 0.1], [-0.95, 0.55, 0.25]],
      texto: "El glóbulo rojo vuelve al corazón por las <b>venas cavas</b>. Viene cargado de <b>dióxido de carbono (CO₂)</b> y con muy poco oxígeno. Entra en la <b>aurícula derecha</b>, la cavidad de arriba del lado derecho del corazón.",
      recuerda: "Las <b>aurículas</b> son las cavidades de arriba: <b>reciben</b> la sangre que llega al corazón." },
    { id: "tric", titulo: "Válvula tricúspide", vaso: "Válvula", circ: "general", o2: [0.15, 0.15], valvula: "tricuspide",
      puntos: [[-0.95, 0.55, 0.25], [-0.95, 0.12, 0.22], [-0.9, -0.6, 0.3]],
      texto: "La aurícula se contrae y empuja la sangre hacia abajo, al <b>ventrículo derecho</b>. Para pasar, el glóbulo atraviesa la <b>válvula tricúspide</b>.",
      recuerda: "Las <b>válvulas</b> son como puertas que solo se abren en un sentido: impiden que la sangre vuelva hacia atrás." },
    { id: "vd", titulo: "Ventrículo derecho", vaso: "Cavidad del corazón", circ: "pulmonar", o2: [0.15, 0.15], latido: "vd",
      puntos: [[-0.9, -0.6, 0.3], [-0.8, -1.25, 0.35], [-0.45, -0.7, 0.6], [-0.27, 0.35, 0.75]],
      texto: "El <b>ventrículo derecho</b> se contrae con fuerza (<b>sístole</b>) y lanza la sangre hacia los pulmones. Aquí empieza la <b>circulación pulmonar</b> o <b>menor</b>.",
      recuerda: "Los <b>ventrículos</b> son las cavidades de abajo: <b>impulsan</b> la sangre fuera del corazón." },
    { id: "ap", titulo: "Arteria pulmonar", vaso: "Arteria", circ: "pulmonar", o2: [0.15, 0.15], valvula: "pulmonar",
      puntos: [[-0.27, 0.35, 0.75], [-0.25, 0.62, 0.8], [-0.1, 2.2, 1.0], [-0.6, 3.2, 0.9], [-2.2, 4.0, 0.6], [-3.6, 4.55, 0.4]],
      texto: "Sale del corazón por la <b>válvula pulmonar</b> y viaja por la <b>arteria pulmonar</b> hacia los pulmones. Es una arteria porque <b>sale del corazón</b>, aunque lleve sangre pobre en oxígeno.",
      recuerda: "<b>Arteria</b> = sale del corazón. <b>Vena</b> = llega al corazón. No depende del oxígeno que lleve la sangre." },
    { id: "alv", titulo: "Capilares de los pulmones", vaso: "Capilar", circ: "pulmonar", o2: [0.15, 1], gases: "pulmon",
      puntos: [[-3.6, 4.55, 0.4], [-4.15, 5.3, 0.85], [-4.75, 5.65, 0.75], [-5.15, 5.0, 0.95], [-4.75, 4.45, 0.85], [-4.3, 4.15, 0.5]],
      texto: "La arteria se divide hasta formar <b>capilares</b> que rodean los <b>alvéolos</b>, unos saquitos llenos de aire. Aquí ocurre el <b>intercambio de gases</b>: el <b>CO₂</b> pasa de la sangre al alvéolo (y saldrá al espirar) y el <b>oxígeno</b> pasa del alvéolo a la sangre.",
      recuerda: "El glóbulo rojo atrapa el oxígeno gracias a la <b>hemoglobina</b>, la proteína que le da su color rojo.",
      dato: "Los capilares tienen una pared finísima, de una sola capa de células: por eso los gases pueden atravesarla." },
    { id: "vp", titulo: "Venas pulmonares", vaso: "Vena", circ: "pulmonar", o2: [1, 1],
      puntos: [[-4.3, 4.15, 0.5], [-3.4, 3.6, -0.5], [-1.2, 2.9, -1.1], [0.6, 2.2, -0.9], [1.0, 1.45, -0.5]],
      texto: "Ya cargado de oxígeno, el glóbulo rojo vuelve al corazón por las <b>venas pulmonares</b>. Son las únicas venas del cuerpo que llevan <b>sangre rica en oxígeno</b>.",
      recuerda: "Son venas porque <b>llegan al corazón</b>." },
    { id: "ai", titulo: "Aurícula izquierda", vaso: "Cavidad del corazón", circ: "pulmonar", o2: [1, 1],
      puntos: [[1.0, 1.45, -0.5], [1.1, 1.05, -0.25], [0.95, 0.5, -0.15]],
      texto: "Las venas pulmonares desembocan en la <b>aurícula izquierda</b>. Aquí termina la <b>circulación pulmonar</b>: la sangre ha ido del corazón a los pulmones y ha vuelto.",
      recuerda: "La sangre rica en oxígeno va siempre por el lado <b>izquierdo</b> del corazón, y la pobre por el <b>derecho</b>. Un tabique impide que se mezclen." },
    { id: "vi", titulo: "Válvula mitral y ventrículo izquierdo", vaso: "Cavidad del corazón", circ: "general", o2: [1, 1], valvula: "mitral", latido: "vi",
      puntos: [[0.95, 0.5, -0.15], [0.95, 0.10, -0.15], [0.9, -0.9, -0.05], [0.6, -1.6, 0.0]],
      texto: "La sangre baja por la <b>válvula mitral</b> (o bicúspide) al <b>ventrículo izquierdo</b>. Su pared es la más gruesa del corazón, porque tiene que impulsar la sangre a <b>todo el cuerpo</b>.",
      recuerda: "Tricúspide: entre aurícula y ventrículo <b>derechos</b>. Mitral: entre aurícula y ventrículo <b>izquierdos</b>." },
    { id: "ao", titulo: "Arteria aorta", vaso: "Arteria", circ: "general", o2: [1, 1], valvula: "aortica",
      puntos: [[0.6, -1.6, 0.0], [0.35, -0.6, 0.2], [0.27, 0.62, 0.36], [0.3, 2.4, 0.3], [0.9, 3.5, -0.4], [1.9, 3.0, -1.1], [2.1, 0.5, -1.3]],
      texto: "El ventrículo izquierdo se contrae y la sangre sale por la <b>válvula aórtica</b> hacia la <b>aorta</b>, la arteria más grande del cuerpo. Aquí empieza la <b>circulación general</b> o <b>mayor</b>.",
      recuerda: "La aorta forma un arco (el <b>cayado aórtico</b>) del que salen arterias hacia la cabeza y los brazos." },
    { id: "art", titulo: "Arterias y arteriolas", vaso: "Arteria", circ: "general", o2: [1, 1],
      puntos: [[2.1, 0.5, -1.3], [2.05, -3.5, -1.1], [1.8, -6.2, -0.6], [1.6, -7.3, 0.2]],
      texto: "La aorta se divide en <b>arterias</b> cada vez más pequeñas, las <b>arteriolas</b>, que llevan la sangre a todos los órganos. Las arterias tienen paredes gruesas y elásticas porque la sangre va con mucha presión.",
      recuerda: "Ese empujón de la sangre en las arterias es el <b>pulso</b>, que notamos en la muñeca o en el cuello." },
    { id: "cap", titulo: "Capilares de los tejidos", vaso: "Capilar", circ: "general", o2: [1, 0.15], gases: "tejido",
      puntos: [[1.6, -7.3, 0.2], [1.0, -7.85, 0.85], [0.3, -7.6, 0.3], [-0.4, -8.05, 0.85], [-1.1, -7.7, 0.3], [-1.7, -7.4, 0.4]],
      texto: "En los <b>capilares</b>, el glóbulo rojo entrega el <b>oxígeno</b> a las células, que lo usan para obtener energía (<b>respiración celular</b>). A cambio, la sangre recoge el <b>CO₂</b> y otros desechos. También se reparten los <b>nutrientes</b>.",
      recuerda: "Los capilares conectan las arterias con las venas. Por ellos los glóbulos rojos pasan <b>de uno en uno</b>.",
      dato: "Si pusiéramos en fila todos los vasos sanguíneos de una persona adulta, darían más de dos vueltas a la Tierra." },
    { id: "ven", titulo: "Venas y venas cavas", vaso: "Vena", circ: "general", o2: [0.15, 0.15],
      puntos: [[-1.7, -7.4, 0.4], [-2.0, -6.0, -0.6], [-1.9, -3.0, -0.9], [-1.6, 0.2, -0.6], [-1.4, 0.7, -0.3]],
      texto: "Los capilares se unen en <b>vénulas</b> y <b>venas</b>, que devuelven la sangre al corazón. La sangre va con poca presión, así que las venas tienen <b>válvulas</b> para que no retroceda. Por las <b>venas cavas</b> llega de nuevo a la aurícula derecha.",
      recuerda: "¡Vuelta completa! Un glóbulo rojo tarda <b>menos de un minuto</b> en recorrer todo el circuito." }
  ];

  // Qué pasos se ven en cada tipo de circulación
  var CIRCULACIONES = {
    completa: { nombre: "Completa", pasos: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] },
    pulmonar: { nombre: "Pulmonar (menor)", pasos: [2, 3, 4, 5, 6] },
    general: { nombre: "General (mayor)", pasos: [7, 8, 9, 10, 11, 0] }
  };

  var PARTES = [
    { id: "AD", color: "#3d6fd8", nombre: "Aurícula derecha", txt: "Recibe la sangre pobre en oxígeno que llega del cuerpo por las venas cavas." },
    { id: "VD", color: "#3d6fd8", nombre: "Ventrículo derecho", txt: "Impulsa la sangre pobre en oxígeno hacia los pulmones por la arteria pulmonar." },
    { id: "AI", color: "#e53935", nombre: "Aurícula izquierda", txt: "Recibe la sangre rica en oxígeno que llega de los pulmones por las venas pulmonares." },
    { id: "VI", color: "#e53935", nombre: "Ventrículo izquierdo", txt: "Impulsa la sangre rica en oxígeno a todo el cuerpo por la aorta. Tiene la pared más gruesa." },
    { id: "tricuspide", color: "#f2b705", nombre: "Válvula tricúspide", txt: "Entre la aurícula y el ventrículo derechos." },
    { id: "mitral", color: "#f2b705", nombre: "Válvula mitral (bicúspide)", txt: "Entre la aurícula y el ventrículo izquierdos." },
    { id: "pulmonar", color: "#f2b705", nombre: "Válvula pulmonar", txt: "A la salida del ventrículo derecho, hacia la arteria pulmonar." },
    { id: "aortica", color: "#f2b705", nombre: "Válvula aórtica", txt: "A la salida del ventrículo izquierdo, hacia la aorta." },
    { id: "tabique", color: "#c0392b", nombre: "Tabique", txt: "Pared que separa el lado derecho del izquierdo: la sangre rica y la pobre en oxígeno no se mezclan." }
  ];

  var FICHA_CIRCULACION =
    '<span class="kicker">Cómo es nuestra circulación</span><h3>Doble, cerrada y completa</h3>' +
    '<div class="caja"><b class="t">Doble</b>En cada vuelta, la sangre pasa <b>dos veces</b> por el corazón:' +
    '<ul class="lista"><li><b>Circulación pulmonar o menor:</b> ventrículo derecho → arteria pulmonar → pulmones → venas pulmonares → aurícula izquierda.</li>' +
    '<li><b>Circulación general o mayor:</b> ventrículo izquierdo → aorta → todo el cuerpo → venas cavas → aurícula derecha.</li></ul></div>' +
    '<div class="caja"><b class="t">Cerrada</b>La sangre va siempre <b>por dentro de los vasos sanguíneos</b>, nunca sale de ellos.</div>' +
    '<div class="caja"><b class="t">Completa</b>La sangre rica en oxígeno y la pobre en oxígeno <b>no se mezclan</b>, gracias al tabique del corazón.</div>' +
    '<h4>Los vasos sanguíneos</h4><table class="tabla"><tr><th></th><th>Arterias</th><th>Venas</th><th>Capilares</th></tr>' +
    '<tr><td><b>Sentido</b></td><td>Salen del corazón</td><td>Llegan al corazón</td><td>Unen arterias y venas</td></tr>' +
    '<tr><td><b>Pared</b></td><td>Gruesa y elástica</td><td>Más fina, con válvulas</td><td>Finísima (una capa)</td></tr>' +
    '<tr><td><b>Presión</b></td><td>Alta</td><td>Baja</td><td>Muy baja</td></tr></table>' +
    '<h4>El latido</h4><p><span class="etiq">Sístole</span> el músculo del corazón se <b>contrae</b> y empuja la sangre.<br><span class="etiq">Diástole</span> el corazón se <b>relaja</b> y sus cavidades se llenan.</p>' +
    '<div class="caja dato"><b class="t">¿Sangre azul?</b>En los dibujos la sangre pobre en oxígeno se pinta de azul para distinguirla, pero en realidad es de un <b>rojo más oscuro</b>.</div>';

  var FICHA_CORAZON_INTRO =
    '<span class="kicker">Un músculo del tamaño de tu puño</span><h3>Las partes del corazón</h3>' +
    '<p>El corazón tiene <b>cuatro cavidades</b>: dos aurículas arriba y dos ventrículos abajo. Pulsa en cada parte para verla en la maqueta.</p>' +
    '<div class="caja dato"><b class="t">¿Por qué la derecha está a la izquierda?</b>Dibujamos el corazón como si estuviera dentro de una persona que <b>te mira de frente</b>: su lado derecho queda a tu izquierda.</div>';

  return { CAVIDADES: CAVIDADES, VALVULAS: VALVULAS, PASOS: PASOS, CIRCULACIONES: CIRCULACIONES, PARTES: PARTES,
    FICHA_CIRCULACION: FICHA_CIRCULACION, FICHA_CORAZON_INTRO: FICHA_CORAZON_INTRO };
})();
