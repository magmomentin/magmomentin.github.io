export class VideoPlayer {
  constructor(src) {
    this.video = document.createElement("video");
    this.video.src = src;
    this.video.muted = true;
    this.video.loop = true;
    this.video.playsInline = true;
    this.video.autoplay = false;
    this.video.style.display = "none";
  }

  play() {
    this.video.play().catch(()=>{});
  }

  pause() {
    this.video.pause();
    this.video.currentTime = 0;
  }
}
