const start = document.getElementById("start");
const video = document.getElementById("video");

const SCALE_RATIO = 1;

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

  plane.position.set(0, 0, 0);
  plane.visible = false;
  anchor.group.add(plane);

  anchor.onTargetFound = () => {
    const targetH = anchor.group.scale.y;

    const scaleH = targetH * SCALE_RATIO;
    const scaleW = scaleH * FRAME_ASPECT;

    plane.scale.set(scaleW, scaleH, 1);
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
