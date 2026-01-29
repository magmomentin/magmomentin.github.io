document.getElementById("start-btn").addEventListener("click", async function() {
  const startBtn = this;
  const video = document.getElementById("ar-video");
  const overlay = document.getElementById("ui-overlay");
  const muteBtn = document.getElementById("mute-btn");

  startBtn.classList.add("ui-hidden");

  const mindarThree = new window.MINDAR.IMAGE.MindARThree({
    container: document.body, // Root container for tracking
    imageTargetSrc: "assets/targets.mind",
    filterMinCF: 0.0001, // Jitter reduction
    filterBeta: 0.001,
  });

  const { renderer, scene, camera } = mindarThree;

  // 1. Setup Video Texture
  const texture = new THREE.VideoTexture(video);
  const material = new THREE.MeshBasicMaterial({ 
    map: texture, 
    transparent: true, 
    opacity: 0 
  });

  // 2. Setup Geometry for 3:4 Aspect Ratio
  // MindAR width is always 1.0; Height = 4/3 = 1.333
  const geometry = new THREE.PlaneGeometry(1, 1.333);
  const plane = new THREE.Mesh(geometry, material);

  // 3. LOCK TO CENTER
  // 0,0,0 is the exact center of the physical card
  // 0.01 on Z-axis prevents flickering (Z-fighting)
  plane.position.set(0, 0, 0.01); 

  const anchor = mindarThree.addAnchor(0); // Tracks the first image in targets.mind
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

  muteBtn.onclick = () => {
    video.muted = !video.muted;
    muteBtn.innerText = video.muted ? "🔇" : "🔊";
  };

  await mindarThree.start();

  renderer.setAnimationLoop(() => {
    // Smooth Alpha Transition
    material.opacity = THREE.MathUtils.lerp(material.opacity, isVisible ? 1 : 0, 0.1);
    renderer.render(scene, camera);
  });
});