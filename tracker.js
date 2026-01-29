document.addEventListener("DOMContentLoaded", () => {
  const video = document.getElementById("ar-video");
  const loader = document.getElementById("loader");
  const startBtn = document.getElementById("start-btn");
  const overlay = document.getElementById("ui-overlay");
  const scanFrame = document.querySelector(".scan-frame");
  const muteBtn = document.getElementById("mute-btn");

  // YOUR MAGNET RATIO: 354 (width) / 472 (height)
  const TARGET_ASPECT = 354 / 472; 

  const initAR = async () => {
    const mindarThree = new window.MINDAR.IMAGE.MindARThree({
      container: document.body,
      imageTargetSrc: "assets/targets.mind",
      filterMinCF: 0.0001,
      filterBeta: 0.001,
    });

    const { renderer, scene, camera } = mindarThree;

    // FIX: Match 3D math to the actual pixels on the screen
    const handleResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(window.devicePixelRatio);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    if (video.readyState < 1) {
      await new Promise(res => video.onloadedmetadata = res);
    }

    const texture = new THREE.VideoTexture(video);
    const material = new THREE.MeshBasicMaterial({ 
      map: texture, 
      transparent: true, 
      opacity: 0,
      depthWrite: false // Stops flickering
    });

    // FIX: Plane matches your target height ratio (1.333)
    const geometry = new THREE.PlaneGeometry(1, 1 / TARGET_ASPECT);
    const plane = new THREE.Mesh(geometry, material);
    
    // Offset forward to sit cleanly on top of the magnet
    plane.position.set(0, 0, 0.1); 
    
    const anchor = mindarThree.addAnchor(0);
    anchor.group.add(plane);

    let isTracking = false;

    anchor.onTargetFound = () => {
      isTracking = true;
      video.play().catch(() => {}); 
      scanFrame.classList.add("detected");
      muteBtn.classList.remove("ui-hidden");
    };

    anchor.onTargetLost = () => {
      isTracking = false;
      video.pause();
      scanFrame.classList.remove("detected");
      muteBtn.classList.add("ui-hidden");
    };

    await mindarThree.start();
    loader.classList.add("ui-hidden");
    startBtn.classList.remove("ui-hidden");

    renderer.setAnimationLoop(() => {
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
    window.dispatchEvent(new Event('resize')); 
    video.play().then(() => video.pause()); 
  };

  initAR();
});