// Maqueta 3D: corazón (4 cavidades, tabique y válvulas), pulmones con alvéolos, tejidos del cuerpo,
// vasos sanguíneos y el glóbulo rojo que recorre el circuito.
var Escena = (function () {
  "use strict";
  var V = function (a) { return new THREE.Vector3(a[0], a[1], a[2]); };
  var ROJO = new THREE.Color("#e53935"), AZUL = new THREE.Color("#3d6fd8");
  var renderer, scene, camera, canvas, labelsEl, reloj = new THREE.Clock();
  var cam = { theta: 0.3, phi: 1.3, r: 33, rGoal: 11, target: new THREE.Vector3(), targetGoal: new THREE.Vector3() };
  var corazon = {}, valvulas = {}, curvas = [], longitudes = [], celula, gases = [], etiquetas = [], resaltado = null;
  var alHacerTick = null, alLatido = null, latidoPrevio = 0;
  var capas = { vasos: [], pulmones: [] };   // se aclaran al acercarse al corazón o a los alvéolos

  // ---------- utilidades ----------
  function mat(color, opac, extra) {
    var m = new THREE.MeshStandardMaterial(Object.assign({ color: color, roughness: 0.55, metalness: 0.0 }, extra || {}));
    if (opac < 1) { m.transparent = true; m.opacity = opac; m.depthWrite = false; }
    return m;
  }
  function curva(puntos) { return new THREE.CatmullRomCurve3(puntos.map(V), false, "catmullrom", 0.4); }
  function tubo(c, radio, color, opac, degradado) {
    var g = new THREE.TubeGeometry(c, Math.max(24, Math.round(c.getLength() * 14)), radio, 14, false);
    var m;
    if (degradado) {   // color a lo largo del tubo (capilares: de un color a otro)
      var n = g.attributes.position.count, cols = new Float32Array(n * 3), seg = g.parameters.tubularSegments, rad = g.parameters.radialSegments;
      for (var i = 0; i <= seg; i++) for (var j = 0; j <= rad; j++) {
        var k = i * (rad + 1) + j, col = degradado[0].clone().lerp(degradado[1], i / seg);
        if (k < n) { cols[k * 3] = col.r; cols[k * 3 + 1] = col.g; cols[k * 3 + 2] = col.b; }
      }
      g.setAttribute("color", new THREE.BufferAttribute(cols, 3));
      m = mat(0xffffff, opac, { vertexColors: true });
    } else m = mat(color, opac);
    var t = new THREE.Mesh(g, m); scene.add(t);
    if (radio >= 0.26) { m.userData.opac = opac; capas.vasos.push(m); }
    return t;
  }
  function elipsoide(c, r, material, seg) {
    var m = new THREE.Mesh(new THREE.SphereGeometry(1, seg || 32, Math.round((seg || 32) * 0.75)), material);
    m.position.copy(V(c)); m.scale.set(r[0], r[1], r[2]); scene.add(m); return m;
  }
  function etiqueta(texto, pos, clase, ref) {
    var d = document.createElement("div"); d.className = "lab " + (clase || ""); d.textContent = texto;
    labelsEl.appendChild(d);
    var e = { el: d, pos: pos.clone ? pos.clone() : V(pos), ref: ref || null };
    etiquetas.push(e); return e;
  }

  // ---------- corazón ----------
  function crearCorazon() {
    // envoltura con forma de corazón (esfera deformada, con la punta abajo y algo hacia la derecha de la pantalla)
    var g = new THREE.SphereGeometry(1, 48, 36), p = g.attributes.position;
    for (var i = 0; i < p.count; i++) {
      var x = p.getX(i), y = p.getY(i), z = p.getZ(i);
      if (y < 0) { var k = 1 - 0.6 * Math.pow(-y, 1.5); x *= k; z *= k; x += 0.3 * y * y; y *= 1.25; }
      else { y -= 0.18 * Math.exp(-(x * x) / 0.05) * y; }
      p.setXYZ(i, x * 2.2, y * 2.25, z * 1.55);
    }
    g.computeVertexNormals();
    corazon.envoltura = new THREE.Mesh(g, mat("#d9534f", 0.17, { side: THREE.DoubleSide, emissive: "#4a0c0c", emissiveIntensity: 0.25 }));
    corazon.envoltura.position.set(0, -0.15, 0); scene.add(corazon.envoltura);
    // cavidades
    corazon.cav = {};
    Object.keys(DATOS.CAVIDADES).forEach(function (k) {
      var c = DATOS.CAVIDADES[k], col = c.sangre === "o2" ? "#f08a87" : "#8fa9ee";
      var m = elipsoide(c.c, c.r, mat(col, 0.42, { emissive: c.sangre === "o2" ? "#5a1010" : "#10205a", emissiveIntensity: 0.2 }));
      m.userData.base = c.r.slice(); m.userData.colorBase = new THREE.Color(col); corazon.cav[k] = m;
      etiqueta(c.nombre, V(c.c).add(new THREE.Vector3(c.c[0] < 0 ? -1.15 : 1.15, 0, 0.4)), c.sangre, m);
    });
    // pared más gruesa del ventrículo izquierdo (capa de músculo por fuera)
    var vi = DATOS.CAVIDADES.VI;
    corazon.musculoVI = elipsoide(vi.c, [vi.r[0] * 1.22, vi.r[1] * 1.1, vi.r[2] * 1.2], mat("#b23a35", 0.22, { side: THREE.BackSide }));
    // tabique
    corazon.tabique = new THREE.Mesh(new THREE.BoxGeometry(0.16, 3.6, 1.5), mat("#b03a2e", 0.55));
    corazon.tabique.position.set(0, -0.15, 0.05); scene.add(corazon.tabique);
    etiqueta("Tabique", new THREE.Vector3(0, -2.15, 0.9), "suave", corazon.tabique);
    // válvulas: un aro amarillo y dos hojas que se abren
    Object.keys(DATOS.VALVULAS).forEach(function (k) {
      var v = DATOS.VALVULAS[k], grupo = new THREE.Group();
      var aro = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.045, 10, 32), mat("#f2b705", 1, { emissive: "#5a4500", emissiveIntensity: 0.3 }));
      grupo.add(aro);
      var hojas = [0, 1].map(function (s) {
        var piv = new THREE.Group(), h = new THREE.Mesh(new THREE.CircleGeometry(0.24, 20, 0, Math.PI), mat("#ffd54a", 0.85, { side: THREE.DoubleSide }));
        h.rotation.z = s ? Math.PI : 0; piv.add(h); grupo.add(piv); return piv;
      });
      grupo.position.copy(V(v.p));
      grupo.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), V(v.normal).normalize());
      scene.add(grupo); valvulas[k] = { grupo: grupo, hojas: hojas, abierta: 0, objetivo: 0, aro: aro };
      var off = { tricuspide: [-1.35, -0.15, 0.4], mitral: [1.3, -0.15, 0.4], pulmonar: [-0.9, 0.75, 0.5], aortica: [0.95, 0.7, 0.5] }[k];
      etiqueta(v.nombre, V(v.p).add(V(off)), "suave", grupo);
    });
  }

  // ---------- pulmones, tráquea y alvéolos ----------
  function crearPulmones() {
    [-1, 1].forEach(function (lado) {
      var g = new THREE.SphereGeometry(1, 36, 28), p = g.attributes.position;
      for (var i = 0; i < p.count; i++) {
        var x = p.getX(i), y = p.getY(i), z = p.getZ(i);
        var k = y > 0 ? 1 - 0.35 * y * y : 1; x *= k; z *= k;
        if (x * -lado > 0.2) x *= 0.75;   // cara interior más plana (hacia el corazón)
        p.setXYZ(i, x * 2.0, y * 2.9, z * 1.5);
      }
      g.computeVertexNormals();
      var m = new THREE.Mesh(g, mat("#f08aa0", 0.4, { side: THREE.DoubleSide, emissive: "#5a1a2a", emissiveIntensity: 0.2 }));
      m.position.set(4.6 * lado, 4.9, -0.6); scene.add(m); m.material.userData.opac = 0.4; capas.pulmones.push(m.material);
    });
    etiqueta("Pulmón", new THREE.Vector3(-4.6, 7.4, -0.4), "", null);
    etiqueta("Pulmón", new THREE.Vector3(4.6, 7.4, -0.4), "", null);
    // tráquea y bronquios
    var blanco = mat("#f7dfe4", 0.9);
    var traq = new THREE.CatmullRomCurve3([V([0, 10.2, -0.9]), V([0, 7.4, -0.9])]);
    scene.add(new THREE.Mesh(new THREE.TubeGeometry(traq, 12, 0.32, 14, false), blanco));
    for (var y = 7.6; y < 10.1; y += 0.32) { var aro = new THREE.Mesh(new THREE.TorusGeometry(0.33, 0.05, 8, 24), mat("#e8c4cc", 1)); aro.position.set(0, y, -0.9); aro.rotation.x = Math.PI / 2; scene.add(aro); }
    etiqueta("Tráquea", new THREE.Vector3(0.9, 9.4, -0.9), "suave", null);
    [-1, 1].forEach(function (lado) {
      var b = curva([[0, 7.45, -0.9], [1.6 * lado, 6.6, -0.7], [3.4 * lado, 6.0, -0.2], [4.65 * lado, 5.85, 0.45]]);
      scene.add(new THREE.Mesh(new THREE.TubeGeometry(b, 30, 0.17, 10, false), blanco));
    });
    etiqueta("Bronquio", new THREE.Vector3(-2.3, 6.75, -0.3), "suave", null);
    // racimo de alvéolos donde ocurre el intercambio
    var cA = new THREE.Vector3(-4.65, 5.05, 0.55), alv = mat("#ffd1dc", 0.42, { emissive: "#5a1a2a", emissiveIntensity: 0.1 });
    [[0, 0, 0], [0.42, 0.25, 0.05], [-0.42, 0.22, 0], [0.1, 0.55, -0.1], [0.3, -0.38, 0.1], [-0.32, -0.36, 0.05], [0, 0.05, 0.42]].forEach(function (o) {
      var s = new THREE.Mesh(new THREE.SphereGeometry(0.33, 20, 16), alv); s.position.copy(cA).add(V(o)); scene.add(s);
    });
    corazon.alveolos = cA;
    etiqueta("Alvéolos", cA.clone().add(new THREE.Vector3(-0.2, -1.3, 0.5)), "foco", null);
  }

  // ---------- tejidos del cuerpo ----------
  function crearTejido() {
    var base = new THREE.Mesh(new THREE.BoxGeometry(6.8, 0.9, 3.4), mat("#f0b493", 0.85));
    base.position.set(0, -8.85, 0.25); scene.add(base);
    var celMat = mat("#f9cfae", 0.95), nucMat = mat("#b5654a", 1);
    corazon.celulas = [];
    [-1.45, -0.75, -0.05, 0.65, 1.35].forEach(function (x, i) {
      [-0.4, 1.5].forEach(function (z, j) {
        var c = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 14), celMat);
        c.scale.set(0.38, 0.3, 0.42); c.position.set(x + (j ? 0.25 : 0), -7.95, z); scene.add(c);
        var n = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 10), nucMat); n.position.copy(c.position).add(new THREE.Vector3(0, 0.12, 0)); scene.add(n);
        corazon.celulas.push(c.position.clone());
      });
    });
    etiqueta("Células del cuerpo (músculos, órganos…)", new THREE.Vector3(0, -9.9, 1.4), "", null);
  }

  // ---------- vasos sanguíneos y recorrido ----------
  function crearVasos() {
    var P = DATOS.PASOS;
    curvas = P.map(function (p) { return curva(p.puntos); });
    longitudes = curvas.map(function (c) { return c.getLength(); });
    var trozo = function (i, desde) { return P[i].puntos.slice(desde || 0); };
    // circulación pulmonar
    var ap = curva(trozo(3, 1)); tubo(ap, 0.3, AZUL, 0.38);
    var apDer = curva([[-0.35, 2.9, 1.0], [1.5, 3.95, 1.1], [3.6, 4.55, 0.4]]); tubo(apDer, 0.26, AZUL, 0.38);
    tubo(curvas[4], 0.2, null, 0.5, [AZUL, ROJO]);
    var capDer = curva([[3.6, 4.55, 0.4], [4.4, 5.4, 0.7], [4.9, 4.7, 0.8], [4.3, 4.15, 0.5]]); tubo(capDer, 0.18, null, 0.45, [AZUL, ROJO]);
    tubo(curvas[5], 0.3, ROJO, 0.38);
    var vpDer = curva([[4.3, 4.15, 0.5], [3.0, 3.4, -0.6], [1.6, 2.0, -0.75], [1.05, 1.5, -0.5]]); tubo(vpDer, 0.28, ROJO, 0.38);
    // circulación general
    var ao = curva(trozo(8, 2).concat(trozo(9, 1))); tubo(ao, 0.38, ROJO, 0.38);
    var cabeza = curva([[0.9, 3.5, -0.4], [0.85, 5.2, -0.55], [0.7, 6.8, -0.6]]); tubo(cabeza, 0.17, ROJO, 0.45);
    tubo(curvas[10], 0.2, null, 0.5, [ROJO, AZUL]);
    var vci = curva(trozo(11)); tubo(vci, 0.36, AZUL, 0.38);
    var vcs = curva([[-1.3, 6.8, -0.4], [-1.4, 3.2, -0.35], [-1.2, 1.7, -0.05]]); tubo(vcs, 0.3, AZUL, 0.38);
    // nombres de los vasos
    etiqueta("Arteria pulmonar", ap.getPointAt(0.6).add(new THREE.Vector3(0.2, 0.55, 0.3)), "co2", null);
    etiqueta("Venas pulmonares", curvas[5].getPointAt(0.45).add(new THREE.Vector3(0, -0.6, 0)), "o2", null);
    etiqueta("Aorta", new THREE.Vector3(1.0, 4.1, -0.4), "o2", null);
    etiqueta("Arterias", curvas[9].getPointAt(0.45).add(new THREE.Vector3(1.0, 0, 0)), "o2", null);
    etiqueta("Venas cavas", curvas[11].getPointAt(0.45).add(new THREE.Vector3(-1.2, 0, 0)), "co2", null);
    etiqueta("Capilares", curvas[10].getPointAt(0.5).add(new THREE.Vector3(0, 0.75, 0.4)), "foco", null);
    etiqueta("Hacia la cabeza", new THREE.Vector3(0.75, 7.3, -0.6), "suave", null);
    etiqueta("De la cabeza", new THREE.Vector3(-1.35, 7.3, -0.4), "suave", null);
  }

  // ---------- glóbulo rojo (disco bicóncavo) ----------
  function crearCelula() {
    var R = 0.24, pts = [], N = 24, i, r, h;
    function grosor(r) { var u = r / R; return R * Math.sqrt(Math.max(0, 1 - u * u)) * (0.207 + 2.003 * u * u - 1.123 * u * u * u * u) * 0.5; }
    for (i = 0; i <= N; i++) { r = R * i / N; pts.push(new THREE.Vector2(r, -grosor(r))); }
    for (i = N; i >= 0; i--) { r = R * i / N; pts.push(new THREE.Vector2(r, grosor(r))); }
    var g = new THREE.LatheGeometry(pts, 40);
    celula = new THREE.Group();
    var m = new THREE.Mesh(g, mat("#e53935", 1, { roughness: 0.35, emissive: "#3a0505", emissiveIntensity: 0.4 }));
    m.scale.setScalar(1.25); celula.add(m); celula.userData.mesh = m;
    // halo para verlo bien dentro de los vasos
    var halo = new THREE.Mesh(new THREE.SphereGeometry(0.42, 20, 16), new THREE.MeshBasicMaterial({ color: "#fff2a8", transparent: true, opacity: 0.28, depthWrite: false }));
    celula.add(halo);
    scene.add(celula);
    etiqueta("Glóbulo rojo", new THREE.Vector3(), "foco celula", celula);
  }

  // ---------- gases (O₂ y CO₂) ----------
  function crearGases() {
    var mO2 = new THREE.MeshStandardMaterial({ color: "#ff4d2e", emissive: "#661100", emissiveIntensity: 0.6 });
    var mCO2 = new THREE.MeshStandardMaterial({ color: "#8d93a3", emissive: "#222", emissiveIntensity: 0.3 });
    for (var i = 0; i < 16; i++) {
      var o2 = i % 2 === 0, s = new THREE.Mesh(new THREE.SphereGeometry(o2 ? 0.1 : 0.12, 14, 12), o2 ? mO2 : mCO2);
      s.visible = false; s.userData = { o2: o2, fase: (i >> 1) / 8 }; scene.add(s); gases.push(s);
    }
    gases.etO2 = etiqueta("O₂", new THREE.Vector3(), "gas o2", null);
    gases.etCO2 = etiqueta("CO₂", new THREE.Vector3(), "gas co2", null);
  }

  // ---------- cámara ----------
  function controles() {
    var punteros = new Map(), pinch0 = 0, r0 = 0;
    canvas.addEventListener("pointerdown", function (e) { try { canvas.setPointerCapture(e.pointerId); } catch (_) {} punteros.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (punteros.size === 2) { var a = Array.from(punteros.values()); pinch0 = Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y); r0 = cam.rGoal; } });
    canvas.addEventListener("pointermove", function (e) {
      var p = punteros.get(e.pointerId); if (!p) return;
      if (punteros.size === 2) { p.x = e.clientX; p.y = e.clientY; var a = Array.from(punteros.values()); var d = Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y); cam.rGoal = Math.min(40, Math.max(2.5, r0 * pinch0 / d)); return; }
      cam.theta -= (e.clientX - p.x) * 0.006; cam.phi = Math.min(2.9, Math.max(0.25, cam.phi - (e.clientY - p.y) * 0.006));
      p.x = e.clientX; p.y = e.clientY;
    });
    ["pointerup", "pointercancel"].forEach(function (t) { canvas.addEventListener(t, function (e) { punteros.delete(e.pointerId); }); });
    canvas.addEventListener("wheel", function (e) { e.preventDefault(); cam.rGoal = Math.min(40, Math.max(2.5, cam.rGoal * (1 + Math.sign(e.deltaY) * 0.12))); }, { passive: false });
  }
  function vista(tipo) {
    if (tipo === "todo") { cam.targetGoal.set(0, -0.3, 0); cam.rGoal = 33; cam.theta = 0.25; cam.phi = 1.45; }
    else cam.rGoal = estado.zoom;
  }

  // ---------- posición en la ruta ----------
  function posicion(paso, t) { return curvas[paso].getPointAt(Math.min(1, Math.max(0, t))); }
  function tangente(paso, t) { return curvas[paso].getTangentAt(Math.min(0.999, Math.max(0.001, t))); }

  // ---------- bucle ----------
  var estado = { paso: 0, t: 0, o2: 0.15, seguir: true, gases: null, gasT: 0, zoom: 11, zona: null };
  function actualizar(dt, ahora) {
    // latido (unos 70 por minuto): primero se contraen las aurículas y luego los ventrículos
    var fase = (ahora / 0.86) % 1, aur = fase < 0.15 ? Math.sin(fase / 0.15 * Math.PI) : 0, ven = fase >= 0.15 && fase < 0.45 ? Math.sin((fase - 0.15) / 0.3 * Math.PI) : 0;
    if (alLatido && ((fase >= 0.15 && latidoPrevio < 0.15) || (fase >= 0.45 && latidoPrevio < 0.45))) alLatido(fase < 0.3 ? 1 : 2);
    latidoPrevio = fase;
    Object.keys(corazon.cav).forEach(function (k) {
      var m = corazon.cav[k], b = m.userData.base, s = 1 - 0.07 * (k[0] === "A" ? aur : ven);
      m.scale.set(b[0] * s, b[1] * s, b[2] * s);
      var on = resaltado === k; m.material.emissiveIntensity = on ? 0.9 : 0.2; m.material.opacity = on ? 0.75 : 0.42;
    });
    corazon.envoltura.scale.setScalar(1 - 0.025 * ven);
    corazon.tabique.material.opacity = resaltado === "tabique" ? 0.95 : 0.55;
    // válvulas: se abren cuando pasa el glóbulo
    var pc = celula.position;
    Object.keys(valvulas).forEach(function (k) {
      var v = valvulas[k], d = pc.distanceTo(v.grupo.position);
      v.objetivo = d < 0.75 ? 1 : 0; v.abierta += (v.objetivo - v.abierta) * Math.min(1, dt * 8);
      v.hojas[0].rotation.x = v.abierta * 1.3; v.hojas[1].rotation.x = -v.abierta * 1.3;
      v.aro.material.emissiveIntensity = resaltado === k ? 1.2 : 0.3; v.aro.scale.setScalar(resaltado === k ? 1.25 : 1);
    });
    // capas que se aclaran para ver por dentro
    [[capas.vasos, estado.zona === "corazon" && cam.rGoal < 12 ? 0.1 : 1], [capas.pulmones, estado.zona === "pulmon" && cam.rGoal < 12 ? 0.25 : 1]].forEach(function (c) {
      c[0].forEach(function (m) { var obj = m.userData.opac * c[1]; m.opacity += (obj - m.opacity) * (cam.saltar ? 1 : Math.min(1, dt * 4)); });
    });
    // glóbulo rojo
    var p = posicion(estado.paso, estado.t), tg = tangente(estado.paso, estado.t);
    celula.position.copy(p);
    celula.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tg);
    celula.userData.mesh.rotation.y += dt * 1.5;
    celula.userData.mesh.material.color.copy(AZUL).lerp(ROJO, estado.o2);
    // gases
    animarGases(dt);
    // cámara
    if (estado.seguir) { cam.targetGoal.copy(p); cam.rGoal += (estado.zoom - cam.rGoal) * Math.min(1, dt * 1.5); }
    if (cam.saltar) { cam.saltar = false; if (estado.seguir) cam.rGoal = estado.zoom; cam.target.copy(cam.targetGoal); cam.r = cam.rGoal; }
    labelsEl.classList.toggle("lejos", cam.r > 15);
    cam.target.lerp(cam.targetGoal, Math.min(1, dt * 3));
    cam.r += (cam.rGoal - cam.r) * Math.min(1, dt * 3);
    camera.position.set(cam.target.x + cam.r * Math.sin(cam.phi) * Math.sin(cam.theta), cam.target.y + cam.r * Math.cos(cam.phi), cam.target.z + cam.r * Math.sin(cam.phi) * Math.cos(cam.theta));
    camera.lookAt(cam.target);
  }
  function animarGases(dt) {
    var g = estado.gases;
    gases.forEach(function (s) { s.visible = !!g; });
    gases.etO2.el.style.display = gases.etCO2.el.style.display = g ? "" : "none";
    if (!g) return;
    estado.gasT += dt;
    var pc = celula.position, otro = g === "pulmon" ? corazon.alveolos : masCercana(corazon.celulas, pc);
    gases.forEach(function (s, i) {
      var u = ((estado.gasT * 0.55 + s.userData.fase) % 1), haciaCelula = (g === "pulmon") === s.userData.o2;
      var desde = haciaCelula ? otro : pc, hasta = haciaCelula ? pc : otro;
      s.position.copy(desde).lerp(hasta, u);
      s.position.y += Math.sin(u * Math.PI) * 0.35 + ((i * 37) % 7 - 3) * 0.03;
      s.position.x += ((i * 53) % 5 - 2) * 0.05;
      s.scale.setScalar(u < 0.1 ? u * 10 : u > 0.9 ? (1 - u) * 10 : 1);
    });
    gases.etO2.pos.copy(gases[0].position).add(new THREE.Vector3(0, 0.25, 0));
    gases.etCO2.pos.copy(gases[1].position).add(new THREE.Vector3(0, 0.25, 0));
  }
  function masCercana(lista, p) { var m = lista[0], d = 1e9; lista.forEach(function (q) { var dd = q.distanceTo(p); if (dd < d) { d = dd; m = q; } }); return m; }

  function pintarEtiquetas() {
    var w = canvas.clientWidth, h = canvas.clientHeight, v = new THREE.Vector3();
    etiquetas.forEach(function (e) {
      if (e.ref === celula) e.pos.copy(celula.position).add(new THREE.Vector3(0, 0.55, 0));
      v.copy(e.pos).project(camera);
      var dentro = v.z < 1 && Math.abs(v.x) < 1.1 && Math.abs(v.y) < 1.1;
      if (e.el.style.display === "none" && (e.el.classList.contains("gas"))) return;
      e.el.style.visibility = dentro ? "visible" : "hidden";
      if (dentro) e.el.style.transform = "translate(" + ((v.x + 1) / 2 * w) + "px," + ((1 - v.y) / 2 * h) + "px) translate(-50%,-50%)";
    });
  }

  function tamano() {
    var w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  var activo = true, ultimoCuadro = 0;
  function cuadro() {
    ultimoCuadro = performance.now();
    if (!activo) { reloj.getDelta(); return; }
    var dt = Math.min(0.05, reloj.getDelta()), ahora = reloj.elapsedTime;
    if (alHacerTick) alHacerTick(dt);
    actualizar(dt, ahora);
    renderer.render(scene, camera);
    pintarEtiquetas();
  }
  function bucle() { cuadro(); requestAnimationFrame(bucle); }
  // si el navegador deja de pintar (pestaña en segundo plano), la escena sigue avanzando
  setInterval(function () { if (renderer && performance.now() - ultimoCuadro > 300) cuadro(); }, 120);

  function iniciar(cv, labs) {
    canvas = cv; labelsEl = labs;
    try { renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true }); } catch (e) { return false; }
    if (!renderer.getContext()) return false;
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(40, 1, 0.1, 200);
    scene.add(new THREE.HemisphereLight(0xffffff, 0xf0d0d4, 0.85));
    var luz = new THREE.DirectionalLight(0xffffff, 0.75); luz.position.set(4, 10, 8); scene.add(luz);
    var luz2 = new THREE.DirectionalLight(0xffe0e0, 0.35); luz2.position.set(-6, -4, 5); scene.add(luz2);
    crearCorazon(); crearPulmones(); crearTejido(); crearVasos(); crearCelula(); crearGases();
    controles();
    cam.target.copy(posicion(0, 0)); cam.targetGoal.copy(cam.target);
    window.addEventListener("resize", tamano);
    if (window.ResizeObserver) new ResizeObserver(tamano).observe(canvas);
    tamano(); bucle();
    return true;
  }

  return {
    activar: function (on) { activo = on; if (on) setTimeout(tamano, 0); },
    iniciar: iniciar, estado: estado, saltar: function () { cam.saltar = true; }, vista: vista, longitudes: function () { return longitudes; },
    resaltar: function (id) { resaltado = id; if (id && DATOS.CAVIDADES[id]) { estado.seguir = false; cam.targetGoal.copy(V(DATOS.CAVIDADES[id].c)); cam.rGoal = 7; }
      else if (id && DATOS.VALVULAS[id]) { estado.seguir = false; cam.targetGoal.copy(V(DATOS.VALVULAS[id].p)); cam.rGoal = 5.5; }
      else if (id === "tabique") { estado.seguir = false; cam.targetGoal.set(0, -0.2, 0); cam.rGoal = 8; } },
    alTick: function (f) { alHacerTick = f; }, alLatir: function (f) { alLatido = f; }
  };
})();
