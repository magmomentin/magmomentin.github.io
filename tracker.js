import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";
import { MindARThree } from "./vendor/mindar-image.prod.js";

const mindarThree = new MindARThree({
  container: document.body,
  imageTargetSrc: "./assets/target.mind",
});

const { renderer, scene, camera } = mindarThree;

// ---------- VIDEO SETUP ----------
const video = document.createElement("video");
video.src = "./assets/demo.mp4";
video.loop = true;
video.muted = true;
video.playsInline = true;
video.preload = "auto";

// ---------- VIDEO TEXTURE ----------
const videoTexture = new THREE.VideoTexture(video);
videoTexture.minFilter = THREE.LinearFilter;
videoTexture.magFilter = THREE.LinearFilter;
videoTexture.format = THRE
