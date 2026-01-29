document.getElementById("start-btn").addEventListener("click", async () => {
  const startBtn = document.getElementById("start-btn");
  const video = document.getElementById("ar-video");
  const overlay = document.getElementById("ui-overlay");
  const muteBtn = document.getElementById("mute-btn");

  /* ---------- UNLOCK VIDEO (MOBILE REQUIRED) ---------- */
  video.muted = true;
  try {
    await video.play();
    video.pause();
    video.currentTime = 0;
  } catch {}

  startBtn.style.display = "none";

  const THREE = window.MINDAR.IMAGE.THREE;

  /* ---------- CONFIG ---------- */
  const MICRO_FOLLOW = 0.03; // 3% follow only
  const MAX_OFFSET = 0.02;  // clamp movement
  const FADE_SPEED = 6.0;

  /* ---------- MINDAR ---------- */
  const mindarThree = new window.MINDAR.IMAGE.MindARThree({
    container: document.querySelector("#ar-container"),
    imageTargetSrc: "assets/targets.mind",
    filterMinCF: 0.0001,
    filterBeta: 30,
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

  /* ---------- CONTENT (LOCKED ROOT) ---------- */
  const content = new THREE.Group();
  content.add(plane);
  scene.add(content);
  content.visible = false;

  /* ---------- ANCHOR (DETECTOR ONLY) ---------- */
  const anchor = mindarThree.addAnchor(0);

  let locked = false;
  let videoReady = false;
  let targetOpacity = 0;

  const basePos = new THREE.Vector3();
  const baseQuat = new THREE.Quaternion();

  const tempPos = new THREE.Vector3();
  const clock = new THREE.Clock();

  /* ---------- FIT VIDEO ---------- */
  function fitVideo() {
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
  });

  /* ---------- TARGET FOUND ---------- */
  anchor.onTargetFound = async () => {
    if (locked) return;

    // SNAP ONCE
    basePos.copy(anchor.group.position);
    baseQuat.copy(anchor.group.quaternion);

    content.position.copy(basePos);
    content.quaternion.copy(baseQuat);
    content.scale.copy(anchor.group.scale);

    fitVideo();

    content.visible = true;
    locked = true;

    await video.play();

    overlay.classList.add("ui-hidden");
    muteBtn.classList.remove("ui-hidden");
  };

  /* ---------- TARGET LOST ---------- */
  anchor.onTargetLost = () => {
    locked = false;
    content.visible = false;
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

    // Fade in
    material.opacity +=
      (targetOpacity - material.opacity) *
      (1 - Math.exp(-FADE_SPEED * delta));

    if (locked) {
      // MICRO FOLLOW (VERY SLOW, CLAMPED)
      tempPos.subVectors(anchor.group.position, basePos);
      tempPos.clampLength(0, MAX_OFFSET);

      content.position.lerp(
        basePos.clone().addScaledVector(tempPos, MICRO_FOLLOW),
        0.1
      );
    }

    renderer.render(scene, camera);
  });
});
