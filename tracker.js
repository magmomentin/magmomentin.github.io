document.getElementById("start-btn").addEventListener("click", async () => {
  const startBtn = document.getElementById("start-btn");
  const video = document.getElementById("ar-video");
  const overlay = document.getElementById("ui-overlay");
  const muteBtn = document.getElementById("mute-btn");

  /* ---------- UNLOCK VIDEO ---------- */
  video.muted = true;
  try {
    await video.play();
    video.pause();
    video.currentTime = 0;
  } catch {}

  startBtn.style.display = "none";

  const THREE = window.MINDAR.IMAGE.THREE;

  /* ---------- CONFIG (IMPORTANT) ---------- */
  const FADE_SPEED = 6.0;

  const BASE_POS_SMOOTH = 0.08;   // very smooth when stable
  const BASE_ROT_SMOOTH = 0.06;

  const MOVE_POS_SMOOTH = 0.25;   // responsive when moving
  const MOVE_ROT_SMOOTH = 0.20;

  const DEAD_ZONE_POS = 0.002;    // world units
  const DEAD_ZONE_ROT = 0.002;    // quaternion delta

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
  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1),
    new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity: 0,
    })
  );
  plane.position.z = 0.01;

  /* ---------- SMOOTH GROUP ---------- */
  const smoothGroup = new THREE.Group();
  smoothGroup.add(plane);

  /* ---------- ANCHOR ---------- */
  const anchor = mindarThree.addAnchor(0);
  anchor.group.add(smoothGroup);
  anchor.group.visible = false;

  let targetOpacity = 0;
  let videoReady = false;

  const clock = new THREE.Clock();

  /* ---------- SMOOTH STATE ---------- */
  const smoothPos = new THREE.Vector3();
  const smoothQuat = new THREE.Quaternion();

  const prevPos = new THREE.Vector3();
  const prevQuat = new THREE.Quaternion();

  /* ---------- FIT VIDEO ---------- */
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

  /* ---------- TARGET EVENTS ---------- */
  anchor.onTargetFound = async () => {
    anchor.group.visible = true;
    targetOpacity = 1;

    smoothPos.copy(anchor.group.position);
    smoothQuat.copy(anchor.group.quaternion);
    prevPos.copy(anchor.group.position);
    prevQuat.copy(anchor.group.quaternion);

    fitVideo();
    await video.play();

    overlay.classList.add("ui-hidden");
    muteBtn.classList.remove("ui-hidden");
  };

  anchor.onTargetLost = () => {
    anchor.group.visible = false;
    targetOpacity = 0;
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

    materialFade(delta);

    if (anchor.group.visible) {
      const posDelta = anchor.group.position.distanceTo(prevPos);
      const rotDelta = 1 - Math.abs(anchor.group.quaternion.dot(prevQuat));

      const posSmooth =
        posDelta < DEAD_ZONE_POS
          ? BASE_POS_SMOOTH
          : MOVE_POS_SMOOTH;

      const rotSmooth =
        rotDelta < DEAD_ZONE_ROT
          ? BASE_ROT_SMOOTH
          : MOVE_ROT_SMOOTH;

      smoothPos.lerp(anchor.group.position, posSmooth);
      smoothQuat.slerp(anchor.group.quaternion, rotSmooth);

      smoothGroup.position.copy(smoothPos);
      smoothGroup.quaternion.copy(smoothQuat);

      prevPos.copy(anchor.group.position);
      prevQuat.copy(anchor.group.quaternion);
    }

    renderer.render(scene, camera);
  });

  function materialFade(delta) {
    plane.material.opacity +=
      (targetOpacity - plane.material.opacity) *
      (1 - Math.exp(-FADE_SPEED * delta));
  }
});
