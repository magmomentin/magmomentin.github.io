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
    uiScanning: "yes", // Built-in scanning overlay
    uiLoading: "yes"
  });

  const { renderer, scene, camera } = mindarThree;

  // IMPROVISATION: Video Texture with better filtering for sharpness
  const texture = new THREE.VideoTexture(video);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;

  // IMPROVISATION: Hologram Material (Transparent for fade-in)
  const material = new THREE.MeshBasicMaterial({ 
    map: texture, 
    transparent: true, 
    opacity: 0 
  });
  
  const geometry = new THREE.PlaneGeometry(1, 1.5); 
  const plane = new THREE.Mesh(geometry, material);
  
  const anchor = mindarThree.addAnchor(0);
  anchor.group.add(plane);

  let targetVisible = false;

  anchor.onTargetFound = () => {
    targetVisible = true;
    video.play();
  };

  anchor.onTargetLost = () => {
    targetVisible = false;
    video.pause();
  };

  try {
    await mindarThree.start();
    
    renderer.setAnimationLoop(() => {
      // IMPROVISATION: Smooth Opacity Transition
      if (targetVisible && material.opacity < 1) {
        material.opacity += 0.05;
      } else if (!targetVisible && material.opacity > 0) {
        material.opacity -= 0.1;
      }
      
      renderer.render(scene, camera);
    });
  } catch (err) {
    console.error("AR Engine failed:", err);
    alert("Camera initialization failed. Please ensure you are using HTTPS.");
  }
};