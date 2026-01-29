const start = document.getElementById("start");
const overlay = document.getElementById("ui-overlay");
const video = document.getElementById("video");

start.onclick = async () => {
  // Hide UI
  overlay.style.display = "none";

  // Initialize MindAR with Three.js
  const mindar = new window.MINDAR.IMAGE.MindARThree({
    container: document.body,
    imageTargetSrc: "assets/targets.mind"
  });

  const { renderer, scene, camera } = mindar;

  // Create Video Texture
  const texture = new THREE.VideoTexture(video);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.format = THREE.RGBAFormat;

  // Standard geometry (Width 1, Height 1.5 for a 2:3 vertical photo)
  // Adjust to 1.5, 1 if your target is horizontal.
  const geometry = new THREE.PlaneGeometry(1, 1.5);
  const material = new THREE.MeshBasicMaterial({ 
    map: texture,
    transparent: true,
    side: THREE.DoubleSide 
  });

  const plane = new THREE.Mesh(geometry, material);
  plane.visible = false;

  // Add anchor for the first target in the .mind file
  const anchor = mindar.addAnchor(0);
  anchor.group.add(plane);

  // Interaction logic
  anchor.onTargetFound = () => {
    plane.visible = true;
    video.play();
    console.log("Target detected");
  };

  anchor.onTargetLost = () => {
    plane.visible = false;
    video.pause();
    console.log("Target lost");
  };

  // Start the engine
  await mindar.start();

  renderer.setAnimationLoop(() => {
    renderer.render(scene, camera);
  });
};
