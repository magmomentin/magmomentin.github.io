document.getElementById("start-btn").addEventListener("click", async () => {
  const startBtn = document.getElementById("start-btn");
  const video = document.getElementById("ar-video");
  const overlay = document.getElementById("ui-overlay");
  const muteBtn = document.getElementById("mute-btn");

  startBtn.classList.add("ui-hidden");

  const mindarThree = new window.MINDAR.IMAGE.MindARThree({
    container: document.body,
    imageTargetSrc: "assets/targets.mind",
    filterMinCF: 0.0001,
    filterBeta: 0.001,
  });

  const { renderer, scene, camera } = mindarThree;

  /* ---------- VIDEO TEXTURE ---------- */
  const texture = new THREE.VideoTexture(video);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.format = THREE.RGBAFormat;

  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    opacity: 0,
  });

  /* ---------- PERFECT 3:4 PLANE ---------- */
  const CARD_WIDTH = 1;
  const CARD_HEIGHT = 4 / 3; // 3:4 portrait

  const geometry = new THREE.PlaneGeometry(
    CARD_WIDTH,
    CARD_HEIGHT
  );

  const plane = new THREE.Mesh(geometry, material);
  plane.position.set(0, 0, 0.01);
  plane.rotation.set(0, 0, 0);

  const anchor = mindarThree.addAnchor(0);
  anchor.group.add(plane);

  let visible = false;

  anchor.onTargetFound = () => {
    visible = true;
    video.play();
    overlay.classList.add("ui-hidden");
    muteBtn.classList.remove("ui-hidden");
  };

  anchor.onTargetLost = () => {
    visible = false;
    video.pause();
    overlay.classList.remove("ui-hidden");
    muteBtn.classList.add("ui-hidden");
  };

  muteBtn.onclick = () => {
    video.muted = !video.muted;
    muteBtn.textContent = video.muted ? "🔇" : "🔊";
  };

  await mindarThree.start();

  renderer.setAnimationLoop(() => {
    material.opacity = THREE.MathUtils.lerp(
      material.opacity,
      visible ? 1 : 0,
      0.1
    );
    renderer.render(scene, camera);
  });
});
