import { MindARThree } from 'https://cdn.jsdelivr.net/npm/mind-ar@1.2.0/dist/mindar-image-three.prod.js';

const start = document.getElementById("start");
const overlay = document.getElementById("ui-overlay");
const video = document.getElementById("video");

start.onclick = async () => {
  // 1. Hide the Start UI
  overlay.style.display = "none";

  // 2. Setup MindAR
  const mindarThree = new MindARThree({
    container: document.body,
    imageTargetSrc: "assets/targets.mind",
  });

  const { renderer, scene, camera } = mindarThree;

  // 3. Create Video Texture using the Global THREE object
  const texture = new window.THREE.VideoTexture(video);
  const material = new window.THREE.MeshBasicMaterial({ 
    map: texture,
    transparent: true 
  });
  
  // 4. Create the Plane (1 width, 1.5 height for 2:3 portrait)
  const geometry = new window.THREE.PlaneGeometry(1, 1.5);
  const plane = new window.THREE.Mesh(geometry, material);
  plane.visible = false;

  // 5. Link to the first anchor in your .mind file
  const anchor = mindarThree.addAnchor(0);
  anchor.group.add(plane);

  // 6. Interaction Logic
  anchor.onTargetFound = () => {
    video.play();
    plane.visible = true;
  };

  anchor.onTargetLost = () => {
    video.pause();
    plane.visible = false;
  };

  // 7. Start Engine
  await mindarThree.start();

  renderer.setAnimationLoop(() => {
    renderer.render(scene, camera);
  });
};