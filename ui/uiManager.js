export class UIManager {
  constructor() {
    this.hint = document.getElementById("hint");
  }

  waitForTap(cb) {
    this.hint.innerText = "Tap to start AR";
    this.hint.style.pointerEvents = "auto";

    const onTap = () => {
      this.hint.removeEventListener("click", onTap);
      this.hint.style.pointerEvents = "none";
      this.hint.innerText = "";
      cb();
    };

    this.hint.addEventListener("click", onTap);
  }

  found() {
    this.hint.innerText = "Hold steady";
  }

  lost() {
    this.hint.innerText = "Point camera at the frame";
  }
}
