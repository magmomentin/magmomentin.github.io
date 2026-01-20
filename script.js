AFRAME.registerComponent("play-on-target", {
  init: function () {
    const videoEl = document.querySelector("#promo");
    const target = this.el;

    target.addEventListener("targetFound", () => {
      videoEl.play();
      target.setAttribute("visible", "true");
      console.log("🎯 Target found — playing video");
    });

    target.addEventListener("targetLost", () => {
      videoEl.pause();
      target.setAttribute("visible", "false");
      console.log("🚫 Target lost — pausing video");
    });
  },
});
