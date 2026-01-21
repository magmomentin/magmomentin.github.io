const video = document.getElementById("arVideo");

/* Init MindAR */
const mindar = new window.MINDAR.IMAGE.MindARThree({
  container: document.body,
  imageTargetSrc: "assets/target.mind"
});

const { renderer, scene, camera } = mindar;

/* Anchor for target 0 */
const anchor = mindar.addAnchor(0);

/* Video texture */
const texture = new THREE.VideoTexture(video);

/* Adjust to your frame ratio */
const geometry = new THREE.PlaneGeometry(1, 1.4);
const material = new THREE.MeshBasicMaterial({ map: texture });
const plane = new THREE.Mesh(geometry, material);

anchor.group.add(plane);

(async () => {
  await mindar.start();

  renderer.setAnimationLoop(() => {
    renderer.render(scene, camera);
  });

  anchor.onTargetFound = () => {
    video.play().catch(() => {
      document.body.addEventListener("click", () => video.play(), { once: true });
    });
  };

  anchor.onTargetLost = () => {
    video.pause();
  };
})();
