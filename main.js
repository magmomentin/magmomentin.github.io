import{startCamera}from"./camera.js";
import{resolveToken}from"./security/token.js";
import{FrameDetector}from"./detector/frameDetector.js";
import{PoseEstimator}from"./detector/poseEstimator.js";
import{VideoPlayer}from"./media/videoPlayer.js";
import{UIManager}from"./ui/uiManager.js";
import{GLRenderer}from"./renderer/glRenderer.js";

gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

const ui=new UIManager();
const auth=await resolveToken();

const cam=document.getElementById("camera");
const canvas=document.getElementById("glcanvas");

await startCamera(cam);

const detector=new FrameDetector(auth.frameId);
const pose=new PoseEstimator();

let player,gl;

const toCorners=b=>[
[b.x,b.y],[b.x+b.width,b.y],
[b.x,b.y+b.height],[b.x+b.width,b.y+b.height]
];

function loop(){
  if (!arStarted) {
    requestAnimationFrame(loop);
    return;
  }

  const r = detector.detect(cam);
  const now = Date.now();
if (r) {
  const b = pose.smoothBox(r);

  // 🔴 VISUAL DEBUG: screen flash
  document.body.style.background = "green";

  player.play();
  gl.draw(toCorners(b));
  ui.found();
} else {
  document.body.style.background = "black";

  player.pause();
  ui.lost();
}
requestAnimationFrame(loop);
}

ui.waitForTap(() => {
  // 🔑 START AR ONLY AFTER TAP
  arStarted = true;

  // 🔄 RESET STATES
  detector.hits = 0;
  pose.last = null;
  frameLocked = false;
  lastSeenTime = 0;

  // 🎬 VIDEO SETUP
  player = new VideoPlayer(auth.videoUrl);

  // REQUIRED FOR MOBILE WEBGL VIDEO
  document.body.appendChild(player.video);
  player.video.style.display = "none";

  // 🎨 WEBGL
  gl = new GLRenderer(canvas, player.video);

  requestAnimationFrame(loop);
});


