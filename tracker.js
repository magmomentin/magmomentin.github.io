document.getElementById("start-btn").addEventListener("click", async () => {
  const startBtn = document.getElementById("start-btn");
  const video = document.getElementById("ar-video");
  const overlay = document.getElementById("ui-overlay");
  const muteBtn = document.getElementById("mute-btn");

  startBtn.classList.add("ui-hidden");

  // Target aspect (354 x 472)
  const TARGET_ASPECT = 0.75;

  const mindarThree = new window.MINDAR.IMAGE.MindARThree({
    container: document.body,
    imageTargetSrc: "assets/targets.mind",
    filterMinCF: 0.0001,
    filterBeta: 0.001,
  });

  const { renderer, scene, camera } = mindarThree;

  /* ---------- VIDEO ---------- */
  await video.play();   // only to read dimensions
  video.pause();

  const videoAspect = video.videoWidth / video.videoHeight;

  const texture = new THREE.VideoTexture(video);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;

  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    opacity: 0,
  });

  /* ---------- VIDEO SIZE & PLACEMENT (FIXED & CLEAN) ---------- */

  // Target size in AR units
  const TARGET_WIDTH = 1;
  const TARGET_HEIGHT = TARGET_WIDTH / TARGET_ASPECT;

  let planeWidth, planeHeight;

  // Contain video inside target
  if (videoAspect > TARGET_ASPECT) {
    // video wider → limit by width
    planeWidth = TARGET_WIDTH;
    planeHeight = TARGET_WIDTH / videoAspect;
  } else {
    // video taller → limit by height
    planeHeight = TARGET_HEIGHT;
    planeWidth = TARGET_HEIGHT * videoAspect;
  }

  const geometry = new THREE.PlaneGeometry(planeWidth, planeHeight);
  const plane = new THREE.Mesh(geometry, material);

  // Centered on target, slightly forward
  plane.position.set(0, 0, 0.01);

  const anchor = mindarThree.addAnchor(0);
  anchor.group.add(plane);

  let visible = false;

  anchor.onTargetFound = () => {
    visible = true;
    video.currentTime = 0;
    video.play();
    overlay.classList.add("ui-hidden");
    muteBtn.classList.remove("ui-hidden");
  };

  anchor.onTargetLost = () => {
    visible = false;
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
    // Fade only — NO resizing
    material.opacity = THREE.MathUtils.lerp(
      material.opacity,
      visible ? 1 : 0,
      0.1
    );
    renderer.render(scene, camera);
  });
});
