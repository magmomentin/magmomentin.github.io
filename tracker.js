document.getElementById("start-btn").addEventListener("click", async () => {
  const video = document.getElementById("ar-video");
  const overlay = document.getElementById("ui-overlay");
  const muteBtn = document.getElementById("mute-btn");

  // ---- unlock video (mobile requirement)
  video.muted = true;
  await video.play();
  video.pause();
  video.currentTime = 0;

  document.getElementById("start-btn").style.display = "none";

  const THREE = window.MINDAR.IMAGE.THREE;

  const mindarThree = new window.MINDAR.IMAGE.MindARThree({
    container: document.querySelector("#ar-container"),
    imageTargetSrc: "assets/targets.mind",
  });

  const { renderer, scene, camera } = mindarThree;

  // ---- video texture
  const texture = new THREE.VideoTexture(video);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.colorSpace = THREE.SRGBColorSpace;

  // ---- plane (MUST stay in anchor)
  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1),
    new THREE.MeshBasicMaterial({ map: texture })
  );
  plane.position.z = 0.01;

  const anchor = mindarThree.addAnchor(0);
  anchor.group.add(plane);
  anchor.group.visible = false;

  anchor.onTargetFound = async () => {
    anchor.group.visible = true;
    await video.play();
    overlay.classList.add("ui-hidden");
    muteBtn.classList.remove("ui-hidden");
  };

  anchor.onTargetLost = () => {
    anchor.group.visible = false;
    video.pause();
    overlay.classList.remove("ui-hidden");
    muteBtn.classList.add("ui-hidden");
  };

  muteBtn.onclick = () => {
    video.muted = !video.muted;
    muteBtn.textContent = video.muted ? "🔇" : "🔊";
  };

  await mindarThree.start();

  renderer.setAnimationLoop(() => {
    if (!video.paused && video.readyState >= 2) {
      texture.needsUpdate = true;
    }
    renderer.render(scene, camera);
  });
});
