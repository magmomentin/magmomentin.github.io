export class VideoPlayer {
  constructor(url) {
    this.video = document.createElement("video");

    // 🔑 REQUIRED FOR WEBGL
    this.video.crossOrigin = "anonymous";

    this.video.src = url;
    this.video.loop = true;
    this.video.muted = true;
    this.video.playsInline = true;
  }

  play() {
    if (this.video.paused) this.video.play();
  }

  pause() {
    if (!this.video.paused) this.video.pause();
  }
}
