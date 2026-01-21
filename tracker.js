const tap = document.getElementById("tap");
const status = document.getElementById("status");

tap.addEventListener("click", async () => {
  try {
    status.innerText = "STATUS: requesting camera";
    await navigator.mediaDevices.getUserMedia({ video: true });

    // Create video element (VISIBLE 1px)
    const video = document.createElement("video");
    video.src = "assets/demo.mp4";
    video.muted = true;
    video.playsInline = true;
    video.loop = true;

    video.style.position = "fixed";
    video.style.width = "1px";
    video.style.height = "1px";
    video.style.opacity = "0.01";
    document.body.appendChild(video);

    // HARD VIDEO EVENTS
    video.onloadeddata = () => {
      console.log("VIDEO loadeddata");
      status.innerText = "STATUS: video loaded";
    };

    video.onplaying = () => {
      console.log("VIDEO playing");
      status.innerText = "STATUS: video playing";
    };

    video.ontimeupdate = () => {
      console.log("VIDEO time:", video.currentTime.toFixed(2));
    };

    await video.play(); // unlock playback

    // Init MindAR
    const mindar = new window.MINDAR.IMAGE.MindARThree({
      container: document.body,
      imageTargetSrc: "assets/target.mind"
    });

    const { renderer, scene, camera } = mindar;
    const anchor = mindar.addAnchor(0);

    const texture = new THREE.VideoTexture(video);
    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1.4),
      new THREE.MeshBasicMaterial({ map: texture })
    );
    plane.visible = false;
    anchor.group.add(plane);

    anchor.onTargetFound = () => {
      status.innerText = "STATUS: TARGET FOUND";
      plane.visible = true;
    };

    anchor.onTargetLost = () => {
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
    status.innerText = "STATUS: PERMISSION DENIED";
  }
}, { once: true });
