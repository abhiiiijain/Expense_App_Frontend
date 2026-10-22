import {
  platformAuthenticatorIsAvailable,
  startAuthentication,
  startRegistration,
} from "@simplewebauthn/browser";

let availablePromise;

export function deviceUnlockAvailable() {
  if (!availablePromise) {
    availablePromise = platformAuthenticatorIsAvailable().catch(() => false);
  }
  return availablePromise;
}

function isBiometricCancel(error) {
  const flags = [error?.name, error?.cause?.name, error?.code];
  return flags.some(
    (value) =>
      value === "NotAllowedError" ||
      value === "AbortError" ||
      value === "ERROR_CEREMONY_ABORTED"
  );
}

export function biometricErrorMessage(error, fallback) {
  if (isBiometricCancel(error)) return "";
  return error?.response?.data?.message || error?.message || fallback;
}

export function createDeviceCredential(options) {
  return startRegistration({ optionsJSON: options });
}

export function assertDeviceCredential(options) {
  return startAuthentication({ optionsJSON: options });
}
