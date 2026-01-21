const video = document.getElementById("arVideo");

const mindar = new window.MINDAR.IMAGE.MindARController({
  container: document.body,
  imageTargetSrc: "assets/target.mind"
});

(async () => {
  await mindar.start();

  mindar.on("targetFound", () => {
    video.style.display = "block";
    video.play();
  });

  mindar.on("targetLost", () => {
    video.style.display = "none";
  });
})();
