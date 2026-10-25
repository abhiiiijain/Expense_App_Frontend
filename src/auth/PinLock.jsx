import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useAuth } from "./AuthContext";
import { beginPinSubmit, endPinSubmit, setAppSession } from "./appSession";
import {
  persistUser,
  resetPin,
  setupPin,
  verifyPin,
  beginWebAuthnAuthentication,
  finishWebAuthnAuthentication,
} from "./authService";
import { assertDeviceCredential, biometricErrorMessage, deviceUnlockAvailable } from "./biometric";
import AuthLayout from "./AuthLayout";
import PasswordInput from "./PasswordInput";
import PinPad from "./PinPad";
import LoadingSpinner from "../components/LoadingSpinner";

function errorMessage(error, fallback) {
  return error?.response?.data?.message || error?.message || fallback;
}

const TITLES = {
  create: "Create a PIN",
  confirm: "Confirm your PIN",
  "reset-password": "Reset PIN",
  "reset-pin": "Choose a new PIN",
  "reset-confirm": "Confirm new PIN",
  enter: "Enter your PIN",
};

function FingerprintIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 11.5v4.25m0-8.5a4.25 4.25 0 014.25 4.25M7.75 11.25A4.25 4.25 0 0112 7m5.25 8.25c0 2.9-2.35 5.25-5.25 5.25S6.75 18.15 6.75 15.25m9.5-7.5A6.75 6.75 0 0012 4.5a6.75 6.75 0 00-6.75 6.75" />
    </svg>
  );
}

function PinLock({ mode }) {
  const { user, setUser, logout } = useAuth();
  const [phase, setPhase] = useState(mode === "setup" ? "create" : "enter");
  const [firstPin, setFirstPin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [padKey, setPadKey] = useState(0);
  const [deviceReady, setDeviceReady] = useState(false);
  const [deviceChecked, setDeviceChecked] = useState(false);
  const [usePinFallback, setUsePinFallback] = useState(false);

  const resetPad = useCallback(() => setPadKey((value) => value + 1), []);

  const rememberUser = useCallback(
    (patch) => {
      setUser((current) => {
        const next = current ? { ...current, ...patch } : current;
        if (next) persistUser(next);
        return next;
      });
    },
    [setUser]
  );

  const unlockWith = useCallback(
    (token) => {
      setAppSession(token);
      rememberUser({ pinSet: true });
    },
    [rememberUser]
  );

  const finishPinEntry = useCallback(
    async (pin, entryPhase, onMatch) => {
      if (!beginPinSubmit()) return;

      const confirmPhase = entryPhase === "create" ? "confirm" : "reset-confirm";
      if (phase === entryPhase) {
        setFirstPin(pin);
        setError("");
        setPhase(confirmPhase);
        resetPad();
        endPinSubmit();
        return;
      }

      if (pin !== firstPin) {
        setFirstPin("");
        setError("PINs do not match. Choose it again.");
        setPhase(entryPhase);
        resetPad();
        endPinSubmit();
        return;
      }

      try {
        setBusy(true);
        await onMatch(pin);
      } catch (err) {
        if (entryPhase === "create" && err?.response?.status === 409) {
          rememberUser({ pinSet: true });
          return;
        }
        setError(errorMessage(err, entryPhase === "create" ? "Could not save PIN" : "Could not reset PIN"));
        setPhase(entryPhase === "create" ? "create" : "reset-password");
        setFirstPin("");
        resetPad();
      } finally {
        setBusy(false);
        endPinSubmit();
      }
    },
    [firstPin, phase, rememberUser, resetPad]
  );

  const handleSetup = useCallback(
    (pin) =>
      finishPinEntry(pin, "create", async (confirmed) => {
        const result = await setupPin(confirmed);
        unlockWith(result.appSession);
      }),
    [finishPinEntry, unlockWith]
  );

  const runUnlock = useCallback(
    async (work, onError) => {
      if (!beginPinSubmit()) return;
      try {
        setBusy(true);
        setError("");
        await work();
      } catch (err) {
        onError(err);
      } finally {
        setBusy(false);
        endPinSubmit();
      }
    },
    []
  );

  const handleUnlock = useCallback(
    (pin) =>
      runUnlock(
        async () => {
          setAppSession(await verifyPin(pin));
        },
        (err) => {
          setError(errorMessage(err, "Incorrect PIN"));
          resetPad();
        }
      ),
    [resetPad, runUnlock]
  );

  const handleBiometricUnlock = useCallback(
    () =>
      runUnlock(
        async () => {
          const options = await beginWebAuthnAuthentication();
          const assertion = await assertDeviceCredential(options);
          setAppSession(await finishWebAuthnAuthentication(assertion));
        },
        (err) => {
          const message = biometricErrorMessage(err, "Fingerprint or Face ID did not work");
          if (message) setError(message);
        }
      ),
    [runUnlock]
  );

  useEffect(() => {
    if (mode !== "unlock" || !user?.biometricEnabled) {
      setDeviceReady(false);
      setDeviceChecked(true);
      return undefined;
    }
    let cancelled = false;
    setDeviceChecked(false);
    deviceUnlockAvailable().then((available) => {
      if (!cancelled) {
        setDeviceReady(available);
        setDeviceChecked(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [mode, user?.biometricEnabled]);

  const showBiometric = mode === "unlock" && phase === "enter" && deviceReady && user?.biometricEnabled;
  const preferBiometric = showBiometric && !usePinFallback;
  const waitingOnDevice =
    mode === "unlock" &&
    phase === "enter" &&
    Boolean(user?.biometricEnabled) &&
    !deviceChecked &&
    !usePinFallback;

  const biometricUnlockRef = useRef(handleBiometricUnlock);
  biometricUnlockRef.current = handleBiometricUnlock;

  useEffect(() => {
    if (!preferBiometric) return undefined;
    const timer = window.setTimeout(() => {
      biometricUnlockRef.current();
    }, 200);
    return () => window.clearTimeout(timer);
  }, [preferBiometric]);

  const handleResetPin = useCallback(
    (pin) =>
      finishPinEntry(pin, "reset-pin", async (confirmed) => {
        const result = await resetPin(password, confirmed);
        setPassword("");
        unlockWith(result.appSession);
        toast.success("PIN updated", { position: "top-center" });
      }),
    [finishPinEntry, password, unlockWith]
  );

  const title = preferBiometric || waitingOnDevice ? "Unlock SpendWise" : TITLES[phase] || TITLES.enter;

  const subtitle =
    mode === "setup"
      ? "SpendWise asks for this PIN whenever you switch away or close the app."
      : phase.startsWith("reset")
        ? "Confirm with your account password, then choose a new 4-digit PIN."
        : preferBiometric || waitingOnDevice
          ? `Welcome back${user?.firstName ? `, ${user.firstName}` : ""}. Use Face ID or fingerprint.`
          : `Welcome back${user?.firstName ? `, ${user.firstName}` : ""}`;

  const onComplete = mode === "setup" ? handleSetup : phase.startsWith("reset") ? handleResetPin : handleUnlock;
  const showPad = phase !== "reset-password" && !preferBiometric && !waitingOnDevice;

  return (
    <AuthLayout compact title={title} subtitle={subtitle}>
      {phase === "reset-password" ? (
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            setError("");
            setPhase("reset-pin");
          }}
        >
          <PasswordInput
            id="reset-pin-password"
            label="Account password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your password"
          />
          {error ? (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          ) : null}
          <button type="submit" className="sw-btn-primary">
            Continue
          </button>
          <button
            type="button"
            className="w-full text-sm font-semibold text-ink-muted"
            onClick={() => {
              setPhase("enter");
              setError("");
              setPassword("");
            }}
          >
            Back to PIN
          </button>
        </form>
      ) : null}

      {preferBiometric || waitingOnDevice ? (
        <div className="space-y-3">
          <button
            type="button"
            className="sw-btn-primary"
            onClick={handleBiometricUnlock}
            disabled={busy || waitingOnDevice}
          >
            {busy || waitingOnDevice ? (
              <LoadingSpinner className="h-4 w-4" />
            ) : (
              <FingerprintIcon className="h-5 w-5" />
            )}
            {busy
              ? "Waiting for Face ID or fingerprint…"
              : waitingOnDevice
                ? "Checking this device…"
                : "Unlock with Face ID or fingerprint"}
          </button>
          {error ? (
            <p className="text-sm text-red-600 text-center" role="alert">
              {error}
            </p>
          ) : null}
        </div>
      ) : null}

      {showPad ? (
        <PinPad
          key={padKey}
          onComplete={onComplete}
          onEdit={() => setError("")}
          disabled={busy}
          error={error}
        />
      ) : null}

      {showBiometric && usePinFallback ? (
        <button
          type="button"
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl py-2 text-sm font-semibold text-sage-700 transition disabled:opacity-50"
          style={{ background: "var(--sw-muted-bg)" }}
          onClick={() => {
            setUsePinFallback(false);
            setError("");
          }}
          disabled={busy}
        >
          <FingerprintIcon className="h-4 w-4" />
          Use fingerprint or Face ID
        </button>
      ) : null}

      <div className="mt-4 flex items-center justify-between text-sm">
        {mode === "unlock" && phase === "enter" && (preferBiometric || waitingOnDevice) ? (
          <button
            type="button"
            className="font-semibold text-sage-700 hover:underline"
            onClick={() => {
              setUsePinFallback(true);
              setError("");
            }}
          >
            Use PIN instead
          </button>
        ) : mode === "unlock" && phase === "enter" ? (
          <button
            type="button"
            className="font-semibold text-sage-700 hover:underline"
            onClick={() => {
              setPhase("reset-password");
              setError("");
              setPassword("");
              setFirstPin("");
            }}
          >
            Forgot PIN?
          </button>
        ) : (
          <span />
        )}
        <button type="button" className="font-semibold text-ink-muted hover:underline" onClick={logout}>
          Sign out
        </button>
      </div>
    </AuthLayout>
  );
}

export default PinLock;
