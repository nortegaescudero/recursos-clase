// Escena 3D de «La sangre»: gota al microscopio (componentes pulsables), defensa (fagocitosis),
// coagulación de una herida y tubo de sangre centrifugada. Medidas aproximadas: 1 unidad ≈ 5 µm.
var Sangre = (function () {
  "use strict";
  var renderer, scene, camera, canvas, labelsEl, reloj = new THREE.Clock(), activo = false;
  var cam = { theta: 0, phi: 1.45, r: 22, rGoal: 22, target: new THREE.Vector3() };
  var grupos = {}, modo = "micro", tModo = 0, seleccion = null, pulsables = [], etiquetas = [], alElegir = null, alPaso = null, pasoPrevio = -1;
  var rnd = (function (s) { return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; })(7);

  function mat(color, opac, extra) {
    var m = new THREE.MeshStandardMaterial(Object.assign({ color: color, roughness: 0.5 }, extra || {}));
    if (opac < 1) { m.transparent = true; m.opacity = opac; m.depthWrite = false; }
    return m;
  }
  function etiqueta(texto, obj, clase, alto) {
    var d = document.createElement("div"); d.className = "lab " + (clase || ""); d.textContent = texto; labelsEl.appendChild(d);
    var e = { el: d, obj: obj, alto: alto || 1, grupo: null }; etiquetas.push(e); return e;
  }

  // ---------- piezas ----------
  var geoHematie = null;
  function hematie() {
    if (!geoHematie) {
      var R = 0.75, pts = [], N = 22, i, r;
      var g = function (r) { var u = r / R; return R * Math.sqrt(Math.max(0, 1 - u * u)) * (0.207 + 2.003 * u * u - 1.123 * u * u * u * u) * 0.5; };
      for (i = 0; i <= N; i++) { r = R * i / N; pts.push(new THREE.Vector2(r, -g(r))); }
      for (i = N; i >= 0; i--) { r = R * i / N; pts.push(new THREE.Vector2(r, g(r))); }
      geoHematie = new THREE.LatheGeometry(pts, 36);
    }
    var m = new THREE.Mesh(geoHematie, mat("#d93030", 1, { roughness: 0.35, emissive: "#3a0505", emissiveIntensity: 0.35 }));
    m.userData.tipo = "hematie"; return m;
  }
  function membrana(r, color, opac) {
    var g = new THREE.SphereGeometry(r, 36, 26), p = g.attributes.position;
    for (var i = 0; i < p.count; i++) {   // superficie algo irregular
      var v = new THREE.Vector3(p.getX(i), p.getY(i), p.getZ(i)), k = 1 + 0.05 * Math.sin(v.x * 5 / r) * Math.cos(v.y * 4 / r) + 0.03 * Math.sin(v.z * 7 / r);
      v.multiplyScalar(k); p.setXYZ(i, v.x, v.y, v.z);
    }
    g.computeVertexNormals();
    return new THREE.Mesh(g, mat(color, opac, { roughness: 0.7 }));
  }
  function nucleoMat() { return mat("#5b2a86", 1, { roughness: 0.6, emissive: "#1a0630", emissiveIntensity: 0.3 }); }
  function neutrofilo() {
    var gr = new THREE.Group(); gr.add(membrana(1.25, "#efe6f7", 0.62));
    var nm = nucleoMat();
    [[-0.45, 0.15, 0], [0, 0.35, 0.1], [0.45, 0.1, -0.05], [0.2, -0.35, 0.05]].forEach(function (p, i) {
      var s = new THREE.Mesh(new THREE.SphereGeometry(0.32, 18, 14), nm); s.position.set(p[0], p[1], p[2]); gr.add(s);
    });
    var gm = mat("#d9a7c7", 1);
    for (var i = 0; i < 26; i++) { var s = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 5), gm); var v = new THREE.Vector3(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).normalize().multiplyScalar(0.6 + rnd() * 0.45); s.position.copy(v); gr.add(s); }
    gr.userData.tipo = "neutrofilo"; return gr;
  }
  function linfocito() {
    var gr = new THREE.Group(); gr.add(membrana(0.95, "#e6e3f7", 0.6));
    var n = new THREE.Mesh(new THREE.SphereGeometry(0.72, 26, 20), nucleoMat()); n.position.set(0.06, 0.04, 0); gr.add(n);
    gr.userData.tipo = "linfocito"; return gr;
  }
  function monocito() {
    var gr = new THREE.Group(); gr.add(membrana(1.75, "#ece4f2", 0.58));
    var n = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.38, 16, 32, Math.PI * 1.35), nucleoMat()); n.rotation.z = 0.9; n.position.set(-0.1, 0, 0); gr.add(n);
    gr.userData.tipo = "monocito"; return gr;
  }
  var geoPlaq = null;
  function plaqueta() {
    if (!geoPlaq) { geoPlaq = new THREE.IcosahedronGeometry(0.28, 1); geoPlaq.scale(1, 0.45, 0.8); }
    var gr = new THREE.Group(), m = new THREE.Mesh(geoPlaq, mat("#c38ad6", 1, { emissive: "#2a0f33", emissiveIntensity: 0.3, flatShading: true }));
    gr.add(m);
    var pinchos = new THREE.Group(), pm = mat("#b071c9", 1);
    for (var i = 0; i < 7; i++) { var c = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.32, 6), pm); var a = i / 7 * Math.PI * 2; c.position.set(Math.cos(a) * 0.3, 0, Math.sin(a) * 0.24); c.lookAt(c.position.clone().multiplyScalar(3)); c.rotateX(Math.PI / 2); pinchos.add(c); }
    pinchos.visible = false; gr.add(pinchos); gr.userData.pinchos = pinchos;
    gr.userData.tipo = "plaqueta"; return gr;
  }
  function bacteria() {
    var gr = new THREE.Group(), m = mat("#5fae3e", 1, { emissive: "#123a08", emissiveIntensity: 0.3 });
    var cuerpo = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.9, 16), m); cuerpo.rotation.z = Math.PI / 2; gr.add(cuerpo);
    [-0.45, 0.45].forEach(function (x) { var s = new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 12), m); s.position.x = x; gr.add(s); });
    var fl = new THREE.CatmullRomCurve3([new THREE.Vector3(0.7, 0, 0), new THREE.Vector3(1.0, 0.15, 0), new THREE.Vector3(1.3, -0.12, 0), new THREE.Vector3(1.6, 0.1, 0)]);
    gr.add(new THREE.Mesh(new THREE.TubeGeometry(fl, 20, 0.03, 6, false), mat("#3d7a25", 1)));
    return gr;
  }
  function anticuerpo() {
    var gr = new THREE.Group(), m = mat("#f2b705", 1, { emissive: "#5a4500", emissiveIntensity: 0.4 });
    var tallo = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.22, 6), m); tallo.position.y = -0.11; gr.add(tallo);
    [-1, 1].forEach(function (s) { var b = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.2, 6), m); b.position.set(s * 0.07, 0.07, 0); b.rotation.z = -s * 0.7; gr.add(b); });
    return gr;
  }

  // ---------- modo «Al microscopio» ----------
  function crearMicro() {
    var g = new THREE.Group(); grupos.micro = g; scene.add(g);
    var lista = [];
    function poner(obj, x, y, z) { obj.position.set(x, y, z); obj.rotation.set(rnd() * 6, rnd() * 6, rnd() * 6);
      obj.userData.vel = 0.25 + rnd() * 0.25; obj.userData.giro = new THREE.Vector3(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).multiplyScalar(0.6);
      g.add(obj); lista.push(obj); pulsables.push(obj); return obj; }
    for (var i = 0; i < 70; i++) poner(hematie(), (rnd() - 0.5) * 30, (rnd() - 0.5) * 15, (rnd() - 0.5) * 9 - 1);
    for (i = 0; i < 22; i++) poner(plaqueta(), (rnd() - 0.5) * 30, (rnd() - 0.5) * 15, (rnd() - 0.5) * 8);
    var principales = {
      hematie: lista[3],
      neutrofilo: poner(neutrofilo(), -6.5, 2.2, 2), linfocito: poner(linfocito(), 4.5, -2.6, 2.5),
      monocito: poner(monocito(), 7.5, 3.0, 0.5), plaqueta: lista[72]
    };
    poner(neutrofilo(), 12, -4, -3); poner(linfocito(), -12, -3.5, -2.5);
    principales.hematie.position.set(-1.5, -2.2, 4); principales.plaqueta.position.set(1.4, 1.6, 4.6);
    g.userData.lista = lista; g.userData.principales = principales;
    Object.keys(principales).forEach(function (k) {
      var e = etiqueta({ hematie: "Glóbulo rojo", neutrofilo: "Neutrófilo", linfocito: "Linfocito", monocito: "Monocito", plaqueta: "Plaqueta" }[k], principales[k], "", k === "monocito" ? 2.2 : k === "neutrofilo" ? 1.7 : k === "linfocito" ? 1.4 : 1.1);
      e.grupo = "micro"; e.tipo = k;
    });
    var ep = etiqueta("Plasma (el líquido)", null, "suave"); ep.fijo = new THREE.Vector3(-8.5, 6.6, 2); ep.grupo = "micro"; ep.tipo = "plasma";
  }
  function animarMicro(dt) {
    grupos.micro.userData.lista.forEach(function (o) {
      o.position.x += o.userData.vel * dt;
      if (o.position.x > 16) o.position.x -= 32;
      o.rotation.x += o.userData.giro.x * dt; o.rotation.y += o.userData.giro.y * dt; o.rotation.z += o.userData.giro.z * dt;
      var sel = seleccion && o.userData.tipo === seleccion;
      var s = sel ? 1.18 : 1; o.scale.x += (s - o.scale.x) * 0.15; o.scale.y = o.scale.z = o.scale.x;
    });
  }

  // ---------- modo «Defensa» ----------
  function crearDefensa() {
    var g = new THREE.Group(); grupos.defensa = g; scene.add(g);
    var fondo = [];
    for (var i = 0; i < 14; i++) { var h = hematie(); h.position.set((rnd() - 0.5) * 26, (rnd() - 0.5) * 12, -3 - rnd() * 4); h.rotation.set(rnd() * 6, rnd() * 6, 0); h.userData.vel = 0.3 + rnd() * 0.3; g.add(h); fondo.push(h); }
    var bac = bacteria(); g.add(bac);
    var neu = neutrofilo(); g.add(neu);
    var lin = linfocito(); g.add(lin);
    var ants = []; for (i = 0; i < 6; i++) { var a = anticuerpo(); a.visible = false; g.add(a); ants.push(a); }
    g.userData = { fondo: fondo, bac: bac, neu: neu, lin: lin, ants: ants };
    [["Bacteria", bac, 0.9], ["Neutrófilo", neu, 1.8], ["Linfocito", lin, 1.4]].forEach(function (x) { var e = etiqueta(x[0], x[1], x[0] === "Bacteria" ? "foco" : "", x[2]); e.grupo = "defensa"; });
    var ea = etiqueta("Anticuerpos", ants[0], "suave", 0.5); ea.grupo = "defensa"; ea.soloVisible = true;
  }
  function animarDefensa(t, dt) {
    var u = grupos.defensa.userData, B = new THREE.Vector3(2.5, 0.4, 0);
    u.fondo.forEach(function (h) { h.position.x += h.userData.vel * dt; if (h.position.x > 14) h.position.x -= 28; h.rotation.y += dt * 0.3; });
    var bp = B.clone().add(new THREE.Vector3(Math.sin(t * 2.1) * 0.25, Math.cos(t * 1.7) * 0.2, 0));
    u.lin.position.set(-4.5, 3.6, -0.5);
    // anticuerpos: del linfocito a la bacteria (de 3 s a 6 s) y luego pegados
    u.ants.forEach(function (a, i) {
      var t0 = 3 + i * 0.35, k = Math.min(1, Math.max(0, (t - t0) / 2.2));
      a.visible = t > t0 && t < 11;
      var ang = i / u.ants.length * Math.PI * 2, pegado = bp.clone().add(new THREE.Vector3(Math.cos(ang) * 0.75, Math.sin(ang) * 0.42, 0.25));
      a.position.copy(u.lin.position).lerp(pegado, k);
      a.rotation.z = ang - Math.PI / 2;
    });
    // neutrófilo: se acerca (6,5–9,5 s), engulle (9,5–12 s)
    var desde = new THREE.Vector3(-6, -2.6, 0.5), cerca = B.clone().add(new THREE.Vector3(-1.4, -0.2, 0)), dentro = B.clone();
    var kA = Math.min(1, Math.max(0, (t - 6.5) / 3)), kB = Math.min(1, Math.max(0, (t - 9.5) / 2.2));
    u.neu.position.copy(desde).lerp(cerca, kA * kA * (3 - 2 * kA)).lerp(dentro, kB);
    var estira = Math.sin(Math.min(1, kA * 1.1 + kB) * Math.PI) * 0.25;
    u.neu.scale.set(1 + estira, 1 - estira * 0.5, 1);
    u.neu.rotation.y += dt * 0.2;
    u.bac.position.copy(bp);
    u.bac.rotation.z = Math.sin(t * 3) * 0.2;
    var s = t < 9.5 ? 1 : Math.max(0, 1 - (t - 10.4) / 2.2);
    u.bac.scale.setScalar(Math.max(0.001, t < 10.4 ? 1 : s)); u.bac.visible = s > 0.02;
    if (t > 11) u.ants.forEach(function (a) { a.visible = false; });
  }

  // ---------- modo «Coagulación» ----------
  function crearCoagulacion() {
    var g = new THREE.Group(); grupos.coagulacion = g; scene.add(g);
    var pared = mat("#e9a4a4", 1, { roughness: 0.8 }), pared2 = mat("#d98585", 1);
    var abajo = new THREE.Mesh(new THREE.BoxGeometry(30, 0.8, 6), pared); abajo.position.set(0, -3.2, 0); g.add(abajo);
    var izq = new THREE.Mesh(new THREE.BoxGeometry(14, 0.8, 6), pared); izq.position.set(-8.2, 3.2, 0); g.add(izq);
    var der = new THREE.Mesh(new THREE.BoxGeometry(14, 0.8, 6), pared); der.position.set(8.2, 3.2, 0); g.add(der);
    var fondoV = new THREE.Mesh(new THREE.PlaneGeometry(30, 6.4), mat("#f6c2c2", 0.55)); fondoV.position.set(0, 0, -3); g.add(fondoV);
    [izq, der].forEach(function (p) { var b = new THREE.Mesh(new THREE.BoxGeometry(p.geometry.parameters.width, 0.12, 6.02), pared2); b.position.copy(p.position).add(new THREE.Vector3(0, -0.4, 0)); g.add(b); });
    var piel = new THREE.Mesh(new THREE.BoxGeometry(30, 1.6, 6), mat("#f3c6a8", 1)); piel.position.set(0, 5.2, 0); g.add(piel);
    var hueco = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.62, 6.1), mat("#b71c1c", 0.45)); hueco.position.set(0, 5.2, 0); g.add(hueco); g.userData.hueco = hueco;
    var gl = [], pl = [], fib = [];
    for (var i = 0; i < 34; i++) { var h = hematie(); h.position.set((rnd() - 0.5) * 28, (rnd() - 0.5) * 4.6, (rnd() - 0.5) * 4); h.rotation.set(rnd() * 6, rnd() * 6, 0); h.userData.vel = 1.4 + rnd() * 0.8; h.userData.base = h.position.clone(); g.add(h); gl.push(h); }
    for (i = 0; i < 14; i++) { var p = plaqueta(); p.position.set((rnd() - 0.5) * 28, (rnd() - 0.5) * 4.6, (rnd() - 0.5) * 4); p.userData.vel = 1.3 + rnd() * 0.6; p.userData.base = p.position.clone();
      p.userData.hueco = new THREE.Vector3(-0.9 + (i % 5) * 0.45, 3.0 + Math.floor(i / 5) * 0.32, (rnd() - 0.5) * 3.5); p.scale.setScalar(1.6); g.add(p); pl.push(p); }
    var fm = mat("#f5d76e", 1, { emissive: "#5a4500", emissiveIntensity: 0.3 });
    for (i = 0; i < 26; i++) { var a = new THREE.Vector3(-1.4 + rnd() * 2.8, 2.5 + rnd() * 1.6, (rnd() - 0.5) * 4), b = new THREE.Vector3(-1.4 + rnd() * 2.8, 2.5 + rnd() * 1.6, (rnd() - 0.5) * 4);
      var c = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, a.distanceTo(b), 5), fm); c.position.copy(a).lerp(b, 0.5); c.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize()); c.visible = false; g.add(c); fib.push(c); }
    var atrapados = []; for (i = 0; i < 5; i++) { var h2 = hematie(); h2.position.set(-0.9 + i * 0.45, 3.4 + (i % 2) * 0.4, (rnd() - 0.5) * 3); h2.rotation.set(rnd() * 6, rnd() * 6, 0); h2.visible = false; g.add(h2); atrapados.push(h2); }
    var gotas = []; for (i = 0; i < 6; i++) { var h3 = hematie(); h3.visible = false; h3.userData.fase = i / 6; g.add(h3); gotas.push(h3); }
    g.userData = { gl: gl, pl: pl, fib: fib, atrapados: atrapados, gotas: gotas, hueco: hueco };
    [["Pared del vaso sanguíneo", abajo, 0.9, "suave"], ["Plaquetas", pl[0], 0.7, ""], ["Herida", hueco, -0.1, "foco"]].forEach(function (x) { var e = etiqueta(x[0], x[1], x[3], x[2]); e.grupo = "coagulacion"; if (x[0] === "Pared del vaso sanguíneo") e.desplaza = new THREE.Vector3(-5, -0.6, 3); });
    var ef = etiqueta("Red de fibrina", fib[0], "suave", 0.6); ef.fijo = new THREE.Vector3(2.6, 4.4, 3); ef.grupo = "coagulacion"; ef.soloVisible = true;
  }
  function animarCoagulacion(t, dt) {
    var u = grupos.coagulacion.userData, herida = t > 2.5, tapon = Math.min(1, Math.max(0, (t - 6) / 3.5)), red = Math.min(1, Math.max(0, (t - 10) / 3));
    u.hueco.visible = herida;
    u.gl.forEach(function (h) { h.position.x += h.userData.vel * dt * (1 - red * 0.3); if (h.position.x > 15) h.position.x -= 30; h.rotation.y += dt; });
    // sangre que se escapa por la herida mientras no hay tapón
    u.gotas.forEach(function (h) {
      var k = ((t * 0.5 + h.userData.fase) % 1); h.visible = herida && tapon < 0.85;
      h.position.set(-0.4 + h.userData.fase * 0.8, 2.6 + k * 4.2, (h.userData.fase - 0.5) * 2); h.rotation.x += dt * 2;
    });
    u.pl.forEach(function (p, i) {
      var llega = Math.min(1, Math.max(0, (t - 6 - i * 0.2) / 1.8));
      if (llega <= 0) { p.userData.desde = null; p.position.x += p.userData.vel * dt; if (p.position.x > 15) p.position.x -= 30; p.userData.pinchos.visible = false; }
      else { if (!p.userData.desde) p.userData.desde = p.position.clone(); var e = llega * llega * (3 - 2 * llega); p.position.copy(p.userData.desde).lerp(p.userData.hueco, e); p.userData.pinchos.visible = llega > 0.6; }
      p.rotation.y += dt * 0.8;
    });
    u.fib.forEach(function (f, i) { f.visible = red > i / u.fib.length; });
    u.atrapados.forEach(function (h, i) { h.visible = red > (i + 1) / 6; });
  }

  // ---------- modo «Tubo de sangre» ----------
  function crearTubo() {
    var g = new THREE.Group(); grupos.tubo = g; scene.add(g);
    var vidrio = mat("#dfeef6", 0.25, { side: THREE.DoubleSide, roughness: 0.1 });
    var R = 1.5, H = 9;
    var cil = new THREE.Mesh(new THREE.CylinderGeometry(R, R, H, 40, 1, true), vidrio); cil.position.y = 0.5; g.add(cil);
    var fondo = new THREE.Mesh(new THREE.SphereGeometry(R, 40, 20, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), vidrio); fondo.position.y = -4; g.add(fondo);
    var tapa = new THREE.Mesh(new THREE.CylinderGeometry(R * 1.12, R * 1.12, 0.9, 40), mat("#e7425a", 1)); tapa.position.y = 5.4; g.add(tapa);
    // contenido: mezcla (antes) y capas (después)
    var Ri = R * 0.92, alto = 8.0, base = -4;
    function capa(h0, h1, color, op) { var m = new THREE.Mesh(new THREE.CylinderGeometry(Ri, Ri, h1 - h0, 40), mat(color, op)); m.position.y = base + (h0 + h1) / 2; g.add(m); return m; }
    var fondoRojo = new THREE.Mesh(new THREE.SphereGeometry(Ri, 40, 20, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), mat("#9e1b1b", 1)); fondoRojo.position.y = base; g.add(fondoRojo);
    var mezcla = capa(0, alto, "#a61d24", 1);
    var rojo = capa(0, alto * 0.45, "#8f1515", 1), blanca = capa(alto * 0.45, alto * 0.47, "#f4f1ea", 1), plasma = capa(alto * 0.47, alto, "#f2c94c", 0.82);
    g.userData = { mezcla: mezcla, capas: [rojo, blanca, plasma], fondoRojo: fondoRojo };
    var et = [["Plasma · 55 %", plasma, 0, "o2b"], ["Glóbulos blancos y plaquetas · menos del 1 %", blanca, 0, ""], ["Glóbulos rojos · 45 %", rojo, 0, "o2"]];
    g.userData.etq = et.map(function (x) { var e = etiqueta(x[0], x[1], x[3] === "o2b" ? "" : x[3], 0); e.grupo = "tubo"; e.desplaza = new THREE.Vector3(R + 2.6, 0, 0); e.soloSeparado = true; return e; });
    g.position.set(-2, 0, 0);
  }
  function animarTubo(t, dt) {
    var u = grupos.tubo.userData, gira = t > 2 && t < 6, sep = Math.min(1, Math.max(0, (t - 3.2) / 2.6));
    grupos.tubo.rotation.y += dt * (gira ? 14 * Math.sin(Math.min(1, (t - 2) / 1) * Math.PI / 2) * Math.min(1, (6 - t) / 0.8) : 0.25);
    u.mezcla.material.opacity = 1 - sep; u.mezcla.material.transparent = true; u.mezcla.visible = sep < 0.99;
    u.capas.forEach(function (c, i) { c.material.transparent = true; c.material.opacity = sep * (i === 2 ? 0.82 : 1); c.visible = sep > 0.01; });
    u.etq.forEach(function (e) { e.oculta = sep < 0.95; });
  }

  // ---------- selección con el ratón ----------
  function controles() {
    var ray = new THREE.Raycaster(), m = new THREE.Vector2(), punteros = new Map(), movido = 0;
    canvas.addEventListener("pointerdown", function (e) { punteros.set(e.pointerId, { x: e.clientX, y: e.clientY }); movido = 0; try { canvas.setPointerCapture(e.pointerId); } catch (_) {} });
    canvas.addEventListener("pointermove", function (e) {
      var p = punteros.get(e.pointerId); if (!p) return;
      var dx = e.clientX - p.x, dy = e.clientY - p.y; movido += Math.abs(dx) + Math.abs(dy);
      cam.theta -= dx * 0.005; cam.phi = Math.min(2.7, Math.max(0.4, cam.phi - dy * 0.005)); p.x = e.clientX; p.y = e.clientY;
    });
    canvas.addEventListener("pointerup", function (e) {
      punteros.delete(e.pointerId);
      if (movido > 6 || modo !== "micro") return;
      var r = canvas.getBoundingClientRect(); m.set((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1);
      ray.setFromCamera(m, camera);
      var hits = ray.intersectObjects(pulsables, true);
      var tipo = "plasma";
      for (var i = 0; i < hits.length; i++) { var o = hits[i].object; while (o && !o.userData.tipo) o = o.parent; if (o) { tipo = o.userData.tipo; break; } }
      elegir(tipo, true);
    });
    canvas.addEventListener("pointercancel", function (e) { punteros.delete(e.pointerId); });
    canvas.addEventListener("wheel", function (e) { e.preventDefault(); cam.rGoal = Math.min(40, Math.max(6, cam.rGoal * (1 + Math.sign(e.deltaY) * 0.1))); }, { passive: false });
  }
  function elegir(tipo, desdeEscena) { seleccion = tipo; etiquetas.forEach(function (e) { e.el.classList.toggle("foco", e.tipo === tipo); }); if (desdeEscena && alElegir) alElegir(tipo); }

  // ---------- bucle ----------
  function pintarEtiquetas() {
    var w = canvas.clientWidth, h = canvas.clientHeight, v = new THREE.Vector3();
    etiquetas.forEach(function (e) {
      var ver = e.grupo === modo && !e.oculta && (!e.soloVisible || (e.obj && e.obj.visible));
      e.el.style.display = ver ? "" : "none"; if (!ver) return;
      if (e.fijo) v.copy(e.fijo); else { e.obj.getWorldPosition(v); v.y += e.alto; if (e.desplaza) v.add(e.desplaza); }
      v.project(camera);
      e.el.style.transform = "translate(" + ((v.x + 1) / 2 * w) + "px," + ((1 - v.y) / 2 * h) + "px) translate(-50%,-50%)";
    });
  }
  var ultimoCuadro = 0;
  setInterval(function () { if (renderer && performance.now() - ultimoCuadro > 300) cuadro(); }, 120);
  function bucle() { requestAnimationFrame(bucle); cuadro(); }
  function cuadro() {
    ultimoCuadro = performance.now();
    if (!activo) { reloj.getDelta(); return; }
    var dt = Math.min(0.05, reloj.getDelta());
    tModo += dt;
    var M = SANGRE.MODOS[modo];
    if (M.dur && tModo > M.dur + 1.5) tModo = 0;   // las animaciones se repiten
    var paso = 0; M.pasos.forEach(function (p, i) { if (tModo >= p.t) paso = i; });
    if (paso !== pasoPrevio) { pasoPrevio = paso; if (alPaso) alPaso(M.pasos[paso].txt, paso, M.pasos.length); }
    Object.keys(grupos).forEach(function (k) { grupos[k].visible = k === modo; });
    if (modo === "micro") animarMicro(dt);
    else if (modo === "defensa") animarDefensa(tModo, dt);
    else if (modo === "coagulacion") animarCoagulacion(tModo, dt);
    else animarTubo(tModo, dt);
    cam.r += (cam.rGoal - cam.r) * Math.min(1, dt * 3);
    camera.position.set(cam.target.x + cam.r * Math.sin(cam.phi) * Math.sin(cam.theta), cam.target.y + cam.r * Math.cos(cam.phi), cam.target.z + cam.r * Math.sin(cam.phi) * Math.cos(cam.theta));
    camera.lookAt(cam.target);
    renderer.render(scene, camera);
    pintarEtiquetas();
  }
  function tamano() { var w = canvas.clientWidth, h = canvas.clientHeight; if (!w || !h) return; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); }

  var VISTAS = { micro: [0, 1.5, 21, [0, 0, 0]], defensa: [0, 1.5, 15, [-0.8, 0.6, 0]], coagulacion: [0.12, 1.45, 14, [0, 2.2, 0]], tubo: [0.3, 1.42, 17, [0.5, 0.3, 0]] };
  function ponerModo(m, t0) {
    modo = m; tModo = t0 || 0; pasoPrevio = -1;
    var v = VISTAS[m]; cam.theta = v[0]; cam.phi = v[1]; cam.rGoal = cam.r = v[2]; cam.target.set(v[3][0], v[3][1], v[3][2]);
    if (m !== "micro") elegir(null);
  }

  function iniciar(cv, labs) {
    canvas = cv; labelsEl = labs;
    try { renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true }); } catch (e) { return false; }
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    scene = new THREE.Scene(); scene.fog = new THREE.Fog(0xf7e6c4, 22, 42);
    camera = new THREE.PerspectiveCamera(40, 1, 0.1, 200);
    scene.add(new THREE.HemisphereLight(0xffffff, 0xf3d9b5, 0.9));
    var l = new THREE.DirectionalLight(0xffffff, 0.7); l.position.set(5, 9, 10); scene.add(l);
    crearMicro(); crearDefensa(); crearCoagulacion(); crearTubo();
    controles();
    if (window.ResizeObserver) new ResizeObserver(tamano).observe(canvas);
    window.addEventListener("resize", tamano);
    ponerModo("micro"); bucle();
    return true;
  }

  return { iniciar: iniciar, modo: ponerModo, elegir: elegir, repetir: function () { tModo = 0; pasoPrevio = -1; },
    activar: function (on) { activo = on; if (on) setTimeout(tamano, 0); },
    alElegir: function (f) { alElegir = f; }, alPaso: function (f) { alPaso = f; } };
})();
