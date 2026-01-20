const AR_STATE = {
  ACTIVE: "active",
  LOCKED: "locked",
  LOST: "lost"
};

let currentState = AR_STATE.LOST;
let lastSeen = 0;

function updateState(detected, confidence) {
  const now = performance.now();

  if (detected && confidence >= 0.85) {
    currentState = AR_STATE.ACTIVE;
    lastSeen = now;
  } 
  else if (detected && confidence >= 0.55) {
    currentState = AR_STATE.LOCKED;
    lastSeen = now;
  } 
  else if (now - lastSeen > 600) {
    currentState = AR_STATE.LOST;
  }

  return currentState;
}
