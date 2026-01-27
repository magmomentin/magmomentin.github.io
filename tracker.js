const start = document.getElementById("start");
const video = document.getElementById("video");

// Video occupies % of target (MULTI-SIZE)
const VIDEO_WIDTH_RATIO  = 0.8;
const VIDEO_HEIGHT_RATIO = 0.8;

start.onclick = async () => {
  start.remove();

  await video.play();

  // ✅ CORRECT GLOBAL FOR mindar-image-three
   const mindar = new window.MINDAR.IMAGE.MindARThree({
    container: document.body,
    imageTargetSrc: "assets/target.mind"
  });

  const { renderer, scene, camera } = mindar;

  scene.add(mindar.cameraGroup);

  const anchor = mindar.addAnchor(0);

  const texture = new THREE.VideoTexture(video);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;

  // 🔑 UNIT PLANE (DO NOT CHANGE)
  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1),
    new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true
    })
  );

  plane.visible = false;
  anchor.group.add(plane);

  anchor.onTargetFound = () => {
    const targetW = anchor.group.scale.x;
    const targetH = anchor.group.scale.y;

    let scaleW = targetW * VIDEO_WIDTH_RATIO;
    let scaleH = targetH * VIDEO_HEIGHT_RATIO;

    const videoAspect =
      video.videoWidth && video.videoHeight
        ? video.videoWidth / video.videoHeight
        : scaleW / scaleH;

    const frameAspect = scaleW / scaleH;

    if (videoAspect > frameAspect) {
      scaleH = scaleW / videoAspect;
    } else {
      scaleW = scaleH * videoAspect;
    }

    plane.scale.set(scaleW, scaleH, 1);
    plane.position.set(0, 0, 0); // AUTO-CENTER
    plane.visible = true;
  };

  anchor.onTargetLost = () => {
    plane.visible = false;
    video.pause();
  };

  await mindar.start();

  renderer.setAnimationLoop(() => {
    renderer.render(scene, camera);
  });
};
