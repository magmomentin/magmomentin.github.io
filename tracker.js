document.getElementById("start-btn").addEventListener("click", async () => {
  const startBtn = document.getElementById("start-btn");
  const video = document.getElementById("ar-video");
  const overlay = document.getElementById("ui-overlay");
  const muteBtn = document.getElementById("mute-btn");

  startBtn.classList.add("ui-hidden");

  // MUST match scan-frame exactly
  const TARGET_ASPECT = 260 / 347;

  const mindarThree = new window.MINDAR.IMAGE.MindARThree({
    container: document.body,
    imageTargetSrc: "assets/targets.mind",
    filterMinCF: 0.0001,
    filterBeta: 0.001,
  });

  const { renderer, scene, camera } = mindarThree;

  // ✅ Wait for real video dimensions
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

  // ✅ Perfect contain logic
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
      0.12
    );
    renderer.render(scene, camera);
  });
});
