let appSession = null;
let generation = 0;
let pinRequestInFlight = false;
const listeners = new Set();

export function beginPinSubmit() {
  if (pinRequestInFlight) return false;
  pinRequestInFlight = true;
  return true;
}

export function endPinSubmit() {
  pinRequestInFlight = false;
}

export function getAppSession() {
  return appSession;
}

export function getAppSessionGeneration() {
  return generation;
}

export function setAppSession(token) {
  if (!token) {
    generation += 1;
    appSession = null;
  } else {
    appSession = token;
  }
  listeners.forEach((listener) => listener(appSession));
}

export function subscribeAppSession(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
