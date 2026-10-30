/* =====================================================================
   LISTA DE RECURSOS DEL PORTAL
   ---------------------------------------------------------------------
   Para añadir un recurso nuevo: copia un bloque { ... } entero, pégalo
   al final de la lista (separado por una coma) y cambia sus datos.

   Campos de cada recurso:
     titulo       Nombre que aparece en la tarjeta.
     descripcion  Una o dos frases.
     tema         Bloque o unidad. Los filtros de arriba salen de aquí.
     tipo         Web 3D, Juego, Vídeo, Ejercicios...
     icono        Un emoji.
     color        Color de la cabecera de la tarjeta.
     visible      true = se ve / false = oculto (sin borrarlo).
     enlaces      Botones de la tarjeta. Cada uno con:
                    texto    Lo que pone el botón.
                    url      La dirección de la web.
                    secreto  true = antes pasa por la imagen secreta.
                    video    En lugar de url: un vídeo de la carpeta videos/
                             (se abre en un reproductor dentro del portal).
   ===================================================================== */

var PORTAL = {
  titulo: "Recursos de clase",
  subtitulo: "Webs, juegos y simulaciones para trabajar en el aula"
};

var RECURSOS = [
  {
    titulo: "Camiones y palés 3D",
    descripcion: "Carga camiones y contenedores con palés en 3D y comprueba cómo se aprovecha el espacio.",
    tema: "Transporte",
    tipo: "Web 3D",
    icono: "🚚",
    color: "#2E7D6B",
    visible: true,
    enlaces: [
      { texto: "Abrir", url: "https://nortegaescudero.github.io/camiones_3D/" }
    ]
  },
  {
    titulo: "Ruta Incoterms 2020",
    descripcion: "Recorre en 3D el camino de la mercancía y descubre qué asume el vendedor y el comprador en cada Incoterm.",
    tema: "Comercio internacional",
    tipo: "Web 3D",
    icono: "🌍",
    color: "#2F5D9E",
    visible: true,
    enlaces: [
      { texto: "Abrir", url: "https://nortegaescudero.github.io/incoterms-2020-3d/" }
    ]
  },
  {
    titulo: "Nico Battle",
    descripcion: "Juego multijugador de preguntas. El profesor crea la partida y los alumnos se unen desde su móvil u ordenador.",
    tema: "Comercio internacional",
    tipo: "Juego",
    icono: "🎮",
    color: "#8E2C48",
    visible: true,
    enlaces: [
      { texto: "Jugar (alumnos)", url: "https://nortegaescudero.github.io/incoterms-battle/" },
      { texto: "📄 Cómo se juega (PDF)", url: "pdf/Como_se_juega_Nico_Battle.pdf" },
      { texto: "▶ Vídeo promocional", video: "videos/promo_nico_battle.mp4" },
      { texto: "Profesor", url: "https://nortegaescudero.github.io/incoterms-battle/profesor.html", secreto: true }
    ]
  },
  {
    titulo: "Cambio en caja",
    descripcion: "Llena la cesta en una tienda de barrio, cobra con billetes y monedas y calcula el cambio que hay que devolver.",
    tema: "Operaciones de caja",
    tipo: "Simulador",
    icono: "🛒",
    color: "#0D6A51",
    visible: true,
    enlaces: [
      { texto: "Abrir", url: "cambio-en-caja/" }
    ]
  }
];

/* Imagen secreta: los enlaces con "secreto: true" muestran esta imagen y
   solo continúan si se pincha dentro de la zona (en % de la imagen).
   Ahora mismo la zona son las zapatillas azules de la zapatería. */
var ACCESO_SECRETO = {
  imagen: "img/la-rioja.jpg",
  zona: { x: 92.9, y: 82.6, ancho: 5.7, alto: 7.3 }
};
