const start = document.getElementById("start");
const video = document.getElementById("video");

// 🔧 how much of the target the frame should occupy
// 1   = full target
// 0.9 = small margin
const SCALE_RATIO = 1;

start.onclick = async () => {
  start.remove();

  // Unlock video (required)
  await video.play();

  const mindar = new window.MINDAR.IMAGE.MindARThree({
    container: document.body,
    imageTargetSrc: "assets/target.mind"
  });

  const { renderer, scene, camera } = mindar;

  // Camera background
  scene.add(mindar.cameraGroup);

  const anchor = mindar.addAnchor(0);

  const texture = new THREE.VideoTexture(video);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;

  // 🔒 FRAME SETTINGS (UNCHANGED)
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

  // ✅ centered, no z-offset
  plane.position.set(0, 0, 0);
  plane.visible = false;
  anchor.group.add(plane);

  // ✅ SCALE WITH TARGET (ONLY UPGRADE)
  anchor.onTargetFound = () => {
    const targetW = anchor.group.scale.x;
    const targetH = anchor.group.scale.y;

    plane.scale.set(
      targetW * SCALE_RATIO,
      targetH * SCALE_RATIO,
      1
    );

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
