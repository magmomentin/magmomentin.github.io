import { MindARImage } from "https://unpkg.com/mind-ar@1.2.4/dist/mindar-image.esm.js";

const video = document.getElementById("arVideo");

const mindar = new MindARImage({
  container: document.body,
  imageTargetSrc: "assets/target.mind"
});

await mindar.start();

mindar.addEventListener("targetFound", () => {
  video.style.display = "block";
  video.style.opacity = "1";
  video.play();
});

mindar.addEventListener("targetLost", () => {
  video.style.opacity = "0";
});
