const start = document.getElementById("start");
const status = document.getElementById("status");
const video = document.getElementById("video");

start.addEventListener("click", async () => {
  try {
    status.innerText = "STATUS: Requesting camera";

    // Camera permission
    await navigator.mediaDevices.getUserMedia({ video: true });

    // Unlock video playback
    await video.play();
    status.innerText = "STATUS: Video unlocked";

    // Init MindAR
    const mindar = new window.MINDAR.IMAGE.MindARThree({
      container: document.body,
      imageTargetSrc: "assets/target.mind"
    });

    const { renderer, scene, camera } = mindar;

    // Fullscreen renderer
    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    window.addEventListener("resize", resize);

    // Anchor
    const anchor = mindar.addAnchor(0);

    // Video texture
    const texture = new THREE.VideoTexture(video);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;

    // ===== COVER LOGIC (NO BLACK BARS) =====
    const FRAME_ASPECT = 2 / 3; // photo/frame aspect
    const VIDEO_ASPECT = video.videoWidth / video.videoHeight || (9 / 16);

    if (VIDEO_ASPECT > FRAME_ASPECT) {
      // Video too wide → crop left/right
      const scale = FRAME_ASPECT / VIDEO_ASPECT;
      texture.repeat.set(scale, 1);
      texture.offset.set((1 - scale) / 2, 0);
    } else {
      // Video too tall → crop top/bottom
      const scale = VIDEO_ASPECT / FRAME_ASPECT;
      texture.repeat.set(1, scale);
      texture.offset.set(0, (1 - scale) / 2);
    }

    texture.needsUpdate = true;
    // ======================================

    // Frame plane (exact frame size)
    const FRAME_HEIGHT = 1.0;
    const FRAME_WIDTH = FRAME_HEIGHT * FRAME_ASPECT;

    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(FRAME_WIDTH, FRAME_HEIGHT),
      new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.DoubleSide,
        depthTest: false
      })
    );

    plane.visible = false;
    plane.position.z = 0.01;
    anchor.group.add(plane);

    // Tracking callbacks
    anchor.onTargetFound = () => {
      status.innerText = "STATUS: TARGET FOUND – VIDEO PLAYING";
      plane.visible = true;
    };

    anchor.onTargetLost = () => {
      status.innerText = "STATUS: TARGET LOST";
      plane.visible = false;
    };

    await mindar.start();

    renderer.setAnimationLoop(() => {
      texture.needsUpdate = true;
      renderer.render(scene, camera);
    });

    start.remove();
  } catch (err) {
    console.error(err);
    status.innerText = "STATUS: Permission denied";
  }
}, { once: true });
