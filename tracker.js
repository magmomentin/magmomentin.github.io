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
    uiScanning: "yes", // Shows the target frame for the customer
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
  
  // Initial placeholder geometry
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material);
  const anchor = mindarThree.addAnchor(0);
  anchor.group.add(plane);

  // DYNAMIC ALIGNMENT LOGIC
  const alignVideo = () => {
    const videoAspect = video.videoWidth / video.videoHeight;
    
    // MindAR uses width=1 as the target width. 
    // We set width to 1 and adjust height to maintain the video's shape.
    plane.geometry = new THREE.PlaneGeometry(1, 1 / videoAspect);
    
    // Ensure it is perfectly centered
    plane.position.set(0, 0, 0);
    
    // Apply a 1.02 scale (2% bleed) to ensure it covers any tracking inaccuracies
    plane.scale.set(1.02, 1.02, 1);
    console.log("Video aligned: Aspect is " + videoAspect);
  };

  if (video.readyState >= 2) {
    alignVideo();
  } else {
    video.addEventListener('loadedmetadata', alignVideo);
  }

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
      // Smooth holographic fade-in
      if (isTargetVisible && material.opacity < 1) material.opacity += 0.05;
      if (!isTargetVisible && material.opacity > 0) material.opacity -= 0.1;
      
      renderer.render(scene, camera);
    });
  } catch (err) {
    console.error("AR Start Error:", err);
  }
};