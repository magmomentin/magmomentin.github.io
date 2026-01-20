import{startCamera}from"./camera.js";
import{resolveToken}from"./security/token.js";
import{FrameDetector}from"./detector/frameDetector.js";
import{PoseEstimator}from"./detector/poseEstimator.js";
import{VideoPlayer}from"./media/videoPlayer.js";
import{UIManager}from"./ui/uiManager.js";
import{GLRenderer}from"./renderer/glRenderer.js";

const ui=new UIManager();ui.loading();
const auth=await resolveToken();
const cam=document.getElementById("camera");
const can=document.getElementById("glcanvas");
await startCamera(cam);

const det=new FrameDetector(auth.frameId);
const pose=new PoseEstimator();
const player=new VideoPlayer(auth.videoUrl);
const gl=new GLRenderer(can,player.video);

const C=b=>[[b.x,b.y],[b.x+b.width,b.y],[b.x,b.y+b.height],[b.x+b.width,b.y+b.height]];

function loop(){
const r=det.detect(cam);
if(r){const b=pose.smoothBox(r);player.play();gl.draw(C(b));ui.found();}
else{player.pause();ui.lost();}
requestAnimationFrame(loop);}
requestAnimationFrame(loop);
