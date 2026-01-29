document.getElementById("start-btn").addEventListener("click", async () => {
  const startBtn = document.getElementById("start-btn");
  const video = document.getElementById("ar-video");
  const overlay = document.getElementById("ui-overlay");
  const muteBtn = document.getElementById("mute-btn");

  /* ---------- 🔓 UNLOCK VIDEO ---------- */
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
  const SMOOTH = 0.18;

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

    material.opacity +=
      (targetOpacity - material.opacity) *
      (1 - Math.exp(-FADE_SPEED * delta));

    /* 🔥 JITTER SMOOTHING (SAFE) */
    smoothGroup.position.lerp(new THREE.Vector3(0, 0, 0), SMOOTH);
    smoothGroup.quaternion.slerp(
      new THREE.Quaternion(),
      SMOOTH
    );

    renderer.render(scene, camera);
  });
});
