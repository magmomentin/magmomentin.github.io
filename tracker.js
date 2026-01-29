const startBtn = document.getElementById("start");
const loader = document.getElementById("loader");
const video = document.getElementById("video");

const VIDEO_ASPECT = 2 / 3; // 3:4 portrait
const FADE_SPEED = 0.08;

startBtn.onclick = async () => {
  loader.classList.add("hidden");
  await video.play();

  const mindar = new window.MINDAR.IMAGE.MindARThree({
    container: document.body,
    imageTargetSrc: "assets/targets.mind"
  });

  const { renderer, scene, camera } = mindar;
  scene.add(mindar.cameraGroup);

  const anchor = mindar.addAnchor(0);

  const texture = new THREE.VideoTexture(video);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;

  // 🔒 Mask to prevent bleed
  const maskGeometry = new THREE.PlaneGeometry(
    VIDEO_ASPECT,
    1
  );

  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    opacity: 0
  });

  const plane = new THREE.Mesh(maskGeometry, material);
  plane.visible = false;

  anchor.group.add(plane);

  let targetVisible = false;

  anchor.onTargetFound = () => {
    targetVisible = true;
    plane.visible = true;
    video.play();
  };

  anchor.onTargetLost = () => {
    targetVisible = false;
    video.pause();
  };

  await mindar.start();

  renderer.setAnimationLoop(() => {
    // Smooth fade logic
    if (targetVisible && material.opacity < 1) {
      material.opacity += FADE_SPEED;
    }

    if (!targetVisible && material.opacity > 0) {
      material.opacity -= FADE_SPEED;
      if (material.opacity <= 0) {
        plane.visible = false;
      }
    }

    texture.needsUpdate = true;
    renderer.render(scene, camera);
  });
};
