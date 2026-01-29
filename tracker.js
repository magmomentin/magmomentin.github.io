document.getElementById("start-btn").addEventListener("click", async () => {
  const startBtn = document.getElementById("start-btn");
  const video = document.getElementById("ar-video");
  const overlay = document.getElementById("ui-overlay");
  const muteBtn = document.getElementById("mute-btn");

  startBtn.classList.add("ui-hidden");

  /* 🔴 CHANGE THIS PER TARGET */
  const TARGET_ASPECT = 3 / 4; // width / height

  const mindarThree = new window.MINDAR.IMAGE.MindARThree({
    container: document.body,
    imageTargetSrc: "assets/targets.mind",
    filterMinCF: 0.0001,
    filterBeta: 0.001,
  });

  const { renderer, scene, camera } = mindarThree;

  /* ---------- VIDEO ---------- */
  await video.play(); // needed to read dimensions
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

  /* ---------- FIT VIDEO INSIDE TARGET ---------- */
  let planeWidth = 1;
  let planeHeight = 1 / TARGET_ASPECT;

  // contain logic
  if (videoAspect > TARGET_ASPECT) {
    // video is wider → limit width
    planeWidth = 1;
    planeHeight = 1 / videoAspect;
  } else {
    // video is taller → limit height
    planeHeight = 1 / TARGET_ASPECT;
    planeWidth = planeHeight * videoAspect;
  }

  const geometry = new THREE.PlaneGeometry(planeWidth, planeHeight);
  const plane = new THREE.Mesh(geometry, material);

  plane.position.set(0, 0, 0.01);

  const anchor = mindarThree.addAnchor(0);
  anchor.group.add(plane);

  let visible = false;

  anchor.onTargetFound = () => {
    visible = true;
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
    material.opacity = THREE.MathUtils.lerp(
      material.opacity,
      visible ? 1 : 0,
      0.1
    );
    renderer.render(scene, camera);
  });
});
