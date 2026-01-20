document.addEventListener("DOMContentLoaded", () => {
  const scene = document.querySelector("a-scene");
  const video = document.querySelector("#magVideo");

  // MindAR events - update
  scene.addEventListener("arReady", () => {
    console.log("MindAR ready");
  });

  scene.addEventListener("arError", () => {
    alert("AR failed to start");
  });

  // Wait until A-Frame actually finishes loading
  scene.addEventListener("loaded", () => {
    const mindarSystem = scene.systems["mindar-image-system"];

    // MindAR emits these events through its system
    mindarSystem.on("targetFound", () => {
      console.log("Target found — playing video");
      video.play();
    });

    mindarSystem.on("targetLost", () => {
      console.log("Target lost — pausing video");
      video.pause();
    });
  });
});
