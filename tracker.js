const start = document.getElementById("start");
const video = document.getElementById("video");

const VIDEO_ASPECT = 2 / 3; // 3:4 portrait

start.onclick = async () => {
  start.remove();
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

  // 🔑 UNIT geometry (no guessing here)
  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(1 * VIDEO_ASPECT, 1),
    new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      side: THREE.DoubleSide
    })
  );

  plane.visible = false;
  anchor.group.add(plane);

  anchor.onTargetFound = () => {
    plane.visible = true;
  };

  anchor.onTargetLost = () => {
    plane.visible = false;
  };

  await mindar.start();

  renderer.setAnimationLoop(() => {
    texture.needsUpdate = true;
    renderer.render(scene, camera);
  });
};
