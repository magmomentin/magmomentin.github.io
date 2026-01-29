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
    uiScanning: "yes", // Shows professional scanning guide
    uiLoading: "no"
  });

  const { renderer, scene, camera } = mindarThree;

  const texture = new THREE.VideoTexture(video);
  texture.minFilter = THREE.LinearFilter;
  
  const material = new THREE.MeshBasicMaterial({ 
    map: texture, 
    transparent: true, 
    opacity: 0 
  });
  
  // Create an initial square plane
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material);
  const anchor = mindarThree.addAnchor(0);
  anchor.group.add(plane);

  // BUSINESS LOGIC: Automatic Frame Matching
  video.onloadedmetadata = () => {
    const videoAspect = video.videoWidth / video.videoHeight;
    // Keep width at 1 unit (MindAR standard) and adjust height
    plane.geometry = new THREE.PlaneGeometry(1, 1 / videoAspect);
    // Slight over-scale (1%) to ensure no physical edges show through
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
    await mindarThree.start(); // Initiates camera
    
    renderer.setAnimationLoop(() => {
      // Premium holographic fade-in
      if (isTargetVisible && material.opacity < 1) material.opacity += 0.05;
      if (!isTargetVisible && material.opacity > 0) material.opacity -= 0.1;
      
      renderer.render(scene, camera);
    });
  } catch (err) {
    console.error("AR Start Error:", err);
    alert("Camera failed to start. Please check permissions and HTTPS.");
  }
};