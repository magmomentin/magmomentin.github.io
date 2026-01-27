import { MindARImage } from "https://cdn.jsdelivr.net/npm/mind-ar@1.2.4/dist/mindar-image.prod.js";

const video = document.getElementById("arVideo");

const STATE = {
  ACTIVE: "active",
  LOCKED: "locked",
  LOST: "lost"
};

let currentState = STATE.LOST;
let lastSeen = 0;

function updateState(detected, confidence) {
  const now = performance.now();

  if (detected && confidence >= 0.85) {
    currentState = STATE.ACTIVE;
    lastSeen = now;
  } else if (detected && confidence >= 0.55) {
    currentState = STATE.LOCKED;
    lastSeen = now;
  } else if (now - lastSeen > 600) {
    currentState = STATE.LOST;
  }

  return currentState;
}

const mindar = new MindARImage.MindARController({
  container: document.body,
  imageTargetSrc: "assets/target.mind"
});

async function startAR() {
  await mindar.start();

  mindar.on("update", (data) => {
    const detected = data.hasTarget;
    const confidence = data.confidence || 0;

    const state = updateState(detected, confidence);

    if (state === STATE.ACTIVE) {
      video.style.display = "block";
      video.style.opacity = "1";
      video.style.transform = data.cssTransform || "none";
      video.play();
    }

    if (state === STATE.LOCKED) {
      video.style.display = "block";
      video.style.opacity = "1";
    }

    if (state === STATE.LOST) {
      video.style.opacity = "0";
    }
  });
}

startAR();
