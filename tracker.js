const start   = document.getElementById("start");
const status  = document.getElementById("status");
const video   = document.getElementById("video");

const fbWrap  = document.getElementById("fallback");
const fbVideo = document.getElementById("fallbackVideo");

/* CONFIG */
const FRAME_ASPECT = 2 / 3;
const FRAME_HEIGHT = 1.0;
const FADE_SPEED   = 0.08;
const FAIL_TIMEOUT = 2000;

let stage3OK = false;
let targetVisible = false;

start.addEventListener("click", async () => {
  try {
    start.style.display = "none";
    status.textContent = "STATUS: Starting AR";

    // 🔑 Unlock video playback (do NOT touch camera)
    await video.play();

    // Prepare fallback video
    fbVideo.src = video.currentSrc || video.src;
    fbVideo.play().catch(() => {});

    // Init MindAR INSIDE user gesture
    const mindar = new window.MINDAR.IMAGE.MindARThree({
      container: document.body,
      imageTargetSrc: "assets/target.mind"
    });

    const { renderer, scene, camera } = mindar;

    const resize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    };
    resize();
    window.addEventListener("resize", resize);

    const anchor = mindar.addAnchor(0);

    const texture = new THREE.VideoTexture(video);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;

    // Cover logic
    const applyCover = () => {
      const vAspect = video.videoWidth / video.videoHeight || (9 / 16);
      if (vAspect > FRAME_ASPECT) {
        const s = FRAME_ASPECT / vAspect;
        texture.repeat.set(s, 1);
        texture.offset.set((1 - s) / 2, 0);
      } else {
        const s = vAspect / FRAME_ASPECT;
        texture.repeat.set(1, s);
        texture.offset.set(0, (1 - s) / 2);
      }
    };
    if (video.readyState >= 2) applyCover();
    else video.onloadedmetadata = applyCover;

    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(FRAME_HEIGHT * FRAME_ASPECT, FRAME_HEIGHT),
      new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
        depthTest: false
      })
    );
    plane.position.z = 0.01;
    anchor.group.add(plane);

    anchor.onTargetFound = () => {
      status.textContent = "STATUS: TARGET FOUND";
      targetVisible = true;
    };

    anchor.onTargetLost = () => {
      status.textContent = "STATUS: TARGET LOST";
      targetVisible = false;
    };

    // 🔑 Start MindAR (camera opens here)
    await mindar.start();

    // Reveal camera canvas AFTER stream is live
    const canvas = document.querySelector("canvas");
    if (canvas) canvas.classList.add("active");

    status.textContent = "STATUS: Scanning";

    // Stage-3 health check
    const t0 = video.currentTime;
    setTimeout(() => {
      if (video.currentTime > t0 + 0.05) {
        stage3OK = true;
        status.textContent = "STATUS: Stage-3 active";
      } else {
        fbWrap.style.display = "flex";
        status.textContent = "STATUS: Fallback mode";
      }
    }, FAIL_TIMEOUT);

    renderer.setAnimationLoop(() => {
      texture.needsUpdate = true;

      if (stage3OK) {
        plane.material.opacity +=
          ((targetVisible ? 1 : 0) - plane.material.opacity) * FADE_SPEED;
      } else {
        fbVideo.style.opacity = targetVisible ? 1 : 0;
      }

      renderer.render(scene, camera);
    });

  } catch (e) {
    console.error(e);
    status.textContent = "STATUS: Permission denied";
    start.style.display = "flex";
  }
}, { once: true });
