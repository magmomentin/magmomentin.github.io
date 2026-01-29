// We ONLY import MindAR. Three.js is accessed via window.THREE.
import { MindARThree } from 'https://cdn.jsdelivr.net/npm/mind-ar@1.2.0/dist/mindar-image-three.prod.js';

const start = document.getElementById("start");
const overlay = document.getElementById("ui-overlay");
const video = document.getElementById("video");

start.onclick = async () => {
  overlay.style.display = "none";

  const mindarThree = new MindARThree({
    container: document.body,
    imageTargetSrc: "assets/targets.mind",
  });

  const { renderer, scene, camera } = mindarThree;

  // Use window.THREE directly
  const texture = new window.THREE.VideoTexture(video);
  const material = new window.THREE.MeshBasicMaterial({ 
    map: texture,
    transparent: true 
  });
  
  // Portrait plane (Width 1, Height 1.5)
  const geometry = new window.THREE.PlaneGeometry(1, 1.5);
  const plane = new window.THREE.Mesh(geometry, material);
  plane.visible = false;

  const anchor = mindarThree.addAnchor(0);
  anchor.group.add(plane);

  anchor.onTargetFound = () => {
    video.play();
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