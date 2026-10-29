(function () {
  var visibles = RECURSOS.filter(function (r) { return r.visible !== false; });
  var temaActivo = "Todos";

  document.getElementById("titulo").textContent = PORTAL.titulo;
  document.getElementById("subtitulo").textContent = PORTAL.subtitulo;
  document.title = PORTAL.titulo;

  // Filtros: un botón por cada tema que aparezca en la lista
  var temas = ["Todos"];
  visibles.forEach(function (r) {
    if (r.tema && temas.indexOf(r.tema) === -1) temas.push(r.tema);
  });

  var filtros = document.getElementById("filtros");
  temas.forEach(function (tema) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "filtro";
    b.textContent = tema;
    b.setAttribute("aria-pressed", tema === temaActivo);
    b.onclick = function () {
      temaActivo = tema;
      Array.prototype.forEach.call(filtros.children, function (x) {
        x.setAttribute("aria-pressed", x.textContent === tema);
      });
      pintar();
    };
    filtros.appendChild(b);
  });

  document.getElementById("buscador").addEventListener("input", pintar);

  function normalizar(t) {
    return (t || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  }

  function crearTarjeta(r) {
    var art = document.createElement("article");
    art.className = "tarjeta";

    var cab = document.createElement("div");
    cab.className = "tarjeta-cab";
    cab.style.background = r.color || "#555";
    cab.innerHTML = '<span class="icono" aria-hidden="true"></span><span class="tipo"></span>';
    cab.querySelector(".icono").textContent = r.icono || "📘";
    cab.querySelector(".tipo").textContent = r.tipo || "";
    art.appendChild(cab);

    var cuerpo = document.createElement("div");
    cuerpo.className = "tarjeta-cuerpo";
    cuerpo.innerHTML = '<p class="tema"></p><h2></h2><p class="desc"></p><div class="botones"></div>';
    cuerpo.querySelector(".tema").textContent = r.tema || "";
    cuerpo.querySelector("h2").textContent = r.titulo;
    cuerpo.querySelector(".desc").textContent = r.descripcion || "";

    var botones = cuerpo.querySelector(".botones");
    var indice = RECURSOS.indexOf(r);
    (r.enlaces || []).forEach(function (e, i) {
      var a = document.createElement("a");
      a.className = "boton" + (i > 0 ? " secundario" : "");
      a.textContent = e.texto;
      if (e.video) {
        a.href = e.video;
        a.onclick = function (ev) { ev.preventDefault(); abrirVideo(e.video, r.titulo + " · " + e.texto.replace("▶", "").trim()); };
      } else if (e.secreto) {
        // El enlace real no aparece en la página: pasa por la imagen secreta
        a.href = "acceso.html?r=" + indice + "&e=" + i;
      } else {
        a.href = e.url;
        a.target = "_blank";
        a.rel = "noopener";
      }
      botones.appendChild(a);
    });

    art.appendChild(cuerpo);
    return art;
  }

  // Reproductor de vídeo
  var dialogo = document.getElementById("reproductor");
  var video = document.getElementById("video");
  function abrirVideo(src, titulo) {
    document.getElementById("video-titulo").textContent = titulo;
    video.src = src;
    dialogo.showModal();
    video.play().catch(function () {});
  }
  document.getElementById("cerrar-video").onclick = function () { dialogo.close(); };
  dialogo.addEventListener("click", function (ev) { if (ev.target === dialogo) dialogo.close(); });
  dialogo.addEventListener("close", function () { video.pause(); video.removeAttribute("src"); video.load(); });

  function pintar() {
    var texto = normalizar(document.getElementById("buscador").value);
    var rejilla = document.getElementById("rejilla");
    rejilla.innerHTML = "";

    var lista = visibles.filter(function (r) {
      if (temaActivo !== "Todos" && r.tema !== temaActivo) return false;
      if (!texto) return true;
      return normalizar(r.titulo + " " + r.descripcion + " " + r.tema + " " + r.tipo).indexOf(texto) !== -1;
    });

    lista.forEach(function (r) { rejilla.appendChild(crearTarjeta(r)); });
    document.getElementById("vacio").hidden = lista.length > 0;
  }

  pintar();
})();
