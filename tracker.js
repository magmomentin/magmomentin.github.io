import * as THREE from 'three';
import { MindARThree } from 'mindar-image-three';

const start = document.getElementById("start");
const overlay = document.getElementById("ui-overlay");
const video = document.getElementById("video");

start.onclick = async () => {
  // Hide UI to reveal the camera feed
  overlay.style.display = "none";

  const mindarThree = new MindARThree({
    container: document.body,
    imageTargetSrc: "assets/targets.mind",
  });

  const { renderer, scene, camera } = mindarThree;

  // Setup Video Texture and Plane
  const texture = new THREE.VideoTexture(video);
  const geometry = new THREE.PlaneGeometry(1, 1.5); // Adjust to (1.5, 1) if landscape
  const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
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

  try {
    console.log("Starting AR Engine...");
    await mindarThree.start(); // Triggers camera permission
    
    renderer.setAnimationLoop(() => {
      renderer.render(scene, camera);
    });
    console.log("AR Engine Started Successfully");
  } catch (error) {
    console.error("Failed to start AR:", error);
    // Bring back the overlay or alert the user
    overlay.style.display = "flex";
    alert("Camera error: Please ensure you are on HTTPS and have granted camera permissions.");
  }
};