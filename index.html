const tap = document.getElementById("tap");

tap.addEventListener("click", async () => {
  tap.innerText = "Starting camera…";

  try {
    // 🔒 Force mobile camera permission
    await navigator.mediaDevices.getUserMedia({ video: true });

    tap.innerText = "Camera granted. Starting AR…";

    // Init MindAR AFTER permission
    const mindar = new window.MINDAR.IMAGE.MindARThree({
      container: document.body,
      imageTargetSrc: "assets/target.mind"
    });

    const { renderer, scene, camera } = mindar;

    await mindar.start();

    renderer.setAnimationLoop(() => {
      renderer.render(scene, camera);
    });

    tap.remove(); // success
  } catch (err) {
    console.error(err);
    tap.innerText = "Camera permission denied";
  }
}, { once: true });
