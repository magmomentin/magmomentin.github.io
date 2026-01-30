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
  const videoTexture = new THREE.VideoTexture(video);
  videoTexture.minFilter = THREE.LinearFilter;
  videoTexture.magFilter = THREE.LinearFilter;
  videoTexture.colorSpace = THREE.SRGBColorSpace;

  /* ---------- ROUNDED CORNER MASK (CANVAS) ---------- */
  function createRoundedMask(size = 512, radius = 60) {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, size, size);
    ctx.fillStyle = "white";

    ctx.beginPath();
    ctx.moveTo(radius, 0);
    ctx.lineTo(size - radius, 0);
    ctx.quadraticCurveTo(size, 0, size, radius);
    ctx.lineTo(size, size - radius);
    ctx.quadraticCurveTo(size, size, size - radius, size);
    ctx.lineTo(radius, size);
    ctx.quadraticCurveTo(0, size, 0, size - radius);
    ctx.lineTo(0, radius);
    ctx.quadraticCurveTo(0, 0, radius, 0);
    ctx.closePath();
    ctx.fill();

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    return texture;
  }

  const alphaMask = createRoundedMask(512, 70);

  /* ---------- PLANE (INSIDE ANCHOR — SAFE) ---------- */
  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1),
    new THREE.MeshBasicMaterial({
      map: videoTexture,
      alphaMap: alphaMask,
      transparent: true,
    })
  );

  plane.position.z = 0.01;

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
    if (!video.paused && video.readyState >= 2) {
      videoTexture.needsUpdate = true;
    }
    renderer.render(scene, camera);
  });
});
