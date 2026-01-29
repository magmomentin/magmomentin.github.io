document.getElementById("start-btn").addEventListener("click", async function() {
  const startBtn = this;
  const loading = document.getElementById("loading-screen");
  const video = document.getElementById("ar-video");
  const overlay = document.getElementById("ui-overlay");
  const muteBtn = document.getElementById("mute-btn");

  // --- HARDCODED CALIBRATION ---
  const ASPECT_RATIO = 1.333; // 4 divided by 3
  const SCALE_ADJUST = 1.02;  // 1.02 (102%) covers physical edges/bleed
  const OFFSET_Y = 0.0;       // Increase (e.g., 0.05) to move video UP
  const OFFSET_X = 0.0;       // Increase (e.g., 0.05) to move video RIGHT
  // -----------------------------

  startBtn.classList.add("ui-hidden");
  loading.classList.remove("ui-hidden");

  const mindarThree = new window.MINDAR.IMAGE.MindARThree({
    container: document.body,
    imageTargetSrc: "assets/targets.mind",
    filterMinCF: 0.0001,
    filterBeta: 0.001,
  });

  const { renderer, scene, camera } = mindarThree;

  const texture = new THREE.VideoTexture(video);
  const material = new THREE.MeshBasicMaterial({ 
    map: texture, 
    transparent: true, 
    opacity: 0,
    side: THREE.DoubleSide 
  });

  // Hardcoded Geometry: Width is 1, Height is 1.333
  const geometry = new THREE.PlaneGeometry(1 * SCALE_ADJUST, ASPECT_RATIO * SCALE_ADJUST);
  const plane = new THREE.Mesh(geometry, material);
  
  // Apply hardcoded offsets
  plane.position.set(OFFSET_X, OFFSET_Y, 0.01); 

  const anchor = mindarThree.addAnchor(0);
  anchor.group.add(plane);

  let isVisible = false;

  anchor.onTargetFound = () => {
    isVisible = true;
    video.play();
    overlay.classList.add("ui-hidden");
    muteBtn.classList.remove("ui-hidden");
  };

  anchor.onTargetLost = () => {
    isVisible = false;
    video.pause();
    overlay.classList.remove("ui-hidden");
    muteBtn.classList.add("ui-hidden");
  };

  muteBtn.onclick = (e) => {
    e.stopPropagation();
    video.muted = !video.muted;
    muteBtn.innerText = video.muted ? "🔇" : "🔊";
  };

  // Fullscreen Raycaster
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  window.addEventListener("click", (e) => {
    if (!isVisible || e.target.closest('button')) return;
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(plane);
    if (intersects.length > 0) {
      if (video.requestFullscreen) video.requestFullscreen();
      else if (video.webkitEnterFullscreen) video.webkitEnterFullscreen();
    }
  });

  try {
    await mindarThree.start();
    loading.classList.add("ui-hidden");
    overlay.classList.remove("ui-hidden");

    renderer.setAnimationLoop(() => {
      material.opacity = THREE.MathUtils.lerp(material.opacity, isVisible ? 1 : 0, 0.1);
      renderer.render(scene, camera);
    });
  } catch (err) {
    console.error(err);
  }
});