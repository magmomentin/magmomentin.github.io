const container = document.getElementById("ar-container");
const videoSource = document.getElementById("videoSource");

(async () => {
  /* --------------------
     INIT MindAR (THREE BUNDLE)
  -------------------- */
  const mindarThree = new window.MINDAR.IMAGE.MindARThree({
    container: container,
    imageTargetSrc: "assets/target.mind",
    maxTrack: 1
  });

  const { renderer, scene, camera } = mindarThree;

  /* --------------------
     VIDEO TEXTURE
  -------------------- */
  const videoTexture = new THREE.VideoTexture(videoSource);
  videoTexture.minFilter = THREE.LinearFilter;
  videoTexture.magFilter = THREE.LinearFilter;

  /* --------------------
     VIDEO PLANE
  -------------------- */
  const geometry = new THREE.PlaneGeometry(1, 1);
  const material = new THREE.MeshBasicMaterial({
    map: videoTexture,
    transparent: true
  });

  const videoPlane = new THREE.Mesh(geometry, material);
  videoPlane.rotation.x = -Math.PI / 2;

  /* --------------------
     ANCHOR
  -------------------- */
  const anchor = mindarThree.addAnchor(0);
  anchor.group.add(videoPlane);

  anchor.onTargetFound = () => {
    if (videoSource.paused) videoSource.play();
  };

  anchor.onTargetLost = () => {
    videoSource.pause();
  };

  /* --------------------
     START
  -------------------- */
  await mindarThree.start();
  renderer.setAnimationLoop(() => {
    renderer.render(scene, camera);
  });
})();
