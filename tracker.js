document.getElementById("start-btn").addEventListener("click", async function() {
  const startBtn = this;
  const loading = document.getElementById("loading-screen");
  const video = document.getElementById("ar-video");
  const overlay = document.getElementById("ui-overlay");
  const scanFrame = document.querySelector(".scan-frame");
  const muteBtn = document.getElementById("mute-btn");

  startBtn.classList.add("ui-hidden");
  loading.classList.remove("ui-hidden");

  const mindarThree = new window.MINDAR.IMAGE.MindARThree({
    container: document.body,
    imageTargetSrc: "assets/targets.mind",
    filterMinCF: 0.0001,
    filterBeta: 0.001,
  });

  const { renderer, scene, camera } = mindarThree;

  // 1. Initial Setup
  const texture = new THREE.VideoTexture(video);
  const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, opacity: 0 });
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material);
  const anchor = mindarThree.addAnchor(0);
  anchor.group.add(plane);

  // 2. AUTO-CALCULATE RATIO FUNCTION
  const syncRatios = () => {
    if (video.videoWidth > 0 && video.videoHeight > 0) {
      const ratio = video.videoHeight / video.videoWidth;
      
      // Update 3D Geometry
      plane.geometry.dispose();
      plane.geometry = new THREE.PlaneGeometry(1, ratio);
      
      // Update CSS Scan Frame (Base width 260px)
      scanFrame.style.height = `${260 * ratio}px`;
      console.log("Aspect Ratio Synchronized:", ratio);
    }
  };

  // Listen for metadata to load
  video.addEventListener('loadedmetadata', syncRatios);

  let isVisible = false;

  anchor.onTargetFound = () => {
    isVisible = true;
    syncRatios(); // Re-verify ratio on detection
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

  // Fullscreen Detection
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
      // Smooth Fade
      material.opacity = THREE.MathUtils.lerp(material.opacity, isVisible ? 1 : 0, 0.1);
      renderer.render(scene, camera);
    });
  } catch (error) {
    console.error("AR Start Failed:", error);
    alert("Please check HTTPS and camera permissions.");
  }
});