// Preguntas del juego. La primera opción de cada pregunta es la correcta (se barajan al mostrarlas).
var JUEGO = (function () {
  "use strict";
  // Ruta con preguntas: el glóbulo se para al final de estos pasos
  var RUTA = {
    ad: [
      { p: "¿Por qué vasos llega la sangre a la aurícula derecha?", o: ["Por las venas cavas", "Por las venas pulmonares", "Por la arteria aorta", "Por la arteria pulmonar"], e: "La sangre del cuerpo vuelve al corazón por las venas cavas (superior e inferior)." },
      { p: "¿Cómo es la sangre que entra en la aurícula derecha?", o: ["Pobre en oxígeno y rica en CO₂", "Rica en oxígeno", "Sin glóbulos rojos", "Sin nada de CO₂"], e: "Viene de los tejidos, donde ha dejado el oxígeno y ha recogido el CO₂." }],
    tric: [
      { p: "¿Para qué sirven las válvulas del corazón?", o: ["Para que la sangre no vuelva hacia atrás", "Para fabricar glóbulos rojos", "Para oxigenar la sangre", "Para separar el lado derecho del izquierdo"], e: "Las válvulas son como puertas que solo se abren en un sentido. Lo que separa los dos lados es el tabique." },
      { p: "¿Qué válvula hay entre la aurícula derecha y el ventrículo derecho?", o: ["La tricúspide", "La mitral", "La aórtica", "La pulmonar"], e: "Tricúspide en el lado derecho, mitral (bicúspide) en el izquierdo." }],
    vd: [
      { p: "¿Hacia dónde impulsa la sangre el ventrículo derecho?", o: ["Hacia los pulmones", "Hacia todo el cuerpo", "Hacia la aurícula izquierda", "Hacia el cerebro"], e: "El ventrículo derecho empieza la circulación pulmonar: manda la sangre a los pulmones." },
      { p: "¿Cómo se llama la contracción del músculo del corazón?", o: ["Sístole", "Diástole", "Fagocitosis", "Coagulación"], e: "Sístole = contracción. Diástole = relajación." }],
    ap: [
      { p: "La arteria pulmonar lleva sangre pobre en oxígeno. ¿Por qué es una arteria?", o: ["Porque sale del corazón", "Porque lleva la sangre al corazón", "Porque tiene válvulas", "Porque es la más fina"], e: "Arteria = sale del corazón; vena = llega al corazón. No depende del oxígeno que lleve." },
      { p: "¿Qué circulación empieza en el ventrículo derecho?", o: ["La pulmonar o menor", "La general o mayor", "La coronaria", "Ninguna"], e: "Pulmonar (menor): ventrículo derecho → pulmones → aurícula izquierda." }],
    alv: [
      { p: "¿Qué ocurre en los alvéolos de los pulmones?", o: ["La sangre suelta CO₂ y recoge oxígeno", "La sangre suelta oxígeno y recoge CO₂", "Se fabrican glóbulos rojos", "Se digieren los alimentos"], e: "Es el intercambio de gases: entra oxígeno en la sangre y sale el CO₂ al aire." },
      { p: "¿Qué sustancia del glóbulo rojo atrapa el oxígeno?", o: ["La hemoglobina", "La fibrina", "Los anticuerpos", "El plasma"], e: "La hemoglobina es una proteína con hierro que atrapa el oxígeno y le da el color rojo a la sangre." },
      { p: "¿Por qué los gases atraviesan fácilmente la pared de los capilares?", o: ["Porque es finísima, de una sola capa de células", "Porque tiene agujeros grandes", "Porque es gruesa y elástica", "Porque tiene válvulas"], e: "Los capilares tienen la pared más fina de todos los vasos sanguíneos." }],
    vp: [
      { p: "¿Qué tienen de especial las venas pulmonares?", o: ["Son las únicas venas con sangre rica en oxígeno", "Son las arterias más grandes", "Llevan la sangre a los pulmones", "No llegan al corazón"], e: "Son venas porque llegan al corazón, y llevan la sangre recién oxigenada en los pulmones." },
      { p: "¿A qué cavidad llegan las venas pulmonares?", o: ["A la aurícula izquierda", "A la aurícula derecha", "Al ventrículo izquierdo", "Al ventrículo derecho"], e: "Allí termina la circulación pulmonar." }],
    vi: [
      { p: "¿Qué cavidad del corazón tiene la pared más gruesa?", o: ["El ventrículo izquierdo", "El ventrículo derecho", "La aurícula derecha", "La aurícula izquierda"], e: "Tiene que impulsar la sangre a todo el cuerpo, así que necesita más músculo." },
      { p: "¿Qué válvula hay entre la aurícula izquierda y el ventrículo izquierdo?", o: ["La mitral o bicúspide", "La tricúspide", "La pulmonar", "La aórtica"], e: "Tricúspide en el lado derecho, mitral en el izquierdo." }],
    ao: [
      { p: "¿Cuál es la arteria más grande del cuerpo?", o: ["La aorta", "La arteria pulmonar", "La vena cava", "La carótida"], e: "La aorta sale del ventrículo izquierdo y reparte la sangre a todo el cuerpo." },
      { p: "¿Qué circulación empieza en el ventrículo izquierdo?", o: ["La general o mayor", "La pulmonar o menor", "La coronaria", "Ninguna"], e: "General (mayor): ventrículo izquierdo → todo el cuerpo → aurícula derecha." }],
    art: [
      { p: "¿Por qué notamos el pulso en la muñeca?", o: ["Por el empuje de la sangre en las arterias", "Por las válvulas de las venas", "Por el aire de los pulmones", "Por los músculos de la mano"], e: "Cada latido empuja la sangre con fuerza por las arterias: eso es el pulso." },
      { p: "¿Cómo son las paredes de las arterias?", o: ["Gruesas y elásticas", "Finísimas, de una sola capa", "Finas y con válvulas", "No tienen pared"], e: "Aguantan la presión alta con la que sale la sangre del corazón." }],
    cap: [
      { p: "En los capilares de los tejidos, ¿qué entrega el glóbulo rojo a las células?", o: ["Oxígeno", "Dióxido de carbono", "Urea", "Anticuerpos"], e: "Entrega el oxígeno y, a cambio, la sangre recoge el CO₂ y los desechos." },
      { p: "¿Para qué usan el oxígeno las células del cuerpo?", o: ["Para obtener energía (respiración celular)", "Para fabricar sangre", "Para expulsar el CO₂", "Para moverse por la sangre"], e: "En la respiración celular las células usan oxígeno y nutrientes para obtener energía." }],
    ven: [
      { p: "¿Por qué las venas tienen válvulas?", o: ["Para que la sangre no retroceda, porque va con poca presión", "Para oxigenar la sangre", "Para aumentar la presión", "Para atrapar bacterias"], e: "En las venas la sangre va despacio y con poca presión; las válvulas evitan que vuelva hacia atrás." },
      { p: "¿Cómo es nuestra circulación?", o: ["Doble, cerrada y completa", "Simple y abierta", "Doble y abierta", "Simple, cerrada e incompleta"], e: "Doble (pasa dos veces por el corazón), cerrada (siempre dentro de vasos) y completa (no se mezcla la sangre)." }]
  };

  // ¿Dónde estoy?: tramos que pueden salir y nombre de cada opción
  var DONDE = ["ad", "vd", "ap", "alv", "vp", "ai", "vi", "ao", "art", "cap", "ven"];

  // ¿Quién soy?: pistas sobre los componentes de la sangre
  var QUIEN = [
    { p: "No tengo núcleo, tengo forma de disco hundido y llevo el oxígeno.", r: "hematie" },
    { p: "Gracias a mi hemoglobina, la sangre es de color rojo.", r: "hematie" },
    { p: "No soy una célula completa y me pego en las heridas para taponarlas.", r: "plaqueta" },
    { p: "Si faltamos, una herida tarda muchísimo en dejar de sangrar.", r: "plaqueta" },
    { p: "Soy la parte líquida y amarillenta de la sangre. Llevo nutrientes, sales y hormonas.", r: "plasma" },
    { p: "Soy más o menos el 55 % de la sangre y casi todo yo soy agua.", r: "plasma" },
    { p: "Tengo el núcleo dividido en varios lóbulos y me como a las bacterias.", r: "neutrofilo" },
    { p: "Soy el glóbulo blanco más abundante. El pus de las heridas infectadas está lleno de nosotros.", r: "neutrofilo" },
    { p: "Fabrico anticuerpos y recuerdo a los microbios que ya conozco.", r: "linfocito" },
    { p: "Las vacunas funcionan gracias a mi memoria.", r: "linfocito" },
    { p: "Soy la célula más grande de la sangre y en los tejidos me convierto en macrófago.", r: "monocito" },
    { p: "Mi núcleo tiene forma de riñón y soy un gran fagocito.", r: "monocito" }
  ];

  var TIPOS = {
    ruta: { nombre: "Ruta con preguntas", desc: "El glóbulo rojo recorre el circuito y se para en los puntos clave para hacer una pregunta." },
    donde: { nombre: "¿Dónde estoy?", desc: "Sin nombres en la maqueta: mirad el recorrido y el color del glóbulo y adivinad dónde está. 6 rondas." },
    quien: { nombre: "¿Quién soy?", desc: "Adivinad qué componente de la sangre da cada pista. 8 rondas." }
  };

  return { RUTA: RUTA, DONDE: DONDE, QUIEN: QUIEN, TIPOS: TIPOS, EQUIPOS: ["Equipo Estrella", "Equipo Rayo"] };
})();
