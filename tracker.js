import * as THREE from 'three';
import { MindARThree } from 'mindar-image-three';

const start = document.getElementById("start");
const overlay = document.getElementById("ui-overlay");
const video = document.getElementById("video");

start.onclick = async () => {
  overlay.style.opacity = "0";
  setTimeout(() => { overlay.style.display = "none"; }, 500);

  const mindarThree = new MindARThree({
    container: document.body,
    imageTargetSrc: "assets/targets.mind",
    uiScanning: "yes", // Shows a scanning guide to the user
    uiLoading: "yes"
  });

  const { renderer, scene, camera } = mindarThree;

  const texture = new THREE.VideoTexture(video);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;

  const material = new THREE.MeshBasicMaterial({ 
    map: texture, 
    transparent: true, 
    opacity: 0 
  });
  
  // Create a placeholder plane
  const geometry = new THREE.PlaneGeometry(1, 1); 
  const plane = new THREE.Mesh(geometry, material);
  
  const anchor = mindarThree.addAnchor(0);
  anchor.group.add(plane);

  // DYNAMIC ASPECT RATIO: Matches plane to video dimensions
  video.addEventListener('loadedmetadata', () => {
    const videoAspect = video.videoWidth / video.videoHeight;
    // Set width based on aspect, keep height at 1
    plane.geometry = new THREE.PlaneGeometry(videoAspect, 1);
    console.log("Plane resized to match video aspect ratio.");
  });

  let isTargetVisible = false;

  anchor.onTargetFound = () => {
    isTargetVisible = true;
    video.play();
  };

  anchor.onTargetLost = () => {
    isTargetVisible = false;
    video.pause();
  };

  try {
    await mindarThree.start();
    
    renderer.setAnimationLoop(() => {
      // Smooth holographic fade effect
      if (isTargetVisible && material.opacity < 1) {
        material.opacity += 0.05;
      } else if (!isTargetVisible && material.opacity > 0) {
        material.opacity -= 0.1;
      }
      renderer.render(scene, camera);
    });
  } catch (err) {
    console.error("AR Start Error:", err);
  }
};