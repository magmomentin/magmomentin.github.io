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
    uiScanning: "yes", // Built-in scanning guide for customers
    uiLoading: "no"
  });

  const { renderer, scene, camera } = mindarThree;

  const texture = new THREE.VideoTexture(video);
  texture.minFilter = THREE.LinearFilter; // Keeps video sharp
  
  const material = new THREE.MeshBasicMaterial({ 
    map: texture, 
    transparent: true, 
    opacity: 0 
  });
  
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material);
  const anchor = mindarThree.addAnchor(0);
  anchor.group.add(plane);

  // AUTO-SCALE: Matches plane to video dimensions perfectly
  video.onloadedmetadata = () => {
    const videoAspect = video.videoWidth / video.videoHeight;
    plane.geometry = new THREE.PlaneGeometry(1, 1 / videoAspect);
    plane.scale.set(1.02, 1.02, 1); // Slight over-scale for a "flush" look
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
      // Holographic fade transition
      if (isTargetVisible && material.opacity < 1) material.opacity += 0.05;
      if (!isTargetVisible && material.opacity > 0) material.opacity -= 0.1;
      
      renderer.render(scene, camera);
    });
  } catch (err) {
    console.error("AR Start Error:", err);
    alert("Please ensure you are using HTTPS and have granted camera access.");
  }
};