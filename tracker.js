document.getElementById("start-btn").addEventListener("click", async () => {
  const startBtn = document.getElementById("start-btn");
  const video = document.getElementById("ar-video");
  const overlay = document.getElementById("ui-overlay");
  const hintText = document.getElementById("hint-text");
  const muteBtn = document.getElementById("mute-btn");

  startBtn.classList.add("ui-hidden");

  const TARGET_ASPECT = 354 / 472;

  const DWELL_TIME = 500;    // small delay to avoid accidental flicker
  const LOSS_GRACE = 1500;   // customer-friendly forgiveness

  let targetVisible = false;
  let playbackLocked = false;
  let playRequestTime = null;
  let lastSeenTime = null;

  const mindarThree = new window.MINDAR.IMAGE.MindARThree({
    container: document.body,
    imageTargetSrc: "assets/targets.mind",
  });

  const { renderer, scene, camera } = mindarThree;

  await new Promise((resolve) => {
    if (video.readyState >= 1) resolve();
    else video.onloadedmetadata = () => resolve();
  });

  video.muted = true;
  muteBtn.textContent = "🔇";

  const videoAspect = video.videoWidth / video.videoHeight;

  const texture = new THREE.VideoTexture(video);
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    opacity: 0,
  });

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

  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(planeWidth, planeHeight),
    material
  );
  plane.position.set(0, 0, 0.01);

  const anchor = mindarThree.addAnchor(0);
  anchor.group.add(plane);

  anchor.onTargetFound = () => {
    targetVisible = true;
    lastSeenTime = performance.now();
    playRequestTime = performance.now();
    hintText.textContent = "Hold steady…";
  };

  anchor.onTargetLost = () => {
    targetVisible = false;
    lastSeenTime = performance.now();
  };

  muteBtn.onclick = () => {
    video.muted = !video.muted;
    muteBtn.textContent = video.muted ? "🔇" : "🔊";
  };

  await mindarThree.start();

  renderer.setAnimationLoop(() => {
    const now = performance.now();

    // Start playback after small dwell (no centering required)
    if (!playbackLocked && targetVisible) {
      if (now - playRequestTime >= DWELL_TIME) {
        video.play();
        playbackLocked = true;
        overlay.classList.add("ui-hidden");
        muteBtn.classList.remove("ui-hidden");
      }
    }

    // Soft-lock behavior
    if (playbackLocked && !targetVisible) {
      if (now - lastSeenTime > LOSS_GRACE) {
        video.pause();
        playbackLocked = false;
        overlay.classList.remove("ui-hidden");
        muteBtn.classList.add("ui-hidden");
        hintText.textContent = "Point camera at the card";
      }
    }

    material.opacity = THREE.MathUtils.lerp(
      material.opacity,
      playbackLocked ? 1 : 0,
      0.12
    );

    renderer.render(scene, camera);
  });
});
