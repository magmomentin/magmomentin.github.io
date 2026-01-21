const tap = document.getElementById("tap");
const status = document.getElementById("status");

tap.addEventListener("click", async () => {
  tap.innerText = "Starting…";

  try {
    // 1️⃣ Camera permission
    await navigator.mediaDevices.getUserMedia({ video: true });
    status.innerText = "STATUS: Camera OK";

    // 2️⃣ Prepare video (DO NOT pause later)
    const video = document.createElement("video");
    video.src = "assets/demo.mp4";
    video.muted = true;
    video.playsInline = true;
    video.loop = true;

    // IMPORTANT: must be visible (even 1px)
    video.style.position = "fixed";
    video.style.width = "1px";
    video.style.height = "1px";
    video.style.opacity = "0.01";
    document.body.appendChild(video);

    await video.play(); // 🔓 unlocks playback forever

    status.innerText = "STATUS: Video playing";

    // 3️⃣ Init MindAR
    const mindar = new window.MINDAR.IMAGE.MindARThree({
      container: document.body,
      imageTargetSrc: "assets/target.mind"
    });

    const { renderer, scene, camera } = mindar;
    const anchor = mindar.addAnchor(0);

    // 4️⃣ Video texture
    const texture = new THREE.VideoTexture(video);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;

    const geometry = new THREE.PlaneGeometry(1, 1.4);
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true
    });

    const plane = new THREE.Mesh(geometry, material);
    plane.visible = false; // start hidden
    anchor.group.add(plane);

    anchor.onTargetFound = () => {
      console.log("TARGET FOUND");
      status.innerText = "STATUS: TARGET FOUND";
      plane.visible = true;
    };

    anchor.onTargetLost = () => {
      console.log("TARGET LOST");
      status.innerText = "STATUS: TARGET LOST";
      plane.visible = false;
    };

    await mindar.start();

    renderer.setAnimationLoop(() => {
      renderer.render(scene, camera);
    });

    tap.remove();
  } catch (e) {
    console.error(e);
    tap.innerText = "Permission denied";
  }
}, { once: true });
