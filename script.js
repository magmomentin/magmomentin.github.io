document.addEventListener("DOMContentLoaded", async () => {
  const mindarThree = new window.MINDAR.IMAGE.MindARThree({
    container: document.querySelector("#container"),
    imageTargetSrc: "./targets.mind",
  });

  const { renderer, scene, camera } = mindarThree;

  const anchor = mindarThree.addAnchor(0);

  // --- Add simple cube to confirm it's working ---
  const cube = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.5, 0.5),
    new THREE.MeshNormalMaterial()
  );
  anchor.group.add(cube);

  await mindarThree.start();

  renderer.setAnimationLoop(() => {
    cube.rotation.y += 0.03;
    cube.rotation.x += 0.02;
    renderer.render(scene, camera);
  });
});
