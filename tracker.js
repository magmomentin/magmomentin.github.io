document.getElementById("start-btn").addEventListener("click", async () => {
  const startBtn = document.getElementById("start-btn");
  const video = document.getElementById("ar-video");
  const overlay = document.getElementById("ui-overlay");
  const muteBtn = document.getElementById("mute-btn");

  /* ---------- UNLOCK VIDEO (MOBILE) ---------- */
  video.muted = true;
  try {
    await video.play();
    video.pause();
    video.currentTime = 0;
  } catch {}

  startBtn.style.display = "none";

  const THREE = window.MINDAR.IMAGE.THREE;

  /* ---------- CONFIG ---------- */
  const FADE_SPEED = 6.0;

  const STABLE_FRAMES_REQUIRED = 20;
  const POS_THRESHOLD = 0.0015;
  const ROT_THRESHOLD = 0.0015;

  /* ---------- MINDAR ---------- */
  const mindarThree = new window.MINDAR.IMAGE.MindARThree({
    container: document.querySelector("#ar-container"),
    imageTargetSrc: "assets/targets.mind",
    filterMinCF: 0.001,
    filterBeta: 10,
  });

  const { renderer, scene, camera } = mindarThree;

  /* ---------- VIDEO TEXTURE ---------- */
  const texture = new THREE.VideoTexture(video);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.colorSpace = THREE.SRGBColorSpace;

  /* ---------- PLANE ---------- */
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    opacity: 0,
  });

  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1),
    material
  );
  plane.position.z = 0.01;

  /* ---------- LOCK GROUP (INSIDE ANCHOR) ---------- */
  const lockGroup = new THREE.Group();
  lockGroup.add(plane);

  /* ---------- ANCHOR ---------- */
  const anchor = mindarThree.addAnchor(0);
  anchor.group.add(lockGroup);
  anchor.group.visible = false;

  let videoReady = false;
  let targetOpacity = 0;
  let locked = false;
  let stableFrames = 0;

  const lastPos = new THREE.Vector3();
  const lastQuat = new THREE.Quaternion();

  const clock = new THREE.Clock();

  /* ---------- FIT VIDEO TO TARGET ---------- */
  function fitVideo() {
    if (!videoReady) return;

    const w = anchor.group.scale.x;
    const h = anchor.group.scale.y;

    const ta = w / h;
    const va = video.videoWidth / video.videoHeight;

    let sx = w;
    let sy = h;

    if (va > ta) sy = w / va;
    else sx = h * va;

    plane.scale.set(sx, sy, 1);
  }

  video.addEventListener("loadedmetadata", () => {
    videoReady = true;
    fitVideo();
  });

  /* ---------- TARGET FOUND ---------- */
  anchor.onTargetFound = async () => {
    anchor.group.visible = true;
    targetOpacity = 1;

    locked = false;
    stableFrames = 0;

    lastPos.copy(anchor.group.position);
    lastQuat.copy(anchor.group.quaternion);

    fitVideo();
    await video.play();

    overlay.classList.add("ui-hidden");
    muteBtn.classList.remove("ui-hidden");
  };

  /* ---------- TARGET LOST ---------- */
  anchor.onTargetLost = () => {
    anchor.group.visible = false;
    targetOpacity = 0;
    locked = false;

    video.pause();

    overlay.classList.remove("ui-hidden");
    muteBtn.classList.add("ui-hidden");
  };

  /* ---------- MUTE ---------- */
  muteBtn.onclick = () => {
    video.muted = !video.muted;
    muteBtn.textContent = video.muted ? "🔇" : "🔊";
  };

  /* ---------- START ---------- */
  await mindarThree.start();
  overlay.classList.remove("ui-hidden");

  window.addEventListener("resize", () => mindarThree.resize());

  /* ---------- RENDER LOOP ---------- */
  renderer.setAnimationLoop(() => {
    const delta = clock.getDelta();

    if (!video.paused && video.readyState >= 2) {
      texture.needsUpdate = true;
    }

    material.opacity +=
      (targetOpacity - material.opacity) *
      (1 - Math.exp(-FADE_SPEED * delta));

    if (anchor.group.visible && !locked) {
      const posDelta = anchor.group.position.distanceTo(lastPos);
      const rotDelta =
        1 - Math.abs(anchor.group.quaternion.dot(lastQuat));

      if (
        posDelta < POS_THRESHOLD &&
        rotDelta < ROT_THRESHOLD
      ) {
        stableFrames++;
      } else {
        stableFrames = 0;
      }

      if (stableFrames >= STABLE_FRAMES_REQUIRED) {
        // 🔒 LOCK (stop updating, but stay in anchor)
        locked = true;
      }

      lastPos.copy(anchor.group.position);
      lastQuat.copy(anchor.group.quaternion);
    }

    renderer.render(scene, camera);
  });
});
