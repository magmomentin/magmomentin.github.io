const video = document.getElementById("arVideo");

/* Init MindAR Three */
const mindar = new window.MINDAR.IMAGE.MindARThree({
  container: document.body,
  imageTargetSrc: "assets/target.mind"
});

const { renderer, scene, camera } = mindar;

/* Create anchor for target index 0 */
const anchor = mindar.addAnchor(0);

/* Create video texture */
const videoTexture = new THREE.VideoTexture(video);
videoTexture.minFilter = THREE.LinearFilter;
videoTexture.magFilter = THREE.LinearFilter;
videoTexture.format = THREE.RGBFormat;

/* Frame size (adjust to your physical print ratio) */
const FRAME_WIDTH = 1;
const FRAME_HEIGHT = 1.4; // portrait frame example

/* Plane that represents the frame */
const geometry = new THREE.PlaneGeometry(FRAME_WIDTH, FRAME_HEIGHT);
const material = new THREE.MeshBasicMaterial({
  map: videoTexture,
  transparent: true
});

const plane = new THREE.Mesh(geometry, material);

/* Attach plane to anchor (THIS locks it to the frame) */
anchor.group.add(plane);

/* Start AR */
(async () => {
  await mindar.start();

  renderer.setAnimationLoop(() => {
    renderer.render(scene, camera);
  });

  /* Ensure video playback (mobile-safe) */
  anchor.onTargetFound = () => {
    video.play().catch(() => {
      document.body.addEventListener("click", () => video.play(), { once: true });
    });
  };

  anchor.onTargetLost = () => {
    video.pause();
  };
})();
