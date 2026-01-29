document.getElementById("start-btn").addEventListener("click", async () => {
  const startBtn = document.getElementById("start-btn");
  const video = document.getElementById("ar-video");
  const overlay = document.getElementById("ui-overlay");
  const muteBtn = document.getElementById("mute-btn");

  /* ---- REQUIRED: unlock video on user gesture ---- */
  video.muted = true;
  await video.play();
  video.pause();
  video.currentTime = 0;

  startBtn.style.display = "none";

  const THREE = window.MINDAR.IMAGE.THREE;

  const mindarThree = new window.MINDAR.IMAGE.MindARThree({
    container: document.querySelector("#ar-container"),
    imageTargetSrc: "assets/targets.mind",
  });

  const { renderer, scene, camera } = mindarThree;

  /* ---- VIDEO TEXTURE ---- */
  const texture = new THREE.VideoTexture(video);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.colorSpace = THREE.SRGBColorSpace;

  /* ---- PLANE (INSIDE ANCHOR) ---- */
  const geometry = new THREE.PlaneGeometry(1, 1);
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
  });

  const plane = new THREE.Mesh(geometry, material);
  plane.position.z = 0.01;

  /* ---- ANCHOR ---- */
  const anchor = mindarThree.addAnchor(0);
  anchor.group.add(plane);
  anchor.group.visible = false;

  /* ---- TARGET FOUND ---- */
  anchor.onTargetFound = async () => {
    anchor.group.visible = true;
    await video.play();
    muteBtn.classList.remove("ui-hidden");
    overlay.classList.add("ui-hidden");
  };

  /* ---- TARGET LOST ---- */
  anchor.onTargetLost = () => {
    anchor.group.visible = false;
    video.pause();
    muteBtn.classList.add("ui-hidden");
    overlay.classList.remove("ui-hidden");
  };

  /* ---- MUTE ---- */
  muteBtn.onclick = () => {
    video.muted = !video.muted;
    muteBtn.textContent = video.muted ? "🔇" : "🔊";
  };

  /* ---- START ---- */
  await mindarThree.start();

  renderer.setAnimationLoop(() => {
    if (!video.paused && video.readyState >= 2) {
      texture.needsUpdate = true;
    }
    renderer.render(scene, camera);
  });
});
