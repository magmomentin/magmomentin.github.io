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

  /* ---------- MINDAR INIT ---------- */
  const mindarThree = new window.MINDAR.IMAGE.MindARThree({
    container: document.querySelector("#ar-container"),
    imageTargetSrc: "assets/targets.mind",
  });

  const { renderer, scene, camera } = mindarThree;

  /* ---------- VIDEO TEXTURE ---------- */
  const texture = new THREE.VideoTexture(video);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.colorSpace = THREE.SRGBColorSpace;

  /* ---------- PLANE (MUST STAY IN ANCHOR) ---------- */
  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1),
    new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
    })
  );

  // baseline depth
  plane.position.z = 0.01;

  // tiny local damping state (SAFE)
  const smoothZ = { value: 0.01 };

  /* ---------- ANCHOR ---------- */
  const anchor = mindarThree.addAnchor(0);
  anchor.group.add(plane);
  anchor.group.visible = false;

  /* ---------- TARGET FOUND ---------- */
  anchor.onTargetFound = async () => {
    anchor.group.visible = true;
    await video.play();
    overlay.classList.add("ui-hidden");
    muteBtn.classList.remove("ui-hidden");
  };

  /* ---------- TARGET LOST ---------- */
  anchor.onTargetLost = () => {
    anchor.group.visible = false;
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

  /* ---------- RENDER LOOP ---------- */
  renderer.setAnimationLoop(() => {
    // keep video texture updating
    if (!video.paused && video.readyState >= 2) {
      texture.needsUpdate = true;
    }

    // ultra-light, safe damping (does NOT affect tracking)
    smoothZ.value += (0.01 - smoothZ.value) * 0.08;
    plane.position.z = smoothZ.value;

    renderer.render(scene, camera);
  });
});
