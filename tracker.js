const start = document.getElementById("start");
const video = document.getElementById("video");

start.onclick = async () => {
  start.remove();

  // Unlock video
  await video.play();

  const mindar = new window.MINDAR.IMAGE.MindARThree({
    container: document.body,
    imageTargetSrc: "assets/target.mind"
  });

  const { renderer, scene, camera } = mindar;

  // 🔑 CAMERA BACKGROUND
  scene.add(mindar.cameraGroup);

  const anchor = mindar.addAnchor(0);

  const texture = new THREE.VideoTexture(video);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;

  // 🔒 FRAME SETTINGS (MATCH TARGET IMAGE)
  const FRAME_HEIGHT = 1;
  const FRAME_ASPECT = 2 / 3;

  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(
      FRAME_HEIGHT * FRAME_ASPECT,
      FRAME_HEIGHT
    ),
    new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.DoubleSide,
      transparent: true
    })
  );

  plane.position.z = 0.01;
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
