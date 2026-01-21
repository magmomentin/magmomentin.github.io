const start = document.getElementById("start");
const video = document.getElementById("video");

/* ========= PROGRESSION CONFIG ========= */
const FRAME = {
  height: 1.0,        // world units
  aspect: 2 / 3,      // target image ratio (portrait)
  fadeSpeed: 0.12,    // opacity smoothing
  scaleIn: 0.96       // subtle scale-in on appear
};
/* ===================================== */

start.onclick = async () => {
  start.remove();

  // Unlock video playback (DO NOT TOUCH CAMERA)
  await video.play();

  const mindar = new window.MINDAR.IMAGE.MindARThree({
    container: document.body,
    imageTargetSrc: "assets/target.mind"
  });

  const { renderer, scene, camera } = mindar;

  // 🔑 Attach camera feed (CRITICAL FOR REAL AR)
  scene.add(mindar.cameraGroup);

  // Keep renderer correct on resize
  const resize = () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  };
  resize();
  window.addEventListener("resize", resize);

  // Single image target
  const anchor = mindar.addAnchor(0);

  // Video texture
  const texture = new THREE.VideoTexture(video);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;

  // Video cover logic (no black bars)
  const applyCover = () => {
    const videoAspect = video.videoWidth / video.videoHeight || FRAME.aspect;

    if (videoAspect > FRAME.aspect) {
      const s = FRAME.aspect / videoAspect;
      texture.repeat.set(s, 1);
      texture.offset.set((1 - s) / 2, 0);
    } else {
      const s = videoAspect / FRAME.aspect;
      texture.repeat.set(1, s);
      texture.offset.set(0, (1 - s) / 2);
    }
  };

  if (video.readyState >= 2) applyCover();
  else video.onloadedmetadata = applyCover;

  // Frame-locked plane
  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(
      FRAME.height * FRAME.aspect,
      FRAME.height
    ),
    new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthTest: false
    })
  );

  plane.position.z = 0.01;
  plane.scale.set(FRAME.scaleIn, FRAME.scaleIn, 1);
  anchor.group.add(plane);

  let targetVisible = false;
  let lostTimer = null;

  // Tracking stability smoothing
  anchor.onTargetFound = () => {
    if (lostTimer) clearTimeout(lostTimer);
    targetVisible = true;
  };

  anchor.onTargetLost = () => {
    lostTimer = setTimeout(() => {
      targetVisible = false;
    }, 250); // grace period
  };

  // Start AR (camera opens here)
  await mindar.start();

  // Render loop with polish
  renderer.setAnimationLoop(() => {
    if (video.readyState >= 2) {
      texture.needsUpdate = true;
    }

    // Smooth fade
    const targetOpacity = targetVisible ? 1 : 0;
    plane.material.opacity +=
      (targetOpacity - plane.material.opacity) * FRAME.fadeSpeed;

    // Gentle scale settle
    const targetScale = targetVisible ? 1 : FRAME.scaleIn;
    plane.scale.x += (targetScale - plane.scale.x) * FRAME.fadeSpeed;
    plane.scale.y += (targetScale - plane.scale.y) * FRAME.fadeSpeed;

    renderer.render(scene, camera);
  });
};
