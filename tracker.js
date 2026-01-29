// Import ONLY MindAR. Three.js is already loaded via the <script> tag in HTML.
import { MindARThree } from 'https://cdn.jsdelivr.net/npm/mind-ar@1.2.0/dist/mindar-image-three.prod.js';

const start = document.getElementById("start");
const overlay = document.getElementById("ui-overlay");
const video = document.getElementById("video");

start.onclick = async () => {
  overlay.style.display = "none";

  // Initialize MindAR
  const mindarThree = new MindARThree({
    container: document.body,
    imageTargetSrc: "assets/targets.mind",
  });

  const { renderer, scene, camera } = mindarThree;

  // Use the global THREE object loaded from the CDN
  const texture = new window.THREE.VideoTexture(video);
  const material = new window.THREE.MeshBasicMaterial({ 
    map: texture,
    transparent: true 
  });
  
  // Create a 2:3 aspect ratio plane (Width: 1, Height: 1.5)
  // If your image/video is landscape, use (1.5, 1)
  const geometry = new window.THREE.PlaneGeometry(1, 1.5);
  const plane = new window.THREE.Mesh(geometry, material);
  plane.visible = false;

  // Add the plane to the first target (index 0)
  const anchor = mindarThree.addAnchor(0);
  anchor.group.add(plane);

  anchor.onTargetFound = () => {
    video.play();
    plane.visible = true;
    console.log("AR Target Found");
  };

  anchor.onTargetLost = () => {
    video.pause();
    plane.visible = false;
    console.log("AR Target Lost");
  };

  // Start the AR engine
  await mindarThree.start();

  // Animation loop
  renderer.setAnimationLoop(() => {
    renderer.render(scene, camera);
  });
};