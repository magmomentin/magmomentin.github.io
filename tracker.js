// Import the specific ESM build of MindAR
import { MindARThree } from 'https://cdn.jsdelivr.net/npm/mind-ar@1.2.0/dist/mindar-image-three.prod.js';

const start = document.getElementById("start");
const overlay = document.getElementById("ui-overlay");
const video = document.getElementById("video");

start.onclick = async () => {
  overlay.style.display = "none";

  // Since Three.js is loaded via script tag, we use window.THREE
  const mindarThree = new MindARThree({
    container: document.body,
    imageTargetSrc: "assets/targets.mind",
  });

  const { renderer, scene, camera } = mindarThree;

  // Create video texture using the global THREE object
  const texture = new window.THREE.VideoTexture(video);
  const material = new window.THREE.MeshBasicMaterial({ 
    map: texture,
    transparent: true 
  });
  
  // Create the plane (1 unit wide, 1.5 units high for portrait)
  const geometry = new window.THREE.PlaneGeometry(1, 1.5);
  const plane = new window.THREE.Mesh(geometry, material);
  plane.visible = false;

  const anchor = mindarThree.addAnchor(0);
  anchor.group.add(plane);

  anchor.onTargetFound = () => {
    video.play().catch(e => console.log("Playback error:", e));
    plane.visible = true;
  };

  anchor.onTargetLost = () => {
    video.pause();
    plane.visible = false;
  };

  await mindarThree.start();

  renderer.setAnimationLoop(() => {
    renderer.render(scene, camera);
  });
};