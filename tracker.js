const container = document.getElementById("ar-container");
const srcVideo = document.getElementById("srcVideo");

(async () => {
  const mindar = new window.MINDAR.IMAGE.MindARImage({
    container,
    imageTargetSrc: "assets/target.mind",
    maxTrack: 1
  });

  const { renderer, scene, camera } = mindar;

  // create video texture
  const videoTexture = new THREE.VideoTexture(srcVideo);
  videoTexture.minFilter = THREE.LinearFilter;
  videoTexture.magFilter = THREE.LinearFilter;
  videoTexture.format = THREE.RGBFormat;

  // plane that matches target
  const geometry = new THREE.PlaneGeometry(1, 1);
  const material = new THREE.MeshBasicMaterial({
    map: videoTexture,
    transparent: true
  });

  const plane = new THREE.Mesh(geometry, material);

  const anchor = mindar.addAnchor(0);
  anchor.group.add(plane);

  anchor.onTargetFound = () => {
    srcVideo.play();
  };

  anchor.onTargetLost = () => {
    srcVideo.pause();
  };

  await mindar.start();
  renderer.setAnimationLoop(() => {
    renderer.render(scene, camera);
  });
})();
