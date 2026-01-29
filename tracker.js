const startBtn = document.getElementById("start");
const loadingOverlay = document.getElementById("loading-overlay");
const scanOverlay = document.getElementById("scan-overlay");
const muteBtn = document.getElementById("mute-toggle");
const video = document.getElementById("video");

startBtn.onclick = async () => {
  startBtn.style.display = "none";
  loadingOverlay.style.display = "flex";

  try {
    // 1. Load Video
    await new Promise((resolve, reject) => {
      video.onloadedmetadata = () => resolve();
      video.onerror = () => reject("Video failed to load. Check assets/demo.mp4");
      video.muted = true;
      video.play();
    });

    const videoAspect = video.videoWidth / video.videoHeight;

    // 2. Initialize MindAR
    // Ensure window.MINDAR exists
    if (!window.MINDAR) {
      throw new Error("MindAR library not loaded. Check your internet connection.");
    }

    const mindar = new window.MINDAR.IMAGE.MindARThree({
      container: document.body,
      imageTargetSrc: "assets/targets.mind" // CHECK THIS FILE PATH
    });

    const { renderer, scene, camera } = mindar;
    scene.add(mindar.cameraGroup);
    const anchor = mindar.addAnchor(0);

    // 3. Setup Plane
    const texture = new THREE.VideoTexture(video);
    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(videoAspect, 1),
      new THREE.MeshBasicMaterial({ map: texture, transparent: true })
    );
    plane.visible = false;
    anchor.group.add(plane);

    // 4. Anchor Events
    anchor.onTargetFound = () => {
      plane.visible = true;
      scanOverlay.style.display = "none";
      muteBtn.style.display = "block";
    };

    anchor.onTargetLost = () => {
      plane.visible = false;
      scanOverlay.style.display = "flex";
      muteBtn.style.display = "none";
    };

    // 5. Start Engine
    console.log("Starting MindAR...");
    await mindar.start();
    
    // SUCCESS: Hide loading and show scan guide
    console.log("MindAR Started Successfully");
    loadingOverlay.style.display = "none";
    scanOverlay.style.display = "flex";

    renderer.setAnimationLoop(() => {
      texture.needsUpdate = true;
      renderer.render(scene, camera);
    });

  } catch (err) {
    // ERROR: Hide loading so user isn't stuck, and show error
    loadingOverlay.style.display = "none";
    console.error("AR Error:", err);
    alert("Error: " + err);
  }
};
