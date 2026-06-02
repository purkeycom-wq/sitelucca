/* ============================================================
   main.js
   • Logo 3D (Three.js): gira no centro e, ao rolar a página,
     encolhe e vai para o canto direito — inspirado em air.inc.
   • Scroll reveal das seções, nav "stuck", ano do footer.
   ============================================================ */

(function () {
  "use strict";

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- util: ano ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- nav stuck ---------- */
  var nav = document.getElementById("nav");
  function onScrollNav() {
    if (!nav) return;
    nav.classList.toggle("is-stuck", window.scrollY > 24);
  }
  window.addEventListener("scroll", onScrollNav, { passive: true });
  onScrollNav();

  /* ---------- scroll reveal ---------- */
  var revealEls = document.querySelectorAll(".step, .card, .client");
  if ("IntersectionObserver" in window && !prefersReduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.18 });
    revealEls.forEach(function (el, i) {
      el.style.transitionDelay = (i % 5) * 0.06 + "s";
      io.observe(el);
    });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ============================================================
     LOGO 3D
     ============================================================ */
  var canvas = document.getElementById("logo3d");
  if (!canvas || typeof THREE === "undefined") return;

  var renderer = new THREE.WebGLRenderer({
    canvas: canvas, antialias: true, alpha: true, powerPreference: "high-performance"
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  camera.position.set(0, 0, 8);

  /* --- geometria: "selo" arredondado extrudado (combina com a marca do nav) --- */
  function roundedRectShape(w, h, r) {
    var s = new THREE.Shape();
    var x = -w / 2, y = -h / 2;
    s.moveTo(x + r, y);
    s.lineTo(x + w - r, y);
    s.quadraticCurveTo(x + w, y, x + w, y + r);
    s.lineTo(x + w, y + h - r);
    s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    s.lineTo(x + r, y + h);
    s.quadraticCurveTo(x, y + h, x, y + h - r);
    s.lineTo(x, y + r);
    s.quadraticCurveTo(x, y, x + r, y);
    return s;
  }

  var shape = roundedRectShape(1.7, 1.7, 0.5);
  var geo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.55, bevelEnabled: true, bevelThickness: 0.12,
    bevelSize: 0.12, bevelSegments: 6, curveSegments: 24
  });
  geo.center();

  var mat = new THREE.MeshStandardMaterial({
    color: 0xff5a2c, metalness: 0.55, roughness: 0.28,
    emissive: 0x521403, emissiveIntensity: 0.45
  });

  var logo = new THREE.Mesh(geo, mat);
  scene.add(logo);

  /* --- luzes (intensidades ajustadas p/ iluminação legada do r149) --- */
  var key = new THREE.DirectionalLight(0xffffff, 1.6);
  key.position.set(4, 5, 6);
  scene.add(key);

  var warm = new THREE.PointLight(0xffb347, 1.2, 30, 2);
  warm.position.set(-5, 2, 4);
  scene.add(warm);

  var cool = new THREE.PointLight(0xff5a2c, 1.0, 30, 2);
  cool.position.set(5, -3, 3);
  scene.add(cool);

  scene.add(new THREE.AmbientLight(0x404048, 0.9));

  /* --- estados de scroll: posição/escala alvo --- */
  // p = 0 -> centro, grande.  p = 1 -> canto direito, pequeno.
  var current = { x: 0, y: 0, scale: 1, rotX: 0 };

  function lerp(a, b, t) { return a + (b - a) * t; }

  function viewportProgress() {
    var h = window.innerHeight || 1;
    return Math.min(1, Math.max(0, window.scrollY / (h * 0.85)));
  }

  function targetForProgress(p) {
    // limites em unidades de mundo (ajustados pela proporção da tela)
    var aspect = camera.aspect;
    // ponto à direita: mais longe quanto mais largo o viewport
    var rightX = 2.4 + aspect * 1.1;
    var topY = 2.0;
    var eased = p * p * (3 - 2 * p); // smoothstep
    return {
      x: lerp(0, rightX, eased),
      y: lerp(0, topY, eased),
      scale: lerp(1, 0.34, eased)
    };
  }

  function resize() {
    var w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener("resize", resize);
  resize();

  /* --- loop --- */
  var t0 = performance.now();
  function animate(now) {
    requestAnimationFrame(animate);
    var dt = Math.min(0.05, (now - t0) / 1000);
    t0 = now;

    var p = viewportProgress();
    var tgt = targetForProgress(p);

    // suaviza o movimento (inércia)
    var k = prefersReduced ? 1 : 1 - Math.pow(0.001, dt);
    current.x = lerp(current.x, tgt.x, k);
    current.y = lerp(current.y, tgt.y, k);
    current.scale = lerp(current.scale, tgt.scale, k);

    logo.position.set(current.x, current.y, 0);
    logo.scale.setScalar(current.scale);

    // giro contínuo + acelera levemente conforme rola
    if (!prefersReduced) {
      logo.rotation.y += dt * (0.7 + p * 1.6);
      logo.rotation.x = Math.sin(now / 2200) * 0.25 + p * 0.3;
    } else {
      logo.rotation.set(-0.2, 0.5, 0);
    }

    renderer.render(scene, camera);
  }
  requestAnimationFrame(animate);
})();
