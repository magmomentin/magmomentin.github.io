document.getElementById("start-btn").addEventListener("click", async function() {
  const startBtn = this;
  const loading = document.getElementById("loading-screen");
  const video = document.getElementById("ar-video");
  const overlay = document.getElementById("ui-overlay");
  const scanFrame = document.querySelector(".scan-frame");
  const muteBtn = document.getElementById("mute-btn");

  // --- CALIBRATION SETTINGS ---
  // Adjust these if the alignment is slightly off
  const OFFSET_X = 0.0; 
  const OFFSET_Y = 0.0; // Increase to move video up, decrease to move down
  const SCALE_MODIFIER = 1.02; // 1.0 = 100%. Use 1.05 to slightly overlap card edges
  // ----------------------------

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
  const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, opacity: 0 });
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material);
  
  const anchor = mindarThree.addAnchor(0);
  anchor.group.add(plane);

  const syncRatios = () => {
    if (video.videoWidth > 0 && video.videoHeight > 0) {
      const ratio = video.videoHeight / video.videoWidth;
      
      // Update 3D Geometry with Calibration
      plane.geometry.dispose();
      // Width is always 1 (anchor unit), height is the ratio
      plane.geometry = new THREE.PlaneGeometry(1 * SCALE_MODIFIER, ratio * SCALE_MODIFIER);
      
      // Apply manual offsets
      plane.position.set(OFFSET_X, OFFSET_Y, 0.01); // 0.01 Z-offset prevents flickering
      
      // Update CSS UI
      scanFrame.style.height = `${260 * ratio}px`;
    }
  };

  video.addEventListener('loadedmetadata', syncRatios);

  let isVisible = false;
  anchor.onTargetFound = () => {
    isVisible = true;
    syncRatios();
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

  await mindarThree.start();
  loading.classList.add("ui-hidden");
  overlay.classList.remove("ui-hidden");

  renderer.setAnimationLoop(() => {
    material.opacity = THREE.MathUtils.lerp(material.opacity, isVisible ? 1 : 0, 0.1);
    renderer.render(scene, camera);
  });
});