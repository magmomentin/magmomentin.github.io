import * as THREE from 'three';
import { MindARThree } from 'mindar-image-three';

const start = document.getElementById("start");
const overlay = document.getElementById("ui-overlay");
const video = document.getElementById("video");

start.onclick = async () => {
  // Fade out the UI
  overlay.style.opacity = "0";
  setTimeout(() => { overlay.style.display = "none"; }, 500);

  const mindarThree = new MindARThree({
    container: document.body,
    imageTargetSrc: "assets/targets.mind",
    uiScanning: "yes", // Built-in scanning guide
    uiLoading: "no"
  });

  const { renderer, scene, camera } = mindarThree;

  // Sharp video texture setup
  const texture = new THREE.VideoTexture(video);
  texture.minFilter = THREE.LinearFilter;
  
  const material = new THREE.MeshBasicMaterial({ 
    map: texture, 
    transparent: true, 
    opacity: 0 
  });
  
  // Create the plane (placeholder size)
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material);
  const anchor = mindarThree.addAnchor(0);
  anchor.group.add(plane);

  // AUTO-FIT LOGIC: Adjusts plane to match video dimensions
  video.onloadedmetadata = () => {
    const videoAspect = video.videoWidth / video.videoHeight;
    // Set width to 1 (standard) and adjust height based on video
    plane.geometry = new THREE.PlaneGeometry(1, 1 / videoAspect);
    // 1% scale boost to perfectly cover the physical photo edges
    plane.scale.set(1.01, 1.01, 1);
  };

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
      // Smooth holographic fade transition
      if (isTargetVisible && material.opacity < 1) material.opacity += 0.05;
      if (!isTargetVisible && material.opacity > 0) material.opacity -= 0.1;
      
      renderer.render(scene, camera);
    });
  } catch (err) {
    console.error("AR Start Error:", err);
    alert("Camera failed to start. Please use HTTPS.");
  }
};
