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

  /* ---------- THREE FROM MINDAR ---------- */
  const THREE = window.MINDAR.IMAGE.THREE;

  /* ---------- CONFIG ---------- */
  const FADE_SPEED = 6.0;
  const POS_SMOOTH = 0.2;   // ↓ lower = smoother
  const ROT_SMOOTH = 0.15;

  /* ---------- MINDAR INIT ---------- */
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
  const geometry = new THREE.PlaneGeometry(1, 1);
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    opacity: 0,
  });

  const plane = new THREE.Mesh(geometry, material);
  plane.position.z = 0.01;

  /* ---------- SMOOTH GROUP (INSIDE ANCHOR) ---------- */
  const smoothGroup = new THREE.Group();
  smoothGroup.add(plane);

  /* ---------- ANCHOR ---------- */
  const anchor = mindarThree.addAnchor(0);
  anchor.group.add(smoothGroup);
  anchor.group.visible = false;

  let targetOpacity = 0;
  let videoReady = false;

  const clock = new THREE.Clock();

  /* ---------- SMOOTHING STATE ---------- */
  const smoothPosition = new THREE.Vector3();
  const smoothQuaternion = new THREE.Quaternion();

  /* ---------- FIT VIDEO TO TARGET ---------- */
  function fitVideo() {
    if (!videoReady) return;

    const w = anchor.group.scale.x;
    const h = anchor.group.scale.y;

    const targetAspect = w / h;
    const videoAspect = video.videoWidth / video.videoHeight;

    let sx = w;
    let sy = h;

    if (videoAspect > targetAspect) {
      sy = w / videoAspect;
    } else {
      sx = h * videoAspect;
    }

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

    /* Keep video frames updating */
    if (!video.paused && video.readyState >= 2) {
      texture.needsUpdate = true;
    }

    /* Fade video */
    material.opacity +=
      (targetOpacity - material.opacity) *
      (1 - Math.exp(-FADE_SPEED * delta));

    if (anchor.group.visible) {
      /* POSITION smoothing */
      smoothPosition.lerp(anchor.group.position, POS_SMOOTH);
      smoothGroup.position.copy(smoothPosition);

      /* ROTATION smoothing */
      smoothQuaternion.slerp(anchor.group.quaternion, ROT_SMOOTH);
      smoothGroup.quaternion.copy(smoothQuaternion);
    }

    renderer.render(scene, camera);
  });
});
