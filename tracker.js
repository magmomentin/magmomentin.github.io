document.getElementById("start-btn").addEventListener("click", async () => {
  const startBtn = document.getElementById("start-btn");
  const video = document.getElementById("ar-video");
  const overlay = document.getElementById("ui-overlay");
  const muteBtn = document.getElementById("mute-btn");

  /* ---------- 🔓 VIDEO UNLOCK (CRITICAL FIX) ---------- */
  video.muted = true;
  try {
    await video.play();   // user gesture context
    video.pause();        // keep it unlocked
    video.currentTime = 0;
  } catch (e) {
    console.warn("Video unlock failed", e);
  }

  startBtn.style.display = "none";

  /* ---------- THREE FROM MINDAR ---------- */
  const THREE = window.MINDAR.IMAGE.THREE;

  /* ---------- CONFIG ---------- */
  const FADE_SPEED = 6.0;
  const SMOOTH_POS = 0.18;
  const SMOOTH_ROT = 0.15;
  const SMOOTH_SCALE = 0.20;

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

  /* ---------- SMOOTH GROUP ---------- */
  const smoothGroup = new THREE.Group();
  smoothGroup.add(plane);
  scene.add(smoothGroup);

  /* ---------- ANCHOR ---------- */
  const anchor = mindarThree.addAnchor(0);
  anchor.group.visible = false;

  let targetOpacity = 0;
  let targetVisible = false;
  let videoReady = false;

  const clock = new THREE.Clock();

  /* ---------- FIT VIDEO ---------- */
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

  /* ---------- TARGET EVENTS ---------- */
  anchor.onTargetFound = async () => {
    targetVisible = true;
    targetOpacity = 1;
    anchor.group.visible = true;

    fitVideoToTarget();

    try {
      await video.play(); // now ALWAYS works
    } catch (e) {
      console.warn("Play blocked", e);
    }

    overlay.classList.add("ui-hidden");
    muteBtn.classList.remove("ui-hidden");
  };

  anchor.onTargetLost = () => {
    targetVisible = false;
    targetOpacity = 0;
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

  window.addEventListener("resize", () => {
    mindarThree.resize();
  });

  /* ---------- RENDER LOOP ---------- */
  renderer.setAnimationLoop(() => {
    const delta = clock.getDelta();

    material.opacity +=
      (targetOpacity - material.opacity) *
      (1 - Math.exp(-FADE_SPEED * delta));

    if (anchor.group.visible) {
      smoothGroup.position.lerp(anchor.group.position, SMOOTH_POS);
      smoothGroup.quaternion.slerp(anchor.group.quaternion, SMOOTH_ROT);
      smoothGroup.scale.lerp(anchor.group.scale, SMOOTH_SCALE);
    }

    renderer.render(scene, camera);
  });
});
