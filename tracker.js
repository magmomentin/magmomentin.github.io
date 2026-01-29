import * as THREE from 'three';
import { MindARThree } from 'mindar-image-three';

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

  // Setup Video Texture
  const texture = new THREE.VideoTexture(video);
  const material = new THREE.MeshBasicMaterial({ 
    map: texture,
    transparent: true 
  });
  
  // Using 1 unit width and 1.5 height (for a 2:3 vertical aspect ratio)
  const geometry = new THREE.PlaneGeometry(1, 1.5);
  const plane = new THREE.Mesh(geometry, material);
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
    // Standard Three.js VideoTexture handles updates automatically, 
    // but we call render here for the MindAR loop.
    renderer.render(scene, camera);
  });
};