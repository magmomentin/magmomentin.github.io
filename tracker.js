const video = document.getElementById("arVideo");
const container = document.getElementById("ar-container");

/* --------------------
   FORCE CAMERA PERMISSION FIRST
-------------------- */
async function warmUpCamera() {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: "environment" },
    audio: false
  });
  stream.getTracks().forEach(track => track.stop());
}

/* --------------------
   STATE
-------------------- */
let confirmed = false;
let detectStartTime = null;
const CONFIRM_TIME = 500;

/* --------------------
   INIT
-------------------- */
(async () => {
  try {
    // 🔥 THIS IS THE KEY FIX
    await warmUpCamera();

    const mindar = new window.MINDAR.IMAGE.MindARImage({
      container,
      imageTargetSrc: "assets/target.mind",
      maxTrack: 1
    });

    const { renderer, scene, camera } = mindar;
    const anchor = mindar.addAnchor(0);

    video.pause();
    video.currentTime = 0;
    video.style.display = "none";

    anchor.onTargetFound = () => {
      if (!detectStartTime) {
        detectStartTime = Date.now();
        return;
      }

      if (!confirmed && Date.now() - detectStartTime > CONFIRM_TIME) {
        confirmed = true;
        video.style.display = "block";
        video.play();
      }
    };

    anchor.onTargetLost = () => {
      detectStartTime = null;
      confirmed = false;
      video.pause();
      video.style.display = "none";
    };

    await mindar.start();
    renderer.setAnimationLoop(() => {
      renderer.render(scene, camera);
    });

  } catch (e) {
    alert("Camera access failed. Please allow camera permission.");
    console.error(e);
  }
})();
