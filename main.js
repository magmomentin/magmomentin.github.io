import { startCamera } from "./camera.js";
import { resolveToken } from "./security/token.js";
import { FrameDetector } from "./detector/frameDetector.js";
import { PoseEstimator } from "./detector/poseEstimator.js";
import { VideoPlayer } from "./media/videoPlayer.js";
import { UIManager } from "./ui/uiManager.js";
import { GLRenderer } from "./renderer/glRenderer.js";

let hasEverDetected = false;


let arStarted=false, frameLocked=false, lastSeenTime=0;
const LOCK_TIMEOUT=800;


const cam=document.getElementById("camera");
const canvas=document.getElementById("glcanvas");
const ui=new UIManager();
const auth=await resolveToken();

await startCamera(cam);
cam.style.display="block";

const detector=new FrameDetector(auth.frameId);
const pose=new PoseEstimator();
let player,gl;

const toCorners=b=>[[b.x,b.y],[b.x+b.width,b.y],[b.x,b.y+b.height],[b.x+b.width,b.y+b.height]];

function loop() {
  if (!arStarted) {
    requestAnimationFrame(loop);
    return;
  }

  const r = detector.detect(cam);
  const now = Date.now();

  if (r) {
    // ✅ FIRST & ONLY PLACE VIDEO CAN START
    hasEverDetected = true;
    frameLocked = true;
    lastSeenTime = now;

    const b = pose.smoothBox(r);
    player.play();
    gl.draw(toCorners(b));
    ui.found();

  } else if (
    frameLocked &&
    hasEverDetected &&
    now - lastSeenTime < LOCK_TIMEOUT
  ) {
    // grace period
    player.play();
    gl.draw(toCorners(pose.last));
    ui.found();

  } else {
    // ❌ ABSOLUTE STOP
    frameLocked = false;

    player.pause();   // 🔑 stops native playback
    gl.clear();       // 🔑 clears canvas
    ui.lost();
  }

  requestAnimationFrame(loop);
}


ui.waitForTap(() => {
  arStarted = true;

  detector.hits = 0;
  pose.last = null;
  frameLocked = false;
  lastSeenTime = 0;
  hasEverDetected = false;

  player = new VideoPlayer(auth.videoUrl);

  // attach but KEEP PAUSED
  document.body.appendChild(player.video);
  player.video.style.display = "none";

  gl = new GLRenderer(canvas, player.video);

  requestAnimationFrame(loop);
});

