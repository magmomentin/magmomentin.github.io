import{startCamera}from"./camera.js";
import{resolveToken}from"./security/token.js";
import{FrameDetector}from"./detector/frameDetector.js";
import{PoseEstimator}from"./detector/poseEstimator.js";
import{VideoPlayer}from"./media/videoPlayer.js";
import{UIManager}from"./ui/uiManager.js";
import{GLRenderer}from"./renderer/glRenderer.js";

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
const r=detector.detect(cam);
if(r){
const b=pose.smoothBox(r);
player.play();
gl.draw(toCorners(b));
ui.found();
}else{
player.pause();
ui.lost();
}
requestAnimationFrame(loop);
}

ui.waitForTap(() => {
  player = new VideoPlayer(auth.videoUrl);

  // 🔑 CRITICAL FIX: attach video to DOM (hidden)
  document.body.appendChild(player.video);
  player.video.style.display = "none";

  gl = new GLRenderer(canvas, player.video);
  requestAnimationFrame(loop);
});

