document.getElementById("start-btn").addEventListener("click", async () => {
  const startBtn = document.getElementById("start-btn");
  const video = document.getElementById("ar-video");
  const overlay = document.getElementById("ui-overlay");
  const muteBtn = document.getElementById("mute-btn");

  startBtn.style.display = "none";

  /* ✅ BIND THREE FROM MINDAR */
  const THREE = window.MINDAR.IMAGE.THREE;

  /* ---------- CONFIG ---------- */
  const FADE_SPEED = 6.0;

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

  /* ---------- PLANE ---------- */
  const geometry = new THREE.PlaneGeometry(1, 1);
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    opacity: 0,
  });

  const plane = new THREE.Mesh(geometry, material);
  plane.position.z = 0.01;

  /* ---------- ANCHOR ---------- */
  const anchor = mindarThree.addAnchor(0);
  anchor.group.add(plane);

  let targetOpacity = 0;
  let targetVisible = false;
  let videoReady = false;

  const clock = new THREE.Clock();

  /* ---------- FIT VIDEO INSIDE TARGET ---------- */
  function fitVideoToTarget() {
    if (!targetVisible || !videoReady) return;

    const targetW = anchor.group.scale.x;
    const targetH = anchor.group.scale.y;

    const targetAspect = targetW / targetH;
    const videoAspect = video.videoWidth / video.videoHeight;

    let scaleX = targetW;
    let scaleY = targetH;

    if (videoAspect > targetAspect) {
      scaleY = targetW / videoAspect;
    } else {
      scaleX = targetH * videoAspect;
    }

    plane.scale.set(scaleX, scaleY, 1);
  }

  video.addEventListener("loadedmetadata", () => {
    videoReady = true;
    fitVideoToTarget();
  });

  anchor.onTargetFound = () => {
    targetVisible = true;
    targetOpacity = 1;
    fitVideoToTarget();

    video.play();
    overlay.classList.add("ui-hidden");
    muteBtn.classList.remove("ui-hidden");
  };

  anchor.onTargetLost = () => {
    targetVisible = false;
    targetOpacity = 0;

    video.pause();
    overlay.classList.remove("ui-hidden");
    muteBtn.classList.add("ui-hidden");
  };

  muteBtn.onclick = () => {
    video.muted = !video.muted;
    muteBtn.textContent = video.muted ? "🔇" : "🔊";
  };

  /* ---------- FULLSCREEN TAP ---------- */
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();

  window.addEventListener("click", (e) => {
    if (e.target.id === "mute-btn") return;

    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(pointer, camera);
    if (raycaster.intersectObject(plane).length > 0) {
      if (video.requestFullscreen) {
        video.requestFullscreen();
      } else if (video.webkitEnterFullscreen) {
        video.webkitEnterFullscreen();
      }
    }
  });

  /* ---------- START ---------- */
  await mindarThree.start();
  overlay.classList.remove("ui-hidden");

  /* ✅ SAFE RESIZE HANDLING */
  window.addEventListener("resize", () => {
    mindarThree.resize();
  });

  renderer.setAnimationLoop(() => {
    const delta = clock.getDelta();
    material.opacity +=
      (targetOpacity - material.opacity) *
      (1 - Math.exp(-FADE_SPEED * delta));

    renderer.render(scene, camera);
  });
});
