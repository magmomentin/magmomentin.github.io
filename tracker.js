document.addEventListener("DOMContentLoaded", () => {
  const video = document.getElementById("ar-video");
  const loader = document.getElementById("loader");
  const startBtn = document.getElementById("start-btn");
  const overlay = document.getElementById("ui-overlay");
  const scanFrame = document.querySelector(".scan-frame");
  const muteBtn = document.getElementById("mute-btn");

  const TARGET_ASPECT = 354 / 472;

  const init = async () => {
    const mindarThree = new window.MINDAR.IMAGE.MindARThree({
      container: document.body,
      imageTargetSrc: "assets/targets.mind",
    });

    const { renderer, scene, camera } = mindarThree;

    // Wait for Video Dimensions
    if (video.readyState < 1) {
      await new Promise(res => video.onloadedmetadata = res);
    }

    const videoAspect = video.videoWidth / video.videoHeight;
    const texture = new THREE.VideoTexture(video);

    // Enhancement: Dynamic "Cover" Fit for Magnet Proportions
    if (videoAspect > TARGET_ASPECT) {
      const ratio = TARGET_ASPECT / videoAspect;
      texture.repeat.set(ratio, 1);
      texture.offset.set((1 - ratio) / 2, 0);
    } else {
      const ratio = videoAspect / TARGET_ASPECT;
      texture.repeat.set(1, ratio);
      texture.offset.set(0, (1 - ratio) / 2);
    }

    const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, opacity: 0 });
    const geometry = new THREE.PlaneGeometry(1, 1 / TARGET_ASPECT);
    const plane = new THREE.Mesh(geometry, material);
    plane.position.set(0, 0, 0.01);
    
    const anchor = mindarThree.addAnchor(0);
    anchor.group.add(plane);

    let isTracking = false;

    anchor.onTargetFound = () => {
      isTracking = true;
      video.play();
      scanFrame.classList.add("detected");
      muteBtn.classList.remove("ui-hidden");
    };

    anchor.onTargetLost = () => {
      isTracking = false;
      video.pause();
      scanFrame.classList.remove("detected");
      muteBtn.classList.add("ui-hidden");
    };

    // Enhancement: Stability & Loading Flow
    await mindarThree.start();
    loader.classList.add("ui-hidden");
    startBtn.classList.remove("ui-hidden");

    renderer.setAnimationLoop(() => {
      // Enhancement: Smooth Lerped Transitions
      material.opacity = THREE.MathUtils.lerp(material.opacity, isTracking ? 1 : 0, 0.1);
      plane.visible = material.opacity > 0.005;
      renderer.render(scene, camera);
    });

    muteBtn.onclick = () => {
      video.muted = !video.muted;
      muteBtn.textContent = video.muted ? "🔇" : "🔊";
    };
  };

  startBtn.onclick = () => {
    startBtn.classList.add("ui-hidden");
    overlay.classList.remove("ui-hidden");
    video.play().then(() => video.pause()); // Warm up video for mobile
  };

  init();
});