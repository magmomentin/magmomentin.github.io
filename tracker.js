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
    uiScanning: "yes", 
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
  
  // Create the plane
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material);
  const anchor = mindarThree.addAnchor(0);
  anchor.group.add(plane);

  // DYNAMIC ALIGNMENT: Ensures horizontal and vertical perfection
  const fixAlignment = () => {
    const ratio = video.videoWidth / video.videoHeight;
    // MindAR fixes width at 1; we set height based on the video's actual ratio
    plane.geometry = new THREE.PlaneGeometry(1, 1 / ratio);
    // Slight over-scale (2%) to act as a bleed and hide physical photo edges
    plane.scale.set(1.02, 1.02, 1);
  };

  video.addEventListener('loadedmetadata', fixAlignment);
  if (video.readyState >= 2) fixAlignment();

  let isFound = false;
  anchor.onTargetFound = () => { isFound = true; video.play(); };
  anchor.onTargetLost = () => { isFound = false; video.pause(); };

  try {
    await mindarThree.start();
    renderer.setAnimationLoop(() => {
      // Premium Fade-in effect
      if (isFound && material.opacity < 1) material.opacity += 0.05;
      if (!isFound && material.opacity > 0) material.opacity -= 0.1;
      renderer.render(scene, camera);
    });
  } catch (err) {
    console.error("AR Start Error:", err);
  }
};