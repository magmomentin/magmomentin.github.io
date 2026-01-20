export class UI {
  constructor() {
    this.hint = document.getElementById("hint");
  }

  waitForTap(cb) {
    this.hint.onclick = () => {
      this.hint.textContent = "";
      cb();
    };
  }

  found() {
    this.hint.textContent = "Hold steady";
  }

  lost() {
    this.hint.textContent = "Point camera at the frame";
  }
}
