document.getElementById("start-btn").addEventListener("click", async function() {
  const startBtn = this;
  const video = document.getElementById("ar-video");
  const overlay = document.getElementById("ui-overlay");
  const muteBtn = document.getElementById("mute-btn");

  // --- HARDCODED 3:4 DIMENSIONS ---
  const RATIO = 1.333; // 4 divided by 3
  const SCALE = 1.0;   // 1.0 matches target width exactly
  // --------------------------------

  startBtn.classList.add("ui-hidden");

  const mindarThree = new window.MINDAR.IMAGE.MindARThree({
    container: document.body,
    imageTargetSrc: "assets/targets.mind",
    filterMinCF: 0.0001, // Jitter reduction
    filterBeta: 0.001,
  });

  const { renderer, scene, camera } = mindarThree;

  // Setup Video Content
  const texture = new THREE.VideoTexture(video);
  const material = new THREE.MeshBasicMaterial({ 
    map: texture, 
    transparent: true, 
    opacity: 0 
  });

  // Create geometry using the hardcoded ratio
  const geometry = new THREE.PlaneGeometry(1 * SCALE, RATIO * SCALE);
  const plane = new THREE.Mesh(geometry, material);
  
  // LOCK TO CENTER: Origin (0,0,0) is target center
  plane.position.set(0, 0, 0.01); // Z-offset prevents flickering
  plane.rotation.set(0, 0, 0);   // Forces video to stay flat

  const anchor = mindarThree.addAnchor(0);
  anchor.group.add(plane); 

  // PERSPECTIVE FIX: Prevents tilting on mobile UI changes
  window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  });

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

  muteBtn.onclick = () => {
    video.muted = !video.muted;
    muteBtn.innerText = video.muted ? "🔇" : "🔊";
  };

  await mindarThree.start();

  renderer.setAnimationLoop(() => {
    // Smooth alpha fade transition
    material.opacity = THREE.MathUtils.lerp(material.opacity, isVisible ? 1 : 0, 0.1);
    renderer.render(scene, camera);
  });
});