const start = async () => {

  const mindarThree = new window.MINDAR.IMAGE.MindARThree({
    container: document.body,
    imageTargetSrc: "assets/targets.mind",
    uiScanning: false,
    uiLoading: false
  });

  const { renderer, scene, camera } = mindarThree;

  const anchor = mindarThree.addAnchor(0);

  const video = document.createElement("video");
  video.src = "assets/demo.mp4";
  video.loop = false;
  video.muted = true;
  video.playsInline = true;

  const texture = new THREE.VideoTexture(video);
  const material = new THREE.MeshBasicMaterial({ map: texture });

  const geometry = new THREE.PlaneGeometry(1, 1.33); // 3:4
  const plane = new THREE.Mesh(geometry, material);

  anchor.group.add(plane);

  const hint = document.getElementById("hint");
  const controls = document.getElementById("controls");
  const replayBtn = document.getElementById("replay");
  const soundBtn = document.getElementById("sound");
  const brand = document.getElementById("brand");

  anchor.onTargetFound = () => {
    hint.classList.add("hidden");
    controls.classList.remove("hidden");
    brand.classList.remove("hidden");
    video.play();
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
