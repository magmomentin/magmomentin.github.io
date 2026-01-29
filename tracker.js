import * as THREE from 'three';
import { MindARThree } from 'mindar-image-three';

// If you actually need the CSS3DRenderer for floating HTML elements:
// import { CSS3DRenderer } from 'three/addons/renderers/CSS3DRenderer.js';

const start = document.getElementById("start");
const video = document.getElementById("video");

start.onclick = async () => {
  document.getElementById("ui-overlay").style.display = "none";

  const mindarThree = new MindARThree({
    container: document.body,
    imageTargetSrc: "assets/targets.mind",
  });

  const { renderer, scene, camera } = mindarThree;

  const texture = new THREE.VideoTexture(video);
  const geometry = new THREE.PlaneGeometry(1, 1.5);
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
    await mindarThree.start();
    renderer.setAnimationLoop(() => {
      renderer.render(scene, camera);
    });
  } catch (err) {
    console.error("AR Start Error:", err);
  }
};