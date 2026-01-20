export class FrameDetector {
  constructor(frame) {
    this.frame = frame;
    this.hits = 0;
    this.c = document.createElement("canvas");
    this.ctx = this.c.getContext("2d", { willReadFrequently: true });
  }

  detect(video) {
    if (!video.videoWidth) return null;

    this.c.width = 160;
    this.c.height = 120;
    this.ctx.drawImage(video, 0, 0, 160, 120);

    const d = this.ctx.getImageData(0,0,160,120).data;
    let e = 0;
    for (let i=4;i<d.length-4;i+=4) e+=Math.abs(d[i]-d[i+4]);

    if (e < 120000) {
      this.hits = 0;
      return null;
    }

    this.hits++;
    if (this.hits < 4) return null;

    const h = video.videoHeight * 0.6;
    const w = h * this.frame.aspect;

    return {
      x: (video.videoWidth - w)/2,
      y: (video.videoHeight - h)/2,
      width: w,
      height: h
    };
  }
}
