export class Pose {
  constructor() {
    this.last = null;
    this.smoothFactor = 0.85;
  }

  smooth(b) {
    if (!this.last) {
      this.last = b;
      return b;
    }

    const l = (a,c) => a*this.smoothFactor + c*(1-this.smoothFactor);

    const out = {
      x: l(this.last.x,b.x),
      y: l(this.last.y,b.y),
      width: l(this.last.width,b.width),
      height: l(this.last.height,b.height)
    };

    this.last = out;
    return out;
  }
}
