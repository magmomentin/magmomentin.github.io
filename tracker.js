const start = document.getElementById("start");
const video = document.getElementById("video");
const scanningOverlay = document.getElementById("scanning-overlay");
const muteToggle = document.getElementById("mute-toggle");

start.onclick = async () => {
  start.remove();
  scanningOverlay.classList.remove("hidden");

  const mindar = new window.MINDAR.IMAGE.MindARThree({
    container: document.body,
    imageTargetSrc: "assets/targets.mind",
    filterMinCF: 0.0001,
    filterBeta: 0.001,
  });

  const { renderer, scene, camera } = mindar;
  const texture = new THREE.VideoTexture(video);
  const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, opacity: 0 });
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1.5), material);
  const anchor = mindar.addAnchor(0);
  anchor.group.add(plane);

  let isTargetVisible = false;

  anchor.onTargetFound = () => {
    isTargetVisible = true;
    video.play();
    scanningOverlay.classList.add("hidden");
    muteToggle.classList.remove("hidden");
  };

  anchor.onTargetLost = () => {
    isTargetVisible = false;
    video.pause();
    scanningOverlay.classList.remove("hidden");
    muteToggle.classList.add("hidden");
  };

  muteToggle.onclick = (e) => {
    e.stopPropagation();
    video.muted = !video.muted;
    muteToggle.innerText = video.muted ? "🔇" : "🔊";
  };

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  window.addEventListener('click', (e) => {
    if (!isTargetVisible || e.target.id === 'mute-toggle') return;
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(plane);
    if (intersects.length > 0) {
      if (video.requestFullscreen) video.requestFullscreen();
      else if (video.webkitEnterFullscreen) video.webkitEnterFullscreen();
    }
  });

  await mindar.start();
  renderer.setAnimationLoop(() => {
    material.opacity = THREE.MathUtils.lerp(material.opacity, isTargetVisible ? 1 : 0, 0.1);
    renderer.render(scene, camera);
  });
};