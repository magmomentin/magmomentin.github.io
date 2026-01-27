import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";

// --------------------
// CONFIG (LOCK THESE)
// --------------------

// Video size as % of target (MULTI-SIZE)
const VIDEO_WIDTH_RATIO  = 0.8; // 80%
const VIDEO_HEIGHT_RATIO = 0.8; // 80%

// --------------------
// MINDAR SETUP
// --------------------
const mindarThree = new window.MINDAR.IMAGE.MindARThree({
  container: document.body,
  imageTargetSrc: "./assets/target.mind",
});

const { renderer, scene, camera } = mindarThree;

// --------------------
// VIDEO SETUP
// --------------------
const video = document.createElement("video");
video.src = "./assets/demo.mp4";
video.loop = true;
video.muted = true;
video.playsInline = true;
video.preload = "auto";

// --------------------
// VIDEO TEXTURE
// --------------------
const videoTexture = new THREE.VideoTexture(video);
videoTexture.minFilter = THREE.LinearFilter;
videoTexture.magFilter = THREE.LinearFilter;

// --------------------
// UNIT PLANE (DO NOT CHANGE)
// --------------------
const geometry = new THREE.PlaneGeometry(1, 1);
const material = new THREE.MeshBasicMaterial({
  map: videoTexture,
  transparent: true,
});

const plane = new THREE.Mesh(geometry, material);
plane.visible = false;

// --------------------
// ANCHOR
// --------------------
const anchor = mindarThree.addAnchor(0);
anchor.group.add(plane);
scene.add(anchor.group);

// --------------------
// TARGET FOUND
// --------------------
anchor.onTargetFound = async () => {
  const targetW = anchor.group.scale.x; // real-world width
  const targetH = anchor.group.scale.y; // real-world height

  // Base scale from ratios (MULTI-SIZE)
  let scaleW = targetW * VIDEO_WIDTH_RATIO;
  let scaleH = targetH * VIDEO_HEIGHT_RATIO;

  // Aspect-safe fit
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

  // Apply scale + AUTO-CENTER
  plane.scale.set(scaleW, scaleH, 1);
  plane.position.set(0, 0, 0);

  plane.visible = true;

  if (video.paused) {
    try {
      await video.play();
    } catch (e) {
      console.warn("Video play blocked:", e);
    }
  }
};

// --------------------
// TARGET LOST
// --------------------
anchor.onTargetLost = () => {
  video.pause();
  plane.visible = false;
};

// --------------------
// START
// --------------------
await mindarThree.start();

renderer.setAnimationLoop(() => {
  renderer.render(scene, camera);
});
