document.getElementById("start-btn").addEventListener("click", async () => {
  const startBtn = document.getElementById("start-btn");
  const video = document.getElementById("ar-video");
  const overlay = document.getElementById("ui-overlay");
  const hintText = document.getElementById("hint-text");
  const muteBtn = document.getElementById("mute-btn");

  startBtn.classList.add("ui-hidden");

  const TARGET_ASPECT = 354 / 472;

  const CENTER_THRESHOLD = 0.15;   // how close to center
  const DWELL_TIME = 1000;         // 1 second

  let visible = false;
  let centeredSince = null;
  let isPlaying = false;

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
    visible = true;
    centeredSince = null;
    hintText.textContent = "Hold steady…";
  };

  anchor.onTargetLost = () => {
    visible = false;
    centeredSince = null;

    if (isPlaying) {
      video.pause();
      isPlaying = false;
    }

    overlay.classList.remove("ui-hidden");
    muteBtn.classList.add("ui-hidden");
    hintText.textContent = "Align card to the center";
  };

  muteBtn.onclick = () => {
    video.muted = !video.muted;
    muteBtn.textContent = video.muted ? "🔇" : "🔊";
  };

  await mindarThree.start();

  renderer.setAnimationLoop(() => {
    if (visible) {
      const pos = anchor.group.position;

      const isCentered =
        Math.abs(pos.x) < CENTER_THRESHOLD &&
        Math.abs(pos.y) < CENTER_THRESHOLD;

      if (isCentered) {
        if (!centeredSince) centeredSince = performance.now();

        if (
          performance.now() - centeredSince >= DWELL_TIME &&
          !isPlaying
        ) {
          video.play();
          isPlaying = true;
          overlay.classList.add("ui-hidden");
          muteBtn.classList.remove("ui-hidden");
        }
      } else {
        centeredSince = null;

        if (isPlaying) {
          video.pause();
          isPlaying = false;
          overlay.classList.remove("ui-hidden");
          muteBtn.classList.add("ui-hidden");
          hintText.textContent = "Hold steady…";
        }
      }
    }

    material.opacity = THREE.MathUtils.lerp(
      material.opacity,
      isPlaying ? 1 : 0,
      0.12
    );

    renderer.render(scene, camera);
  });
});
