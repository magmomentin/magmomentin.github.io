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

  /* ---------- MINDAR (MAX STABILITY CONFIG) ---------- */
  const mindarThree = new window.MINDAR.IMAGE.MindARThree({
    container: document.querySelector("#ar-container"),
    imageTargetSrc: "assets/targets.mind",
    filterMinCF: 0.0001,
    filterBeta: 40, // VERY strong internal smoothing
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
      opacity: 1,
    })
  );
  plane.position.z = 0.01;

  /* ---------- CONTENT ROOT (STATIC) ---------- */
  const content = new THREE.Group();
  content.add(plane);
  scene.add(content);
  content.visible = false;

  /* ---------- ANCHOR ---------- */
  const anchor = mindarThree.addAnchor(0);

  let videoReady = false;
  let locked = false;

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
    content.position.copy(anchor.group.position);
    content.quaternion.copy(anchor.group.quaternion);
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
    if (!video.paused && video.readyState >= 2) {
      texture.needsUpdate = true;
    }
    renderer.render(scene, camera);
  });
});
