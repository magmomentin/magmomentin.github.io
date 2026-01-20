document.addEventListener("DOMContentLoaded", () => {
  const scene = document.querySelector("a-scene");
  const video = document.querySelector("#magVideo");

  // MindAR ready
  scene.addEventListener("arReady", () => {
    console.log("MindAR is ready.");
    document.getElementById("loading").style.display = "none";
  });

  // MindAR error
  scene.addEventListener("arError", () => {
    console.error("MindAR failed to start.");
  });

  // When A-Frame + MindAR fully loaded
  scene.addEventListener("renderstart", () => {
    const mindarSystem = scene.systems["mindar-image-system"];

    if (!mindarSystem) {
      console.error("MindAR system missing — check your <script> imports.");
      return;
    }

    // Attach events
    mindarSystem.addEventListener("targetFound", () => {
      console.log("Target found — playing video");
      video.play();
    });

    mindarSystem.addEventListener("targetLost", () => {
      console.log("Target lost — pausing video");
      video.pause();
    });
  });
});
