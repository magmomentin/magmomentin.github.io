const start = async () => {

  const mindarThree = new window.MINDAR.IMAGE.MindARThree({
    container: document.body,
    imageTargetSrc: "assets/targets.mind",
    uiScanning: false,
    uiLoading: false
  });

  const { renderer, scene, camera } = mindarThree;

  const anchor = mindarThree.addAnchor(0);

  // Video element
  const video = document.createElement("video");
  video.src = "assets/demo.mp4";
  video.loop = false;
  video.muted = true;
  video.playsInline = true;

  const texture = new THREE.VideoTexture(video);
  const material = new THREE.MeshBasicMaterial({ map: texture });

  // 3:4 ratio plane
  const geometry = new THREE.PlaneGeometry(1, 1.33);
  const plane = new THREE.Mesh(geometry, material);
  anchor.group.add(plane);

  // UI
  const hint = document.getElementById("hint");
  const controls = document.getElementById("controls");
  const replayBtn = document.getElementById("replay");
  const soundBtn = document.getElementById("sound");
  const brand = document.getElementById("brand");

  // Optional chime
  const chime = new Audio("assets/chime.mp3");

  anchor.onTargetFound = () => {
    hint.classList.add("hidden");
    controls.classList.remove("hidden");
    brand.classList.remove("hidden");

    video.play();
    chime.play().catch(() => {});
  };

  anchor.onTargetLost = () => {
    video.pause();
  };

  replayBtn.onclick = () => {
    video.currentTime = 0;
    video.play();
  };

  soundBtn.onclick = () => {
    video.muted = !video.muted;
    soundBtn.innerText = video.muted ? "🔇" : "🔊";
  };

  await mindarThree.start();

  renderer.setAnimationLoop(() => {
    renderer.render(scene, camera);
  });
};

start();
