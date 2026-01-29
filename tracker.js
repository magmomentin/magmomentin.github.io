const startButton = document.getElementById("startButton");
const muteBtn = document.getElementById("mute-btn");
const overlay = document.getElementById("overlay");
const guide = document.getElementById("guide-box");
const video = document.getElementById("video");

// Audio Toggle Logic
muteBtn.onclick = () => {
  video.muted = !video.muted;
  muteBtn.innerText = video.muted ? "🔇" : "🔊";
};

startButton.onclick = async () => {
  overlay.style.display = "none";
  guide.style.display = "block";
  muteBtn.style.display = "block";

  const mindarThree = new window.MINDAR.IMAGE.MindARThree({
    container: document.body,
    imageTargetSrc: "assets/target.mind",
    uiLoading: "no",
    uiScanning: "no"
  });

  const { renderer, scene, camera } = mindarThree;

  const texture = new THREE.VideoTexture(video);
  texture.encoding = THREE.sRGBEncoding;

  // 3:4 Aspect Ratio (Width 0.75, Height 1.0)
  const geometry = new THREE.PlaneGeometry(0.75, 1);
  const material = new THREE.MeshBasicMaterial({ map: texture });
  const plane = new THREE.Mesh(geometry, material);
  plane.position.z = 0.01; // Avoid Z-fighting

  const anchor = mindarThree.addAnchor(0);
  anchor.group.add(plane);

  anchor.onTargetFound = () => {
    guide.style.display = "none";
    video.play().catch(e => console.error("Play error:", e));
  };

  anchor.onTargetLost = () => {
    guide.style.display = "block";
    video.pause();
  };

  try {
    await mindarThree.start();
    renderer.setAnimationLoop(() => {
      renderer.render(scene, camera);
    });
  } catch (error) {
    console.error("Camera/HTTPS error:", error);
  }
};
