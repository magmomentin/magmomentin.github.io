document.getElementById("start-btn").addEventListener("click", async () => {
  const startBtn = document.getElementById("start-btn");
  const video = document.getElementById("ar-video");
  const overlay = document.getElementById("ui-overlay");
  const muteBtn = document.getElementById("mute-btn");

  startBtn.classList.add("ui-hidden");

  // The aspect ratio of your physical card/scan-frame
  const TARGET_ASPECT = 354 / 472; 

  const mindarThree = new window.MINDAR.IMAGE.MindARThree({
    container: document.body,
    imageTargetSrc: "assets/targets.mind",
    filterMinCF: 0.0001,
    filterBeta: 0.001,
  });

  const { renderer, scene, camera } = mindarThree;

  /* ---------- DYNAMIC VIDEO HANDLING ---------- */
  
  // Wait for video dimensions to be available
  if (video.readyState < 1) {
    await new Promise((resolve) => {
      video.onloadedmetadata = () => resolve();
    });
  }

  const videoAspect = video.videoWidth / video.videoHeight;
  const texture = new THREE.VideoTexture(video);

  // Dynamic UV mapping to simulate "background-size: cover"
  if (videoAspect > TARGET_ASPECT) {
    // Video is wider than the target box: Crop sides
    const ratio = TARGET_ASPECT / videoAspect;
    texture.repeat.set(ratio, 1);
    texture.offset.set((1 - ratio) / 2, 0);
  } else {
    // Video is taller than the target box: Crop top/bottom
    const ratio = videoAspect / TARGET_ASPECT;
    texture.repeat.set(1, ratio);
    texture.offset.set(0, (1 - ratio) / 2);
  }

  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    opacity: 0,
  });

  // Create plane that matches the TARGET_ASPECT (Height = Width / Aspect)
  const geometry = new THREE.PlaneGeometry(1, 1 / TARGET_ASPECT);
  const plane = new THREE.Mesh(geometry, material);
  plane.position.set(0, 0, 0.01);
  plane.visible = false;

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

  muteBtn.onclick = () => {
    video.muted = !video.muted;
    muteBtn.textContent = video.muted ? "🔇" : "🔊";
  };

  await mindarThree.start();

  renderer.setAnimationLoop(() => {
    // Smooth transition
    material.opacity = THREE.MathUtils.lerp(
      material.opacity,
      isVisible ? 1 : 0,
      0.1
    );
    
    // Hide mesh when fully faded out to save performance
    plane.visible = material.opacity > 0.001;
    
    renderer.render(scene, camera);
  });
});