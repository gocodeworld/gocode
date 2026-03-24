(function () {
  var canvas = document.getElementById("scene3d");
  if (!canvas || typeof THREE === "undefined") return;

  var scene = new THREE.Scene();

  var camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0, 4.2);

  var renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true,
    powerPreference: "high-performance",
  });
  var detailBoost = 1.03 * 1.1;
  renderer.setPixelRatio(
    Math.min(window.devicePixelRatio * detailBoost, 2.06 * 1.1)
  );
  renderer.setClearColor(0x000000, 0);

  var earthGroup = new THREE.Group();
  scene.add(earthGroup);

  var earthSeg = Math.max(8, Math.round(64 * 1.03 * 1.1));
  var geometry = new THREE.SphereGeometry(1.15, earthSeg, earthSeg);
  var material = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.62,
    metalness: 0.08,
  });
  var earthMesh = new THREE.Mesh(geometry, material);
  earthGroup.add(earthMesh);

  var loader = new THREE.TextureLoader();
  loader.setCrossOrigin("anonymous");

  var texBase = "https://threejs.org/examples/textures/planets/";
  loader.load(
    texBase + "earth_atmos_2048.jpg",
    function (map) {
      map.anisotropy = renderer.capabilities.getMaxAnisotropy();
      map.minFilter = THREE.LinearMipmapLinearFilter;
      map.magFilter = THREE.LinearFilter;
      map.generateMipmaps = true;
      if (THREE.SRGBColorSpace) map.colorSpace = THREE.SRGBColorSpace;
      material.map = map;
      material.needsUpdate = true;
    },
    undefined,
    function () {
      material.color.setHex(0x1a4d6e);
    }
  );
  loader.load(texBase + "earth_normal_2048.jpg", function (normalMap) {
    normalMap.anisotropy = renderer.capabilities.getMaxAnisotropy();
    normalMap.minFilter = THREE.LinearMipmapLinearFilter;
    normalMap.magFilter = THREE.LinearFilter;
    material.normalMap = normalMap;
    material.normalScale = new THREE.Vector2(0.35, 0.35);
    material.needsUpdate = true;
  });

  var ambient = new THREE.AmbientLight(0x404060, 0.55);
  scene.add(ambient);
  var sun = new THREE.DirectionalLight(0xffffff, 1.35);
  sun.position.set(4, 2.5, 5);
  scene.add(sun);
  var rim = new THREE.DirectionalLight(0x3b82f6, 0.35);
  rim.position.set(-3, -1, -2);
  scene.add(rim);

  var scrollT = 0;
  var targetScrollT = 0;

  function getScrollFactor() {
    var el = document.documentElement;
    var scrollable = Math.max(1, el.scrollHeight - window.innerHeight);
    var y = window.scrollY || window.pageYOffset || 0;
    var t = y / scrollable;
    if (t < 0) return 0;
    if (t > 1) return 1;
    return t;
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function resize() {
    var parent = canvas.parentElement;
    var w = 0;
    var h = 0;
    if (parent) {
      var rect = parent.getBoundingClientRect();
      w = Math.round(rect.width);
      h = Math.round(rect.height);
    }
    if (!w || !h) {
      w = window.innerWidth;
      h = window.innerHeight;
    }
    if (!w || !h) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  }

  function onResize() {
    resize();
  }

  var clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    var dt = clock.getDelta();
    var elapsed = clock.getElapsedTime();

    targetScrollT = getScrollFactor();
    scrollT += (targetScrollT - scrollT) * 0.08;

    var scale = lerp(1.05, 0.28, scrollT);
    earthGroup.scale.setScalar(scale);
    earthGroup.position.x = lerp(0, 1.35, scrollT);
    earthGroup.position.y = lerp(0, 0.2, scrollT);

    camera.position.x = 0;
    camera.position.y = 0;
    camera.position.z = lerp(4.2, 4.5, scrollT);
    camera.lookAt(lerp(0, 0.25, scrollT), lerp(0, 0.04, scrollT), 0);

    earthMesh.rotation.y += dt * 0.18;
    earthMesh.rotation.x = Math.sin(elapsed * 0.12) * 0.04;

    renderer.render(scene, camera);
  }

  window.addEventListener("resize", onResize);
  window.addEventListener("orientationchange", onResize);
  document.addEventListener("fullscreenchange", onResize);
  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", onResize);
  }
  resize();
  requestAnimationFrame(function () {
    resize();
  });
  animate();
})();
