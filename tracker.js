const container = document.getElementById("ar-container");
const video = document.getElementById("videoSource");

(async () => {
  const mindarThree = new window.MINDAR.MindARThree({
    container: container,
    imageTargetSrc: "assets/targets.mind",
    maxTrack: 1
  });

  const { renderer, scene, camera } = mindarThree;

  const videoTexture = new THREE.VideoTexture(video);
  videoTexture.minFilter = THREE.LinearFilter;
  videoTexture.magFilter = THREE.LinearFilter;

  const geometry = new THREE.PlaneGeometry(1, 1);
  const material = new THREE.MeshBasicMaterial({
    map: videoTexture,
    transparent: true
  });

  const plane = new THREE.Mesh(geometry, material);
  plane.rotation.x = -Math.PI / 2;

  const anchor = mindarThree.addAnchor(0);
  anchor.group.add(plane);

  anchor.onTargetFound = () => {
    if (video.paused) video.play();
  };

  anchor.onTargetLost = () => {
    video.pause();
  };

  await mindarThree.start();

  renderer.setAnimationLoop(() => {
    renderer.render(scene, camera);
  });
})();
