const video = document.getElementById("arVideo");
const container = document.getElementById("ar-container");

/* --------------------
   STATE MACHINE
-------------------- */
const STATE = {
  IDLE: "IDLE",
  ACTIVE: "ACTIVE",
  LOST: "LOST"
};

let currentState = STATE.IDLE;
let lastSeenTime = 0;
const LOST_TIMEOUT = 800;

/* --------------------
   MINDAR INIT
-------------------- */
const mindar = new window.MINDAR.IMAGE.MindARImage({
  container: container,
  imageTargetSrc: "assets/target.mind",
  maxTrack: 1
});

const { renderer, scene, camera } = mindar;

const anchor = mindar.addAnchor(0);

/* --------------------
   ANCHOR EVENTS
-------------------- */
anchor.onTargetFound = () => {
  lastSeenTime = Date.now();
  setState(STATE.ACTIVE);
};

anchor.onTargetLost = () => {
  lastSeenTime = Date.now();
  setState(STATE.LOST);
};

/* --------------------
   STATE HANDLER
-------------------- */
function setState(newState) {
  if (currentState === newState) return;
  currentState = newState;
  updateState();
}

function updateState() {
  if (currentState === STATE.ACTIVE) {
    video.style.display = "block";
    if (video.paused) video.play();
  }

  if (currentState === STATE.LOST) {
    video.pause();
    video.style.display = "none";
  }
}

/* --------------------
   LOST CONFIRM LOOP
-------------------- */
function checkLost() {
  if (
    currentState === STATE.ACTIVE &&
    Date.now() - lastSeenTime > LOST_TIMEOUT
  ) {
    setState(STATE.LOST);
  }
  requestAnimationFrame(checkLost);
}

/* --------------------
   START
-------------------- */
(async () => {
  await mindar.start();
  renderer.setAnimationLoop(() => {
    renderer.render(scene, camera);
  });
  checkLost();
})();
