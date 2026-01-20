const STATE = {
  ACTIVE: "active",
  LOCKED: "locked",
  LOST: "lost"
};

let currentState = STATE.LOST;

function setState(newState) {
  currentState = newState;
  return currentState;
}

window.AR_ENGINE = {
  STATE,
  setState,
  getState: () => currentState
};
