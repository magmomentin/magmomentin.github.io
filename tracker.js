document.getElementById("start-btn").addEventListener("click", async () => {
  const startBtn = document.getElementById("start-btn");
  const video = document.getElementById("ar-video");
  const overlay = document.getElementById("ui-overlay");
  const muteBtn = document.getElementById("mute-btn");

  startBtn.classList.add("ui-hidden");

  // Target image aspect (354 x 472)
  const TARGET_ASPECT = 354 / 472;

  const mindarThree = new window.MINDAR.IMAGE.MindARThree({
    container: document.body,
    imageTargetSrc: "assets/targets.mind",
    filterMinCF: 0.0001,
    filterBeta: 0.001,
  });

  const { renderer, scene, camera } = mindarThree;

  /* ---------- VIDEO ---------- */
  await new Promise((resolve) => {
    if (video.readyState >= 1) resolve();
    else video.onloadedmetadata = () => resolve();
  });

  video.muted = true;
  muteBtn.textContent = "🔇";

  const videoAspect = video.videoWidth / video.videoHeight;

  const texture = new THREE.VideoTexture(video);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;

  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    opacity: 0,
  });

  /* ---------- FIT VIDEO INSIDE TARGET ---------- */
  const targetWidth = 1;
  const targetHeight = targetWidth / TARGET_ASPECT;

  let planeWidth, planeHeight;

  if (videoAspect > TARGET_ASPECT) {
    planeWidth = targetWidth;
    planeHeight = targetWidth / videoAspect;
  } else {
    planeHeight = targetHeight;
    planeWidth = targetHeight * videoAspect;
  }

  const geometry = new THREE.PlaneGeometry(planeWidth, planeHeight);
  const plane = new THREE.Mesh(geometry, material);
  plane.position.set(0, 0, 0.01);

  const anchor = mindarThree.addAnchor(0);
  anchor.group.add(plane);

  /* ---------- AUTO SCALE LOGIC ---------- */
  let visible = false;
  let autoScale = 0.90;
  let lockedScale = null;
  let stabilityFrames = 0;

  const SCALE_STEP = 0.005;
  const MAX_SCALE = 1.0;
  const REQUIRED_STABLE_FRAMES = 20;

  plane.scale.set(autoScale, autoScale, 1);

  anchor.onTargetFound = () => {
    visible = true;
    video.play();
    overlay.classList.add("ui-hidden");
    muteBtn.classList.remove("ui-hidden");
  };

  anchor.onTargetLost = () => {
    visible = false;
    video.pause();

    // reset auto-scale
    autoScale = 0.90;
    lockedScale = null;
    stabilityFrames = 0;
    plane.scale.set(autoScale, autoScale, 1);

    overlay.classList.remove("ui-hidden");
    muteBtn.classList.add("ui-hidden");
  };

  muteBtn.onclick = () => {
    video.muted = !video.muted;
    muteBtn.textContent = video.muted ? "🔇" : "🔊";
  };

  await mindarThree.start();

  renderer.setAnimationLoop(() => {
    if (visible && lockedScale === null) {
      stabilityFrames++;

      if (stabilityFrames >= REQUIRED_STABLE_FRAMES) {
        autoScale += SCALE_STEP;

        if (autoScale >= MAX_SCALE) {
          lockedScale = autoScale;
        } else {
          plane.scale.set(autoScale, autoScale, 1);
          stabilityFrames = 0;
        }
      }
    }

    material.opacity = THREE.MathUtils.lerp(
      material.opacity,
      visible ? 1 : 0,
      0.12
    );

    renderer.render(scene, camera);
  });
});
