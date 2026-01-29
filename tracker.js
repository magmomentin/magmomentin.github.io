document.getElementById("start-btn").addEventListener("click", async function() {
  const startBtn = this;
  const video = document.getElementById("ar-video");
  const overlay = document.getElementById("ui-overlay");
  const muteBtn = document.getElementById("mute-btn");

  startBtn.classList.add("ui-hidden");

  const mindarThree = new window.MINDAR.IMAGE.MindARThree({
    container: document.body,
    imageTargetSrc: "assets/targets.mind",
    filterMinCF: 0.0001, // Jitter reduction
    filterBeta: 0.001,
  });

  const { renderer, scene, camera } = mindarThree;

  // 1. Setup Video Content
  const texture = new THREE.VideoTexture(video);
  const material = new THREE.MeshBasicMaterial({ 
    map: texture, 
    transparent: true, 
    opacity: 0 
  });

  // 2. Geometry: Width 1.0 (MindAR Standard), Height 1.333 (3:4 ratio)
  const geometry = new THREE.PlaneGeometry(1, 1.333);
  const plane = new THREE.Mesh(geometry, material);

  // 3. LOCK POSITION & ROTATION
  // Zeroing rotation ensures the video stays flat against the anchor
  plane.rotation.set(0, 0, 0); 
  plane.position.set(0, 0, 0.01); // 0.01 Z-offset prevents flickering

  const anchor = mindarThree.addAnchor(0);
  anchor.group.add(plane); 

  // 4. PERSPECTIVE FIX: Resize Listener
  // This prevents tilting when browser UI elements hide/show
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
    material.opacity = THREE.MathUtils.lerp(material.opacity, isVisible ? 1 : 0, 0.1);
    renderer.render(scene, camera);
  });
});