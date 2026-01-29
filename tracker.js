document.getElementById("start-btn").addEventListener("click", async () => {
  const startBtn = document.getElementById("start-btn");
  const video = document.getElementById("ar-video");
  const overlay = document.getElementById("ui-overlay");
  const muteBtn = document.getElementById("mute-btn");

  startBtn.classList.add("ui-hidden");

  const TARGET_ASPECT = 0.75; // 354 / 472

  const mindarThree = new window.MINDAR.IMAGE.MindARThree({
    container: document.body,
    imageTargetSrc: "assets/targets.mind",
    filterMinCF: 0.0001,
    filterBeta: 0.001,
  });

  const { renderer, scene, camera } = mindarThree;

  /* ---------- VIDEO PREP ---------- */
  // Ensure metadata is loaded for dimensions
  if (video.readyState < 1) {
    await new Promise((resolve) => {
      video.onloadedmetadata = () => resolve();
    });
  }

  const videoAspect = video.videoWidth / video.videoHeight;
  const texture = new THREE.VideoTexture(video);
  
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    opacity: 0,
  });

  // Calculate Plane Size
  const TARGET_WIDTH = 1;
  const TARGET_HEIGHT = TARGET_WIDTH / TARGET_ASPECT;
  let planeWidth, planeHeight;

  if (videoAspect > TARGET_ASPECT) {
    planeWidth = TARGET_WIDTH;
    planeHeight = TARGET_WIDTH / videoAspect;
  } else {
    planeHeight = TARGET_HEIGHT;
    planeWidth = TARGET_HEIGHT * videoAspect;
  }

  const geometry = new THREE.PlaneGeometry(planeWidth, planeHeight);
  const plane = new THREE.Mesh(geometry, material);
  plane.position.set(0, 0, 0.01);
  plane.visible = false; // Start hidden

  const anchor = mindarThree.addAnchor(0);
  anchor.group.add(plane);

  let isTracking = false;

  anchor.onTargetFound = () => {
    isTracking = true;
    video.play().catch(e => console.warn("Autoplay prevented", e));
    overlay.classList.add("ui-hidden");
    muteBtn.classList.remove("ui-hidden");
  };

  anchor.onTargetLost = () => {
    isTracking = false;
    video.pause();
    overlay.classList.remove("ui-hidden");
    muteBtn.classList.add("ui-hidden");
  };

  muteBtn.onclick = () => {
    video.muted = !video.muted;
    muteBtn.textContent = video.muted ? "🔇" : "🔊";
  };

  await mindarThree.start();

  renderer.setAnimationLoop(() => {
    // Smooth Fade Logic
    const targetOpacity = isTracking ? 1 : 0;
    material.opacity = THREE.MathUtils.lerp(material.opacity, targetOpacity, 0.1);
    
    // Toggle visibility to save GPU/Depth resources
    plane.visible = material.opacity > 0.005;

    renderer.render(scene, camera);
  });
});