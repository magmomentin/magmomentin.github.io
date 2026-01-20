import { startCamera } from "./core/camera.js";
import { FrameDetector } from "./core/detector.js";
import { Pose } from "./core/pose.js";
import { Renderer } from "./core/renderer.js";
import { VideoPlayer } from "./media/videoPlayer.js";
import { UI } from "./ui/ui.js";
import { FRAMES } from "./data/frames.js";

const cam = document.getElementById("camera");
const canvas = document.getElementById("glcanvas");

const ui = new UI();
const detector = new FrameDetector(FRAMES[0]);
const pose = new Pose();

let arStarted = false;
let videoReady = false;
let player = null;
let renderer = null;

await startCamera(cam);

ui.waitForTap(() => {
  arStarted = true;
  requestAnimationFrame(loop);
});

function loop() {
  if (!arStarted) return requestAnimationFrame(loop);

  const box = detector.detect(cam);

  if (box) {
    ui.found();

    if (!videoReady) {
      player = new VideoPlayer("./assets/videos/demo.mp4");
      document.body.appendChild(player.video);
      renderer = new Renderer(canvas, player.video);
      videoReady = true;
    }

    player.play();
    renderer.draw(pose.smooth(box));

  } else {
    ui.lost();
    if (player) player.pause();
    if (renderer) renderer.clear();
  }

  requestAnimationFrame(loop);
}
