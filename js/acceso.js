(function () {
  var params = new URLSearchParams(location.search);
  var recurso = RECURSOS[parseInt(params.get("r"), 10)];
  var enlace = recurso && recurso.enlaces && recurso.enlaces[parseInt(params.get("e"), 10)];

  var marco = document.getElementById("marco");
  var imagen = document.getElementById("imagen");

  function mostrarError() {
    marco.hidden = true;
    document.getElementById("error").hidden = false;
  }

  if (!enlace || !enlace.secreto) { mostrarError(); return; }

  imagen.src = ACCESO_SECRETO.imagen;

  // Un único intento: si se falla, hay que volver a empezar desde el portal
  imagen.addEventListener("click", function (ev) {
    var caja = imagen.getBoundingClientRect();
    var x = (ev.clientX - caja.left) / caja.width * 100;
    var y = (ev.clientY - caja.top) / caja.height * 100;
    var z = ACCESO_SECRETO.zona;

    if (x >= z.x && x <= z.x + z.ancho && y >= z.y && y <= z.y + z.alto) {
      location.replace(enlace.url);
    } else {
      mostrarError();
    }
  });
})();
