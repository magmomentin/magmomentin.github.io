document.addEventListener("DOMContentLoaded", () => {
  const video = document.querySelector("#magVideo");

  document
    .querySelector("a-scene")
    .addEventListener("arReady", () => {
      console.log("MindAR ready");
    });

  document
    .querySelector("a-scene")
    .addEventListener("arError", () => {
      alert("AR failed to start");
    });

  AFRAME.scenes[0].addEventListener("targetFound", () => {
    video.play();
  });

  AFRAME.scenes[0].addEventListener("targetLost", () => {
    video.pause();
  });
});
