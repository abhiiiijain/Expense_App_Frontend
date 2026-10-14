import { useCallback, useState } from "react";
import { toast } from "react-toastify";
import { useAuth } from "./AuthContext";
import { beginPinSubmit, endPinSubmit, setAppSession } from "./appSession";
import { persistUser, resetPin, setupPin, verifyPin } from "./authService";
import AuthLayout from "./AuthLayout";
import PasswordInput from "./PasswordInput";
import PinPad from "./PinPad";
import LoadingSpinner from "../components/LoadingSpinner";

function errorMessage(error, fallback) {
  return error?.response?.data?.message || fallback;
}

function PinLock({ mode }) {
  const { user, setUser, logout } = useAuth();
  const [phase, setPhase] = useState(mode === "setup" ? "create" : "enter");
  const [firstPin, setFirstPin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [padKey, setPadKey] = useState(0);

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

  const handleUnlock = useCallback(
    async (pin) => {
      if (!beginPinSubmit()) return;
      try {
        setBusy(true);
        setError("");
        const token = await verifyPin(pin);
        setAppSession(token);
      } catch (err) {
        setError(errorMessage(err, "Incorrect PIN"));
        resetPad();
      } finally {
        setBusy(false);
        endPinSubmit();
      }
    },
    [resetPad]
  );

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

  const title =
    phase === "create"
      ? "Create a PIN"
      : phase === "confirm"
        ? "Confirm your PIN"
        : phase === "reset-password"
          ? "Reset PIN"
          : phase === "reset-pin"
            ? "Choose a new PIN"
            : phase === "reset-confirm"
              ? "Confirm new PIN"
              : "Enter your PIN";

  const subtitle =
    mode === "setup"
      ? "SpendWise asks for this PIN whenever you switch away or close the app."
      : phase.startsWith("reset")
        ? "Confirm with your account password, then choose a new 4-digit PIN."
        : `Welcome back${user?.firstName ? `, ${user.firstName}` : ""}. This screen locks when you leave the app.`;

  const onComplete = mode === "setup" ? handleSetup : phase.startsWith("reset") ? handleResetPin : handleUnlock;
  const showPad = phase !== "reset-password";

  return (
    <AuthLayout title={title} subtitle={subtitle}>
      {phase === "reset-password" ? (
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            setError("");
            setPhase("reset-pin");
            resetPad();
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

      {showPad ? (
        <PinPad
          key={padKey}
          onComplete={onComplete}
          onEdit={() => setError("")}
          disabled={busy}
          error={error}
        />
      ) : null}

      {busy ? (
        <div className="mt-4 flex justify-center text-sage-700">
          <LoadingSpinner />
        </div>
      ) : null}

      <div className="mt-6 flex items-center justify-between text-sm">
        {mode === "unlock" && phase === "enter" ? (
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
