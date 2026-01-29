document.getElementById("start-btn").addEventListener("click", async function() {
  const startBtn = this;
  const loadingScreen = document.getElementById("loading-screen");
  const video = document.getElementById("ar-video");
  const overlay = document.getElementById("ui-overlay");
  const muteBtn = document.getElementById("mute-btn");

  startBtn.classList.add("ui-hidden");
  loadingScreen.classList.remove("ui-hidden");

  const mindarThree = new window.MINDAR.IMAGE.MindARThree({
    container: document.body,
    imageTargetSrc: "assets/targets.mind",
    filterMinCF: 0.0001, // Critical for consistent, smooth tracking
    filterBeta: 0.001,    // Reduces jittering on mobile
  });

  const { renderer, scene, camera } = mindarThree;

  // Plane setup
  const texture = new THREE.VideoTexture(video);
  const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, opacity: 0 });
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1.5), material);
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

  // Fullscreen & Interaction
  muteBtn.onclick = (e) => {
    e.stopPropagation();
    video.muted = !video.muted;
    muteBtn.innerText = video.muted ? "🔇" : "🔊";
  };

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
    loadingScreen.classList.add("ui-hidden");
    overlay.classList.remove("ui-hidden");

    renderer.setAnimationLoop(() => {
      // Consistent Fade-In/Out
      const targetOpacity = isVisible ? 1 : 0;
      material.opacity = THREE.MathUtils.lerp(material.opacity, targetOpacity, 0.1);
      renderer.render(scene, camera);
    });
  } catch (error) {
    console.error("AR Start Failed:", error);
    alert("Camera initialization failed. Please ensure you are on HTTPS.");
  }
});