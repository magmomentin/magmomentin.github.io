document.getElementById("start-btn").addEventListener("click", async () => {
  const startBtn = document.getElementById("start-btn");
  const video = document.getElementById("ar-video");
  const overlay = document.getElementById("ui-overlay");
  const hintText = document.getElementById("hint-text");
  const muteBtn = document.getElementById("mute-btn");

  startBtn.classList.add("ui-hidden");

  const TARGET_ASPECT = 354 / 472;

  const CENTER_THRESHOLD = 0.15;   // how centered
  const DWELL_TIME = 1000;         // 1s before play
  const LOSS_GRACE = 1500;         // 1.5s forgiveness

  let targetVisible = false;
  let centeredSince = null;
  let playbackLocked = false;
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
    hintText.textContent = playbackLocked ? "" : "Hold steady…";
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

    if (!playbackLocked) {
      if (targetVisible) {
        const pos = anchor.group.position;
        const centered =
          Math.abs(pos.x) < CENTER_THRESHOLD &&
          Math.abs(pos.y) < CENTER_THRESHOLD;

        if (centered) {
          if (!centeredSince) centeredSince = now;

          if (now - centeredSince >= DWELL_TIME) {
            video.play();
            playbackLocked = true;
            overlay.classList.add("ui-hidden");
            muteBtn.classList.remove("ui-hidden");
          }
        } else {
          centeredSince = null;
          hintText.textContent = "Align card to the center";
        }
      }
    } else {
      // SOFT LOCK ACTIVE
      if (!targetVisible && now - lastSeenTime > LOSS_GRACE) {
        video.pause();
        playbackLocked = false;
        centeredSince = null;
        overlay.classList.remove("ui-hidden");
        muteBtn.classList.add("ui-hidden");
        hintText.textContent = "Hold steady…";
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
