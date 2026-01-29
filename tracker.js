document.getElementById("start-btn").addEventListener("click", async function() {
  const startBtn = this;
  const loading = document.getElementById("loading-screen");
  const video = document.getElementById("ar-video");
  const overlay = document.getElementById("ui-overlay");
  const muteBtn = document.getElementById("mute-btn");

  // --- HARDCODED ALIGNMENT ---
  const RATIO = 1.333; // 4/3 aspect ratio
  const SCALE = 1.01;  // Slight over-scale to hide physical edges
  // ---------------------------

  startBtn.classList.add("ui-hidden");
  loading.classList.remove("ui-hidden");

  const mindarThree = new window.MINDAR.IMAGE.MindARThree({
    container: document.body,
    imageTargetSrc: "assets/targets.mind",
    filterMinCF: 0.0001,
    filterBeta: 0.001,
  });

  const { renderer, scene, camera } = mindarThree;

  // 1. Plane Setup
  const texture = new THREE.VideoTexture(video);
  const material = new THREE.MeshBasicMaterial({ 
    map: texture, 
    transparent: true, 
    opacity: 0,
    side: THREE.DoubleSide 
  });

  const plane = new THREE.Mesh(new THREE.PlaneGeometry(1 * SCALE, RATIO * SCALE), material);
  plane.position.set(0, 0, 0.01); // 0.01 Z-offset prevents flickering

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

  // 2. Fullscreen Logic
  window.addEventListener("click", (e) => {
    if (!isVisible || e.target.closest('button')) return;
    
    // Simple intersection check for the plane
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(
      (e.clientX / window.innerWidth) * 2 - 1,
      -(e.clientY / window.innerHeight) * 2 + 1
    );

    raycaster.setFromCamera(mouse, camera);
    if (raycaster.intersectObject(plane).length > 0) {
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
    console.error("AR Engine failed:", err);
  }
});
