import { MindARThree } from "https://unpkg.com/mind-ar/dist/mindar-image-three.esm.js";

document.addEventListener("DOMContentLoaded", async () => {
  const mindarThree = new MindARThree({
    container: document.querySelector("#container"),
    imageTargetSrc: "./targets.mind",
  });

  const { renderer, scene, camera } = mindarThree;
  const anchor = mindarThree.addAnchor(0);

  // --- Load video ---
  const video = document.createElement("video");
  video.src = "./assets/video.mp4";
  video.loop = true;
  video.muted = true;
  video.playsInline = true;
  video.autoplay = true;
  const videoTexture = new THREE.VideoTexture(video);

  // --- Video plane (screen) ---
  const videoPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(1.5, 0.9),
    new THREE.MeshBasicMaterial({ map: videoTexture })
  );
  videoPlane.position.z = 0.05;

  // --- Simple 3D frame ---
  const frame = new THREE.Mesh(
    new THREE.BoxGeometry(1.6, 1.0, 0.1),
    new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.7, roughness: 0.4 })
  );

  // Group video + frame
  const group = new THREE.Group();
  group.add(frame);
  group.add(videoPlane);

  anchor.group.add(group);

  // Lights for 3D effect
  const light = new THREE.PointLight(0xffffff, 1);
  light.position.set(0, 1, 2);
  anchor.group.add(light);

  video.play();

  // Animation 
  renderer.setAnimationLoop(() => {
    group.rotation.y += 0.003;
    renderer.render(scene, camera);
  });

  await mindarThree.start();
});
