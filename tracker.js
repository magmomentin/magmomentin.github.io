document.getElementById("start-btn").addEventListener("click", async function() {
  const startBtn = this;
  const loading = document.getElementById("loading-screen");
  const video = document.getElementById("ar-video");
  const overlay = document.getElementById("ui-overlay");
  const muteBtn = document.getElementById("mute-btn");

  // Initial State Transitions
  startBtn.classList.add("ui-hidden");
  loading.classList.remove("ui-hidden");

  const mindarThree = new window.MINDAR.IMAGE.MindARThree({
    container: document.body,
    imageTargetSrc: "assets/targets.mind",
    filterMinCF: 0.0001, // Jitter reduction
    filterBeta: 0.001,
  });

  const { renderer, scene, camera } = mindarThree;

  // --- ALIGNMENT & GEOMETRY ---
  // Default for Portrait (1 unit width, 1.5 unit height)
  const planeWidth = 1;
  const planeHeight = 1.5; 
  
  const texture = new THREE.VideoTexture(video);
  const material = new THREE.MeshBasicMaterial({ 
    map: texture, 
    transparent: true, 
    opacity: 0,
    side: THREE.DoubleSide 
  });

  const plane = new THREE.Mesh(new THREE.PlaneGeometry(planeWidth, planeHeight), material);
  plane.position.set(0, 0, 0); // Vertical & Horizontal Centering

  const anchor = mindarThree.addAnchor(0);
  anchor.group.add(plane);

  let isTargetVisible = false;

  // Event Listeners
  anchor.onTargetFound = () => {
    isTargetVisible = true;
    video.play();
    overlay.classList.add("ui-hidden");
    muteBtn.classList.remove("ui-hidden");
  };

  anchor.onTargetLost = () => {
    isTargetVisible = false;
    video.pause();
    overlay.classList.remove("ui-hidden");
    muteBtn.classList.add("ui-hidden");
  };

  muteBtn.onclick = (e) => {
    e.stopPropagation();
    video.muted = !video.muted;
    muteBtn.innerText = video.muted ? "🔇" : "🔊";
  };

  // Fullscreen Raycaster logic
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  window.addEventListener("click", (e) => {
    if (!isTargetVisible || e.target.closest('button')) return;
    
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
      // Smooth Alpha Fade
      material.opacity = THREE.MathUtils.lerp(material.opacity, isTargetVisible ? 1 : 0, 0.1);
      renderer.render(scene, camera);
    });
  } catch (error) {
    console.error("AR Initialization Failed:", error);
    alert("Please check camera permissions and HTTPS.");
  }
});