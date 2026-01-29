const start = document.getElementById("start");
const video = document.getElementById("video");

const SCALE_RATIO = 1;

start.onclick = async () => {
  start.remove();

  // Unlock video
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

  // 🔧 FIX STARTS HERE
  // Use unit geometry, not pre-scaled geometry
  const FRAME_ASPECT = 2 / 3; // 3:4 video

  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(FRAME_ASPECT, 1),
    new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.DoubleSide,
      transparent: true
    })
  );
  // 🔧 FIX ENDS HERE

  plane.position.set(0, 0, 0);
  plane.visible = false;
  anchor.group.add(plane);

  // 🔧 FIX: remove double-scaling logic
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
