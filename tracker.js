const startBtn = document.getElementById("start");
const loader = document.getElementById("loader");
const video = document.getElementById("video");

const VIDEO_ASPECT = 2 / 3;
const FADE_SPEED = 0.08;

startBtn.onclick = async () => {
  loader.classList.add("hidden");

  const mindar = new window.MINDAR.IMAGE.MindARThree({
    container: document.body,
    imageTargetSrc: "assets/targets.mind"
  });

  const { renderer, scene, camera } = mindar;
  scene.add(mindar.cameraGroup);

  const anchor = mindar.addAnchor(0);

  const texture = new THREE.VideoTexture(video);

  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    opacity: 0
  });

  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(VIDEO_ASPECT, 1),
    material
  );

  plane.visible = false;
  anchor.group.add(plane);

  let visible = false;

  anchor.onTargetFound = async () => {
    visible = true;
    plane.visible = true;
    await video.play();
  };

  anchor.onTargetLost = () => {
    visible = false;
    video.pause();
  };

  await mindar.start();

  renderer.setAnimationLoop(() => {
    if (visible && material.opacity < 1) {
      material.opacity += FADE_SPEED;
    }
    if (!visible && material.opacity > 0) {
      material.opacity -= FADE_SPEED;
      if (material.opacity <= 0) plane.visible = false;
    }

    texture.needsUpdate = true;
    renderer.render(scene, camera);
  });
};
