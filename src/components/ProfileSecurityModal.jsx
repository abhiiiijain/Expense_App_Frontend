import { useEffect, useState } from "react";
import ModalShell from "./ModalShell";
import {
  changeEmail,
  changePassword,
  changePin,
  persistUser,
  beginWebAuthnRegistration,
  finishWebAuthnRegistration,
  removeWebAuthnCredentials,
} from "../auth/authService";
import {
  createDeviceCredential,
  biometricErrorMessage,
  deviceUnlockAvailable,
} from "../auth/biometric";
import { useAuth } from "../auth/AuthContext";
import PasswordInput from "../auth/PasswordInput";
import { toast } from "react-toastify";
import { PIN_LENGTH, PIN_PATTERN } from "../constants/app";

function digitsOnly(value) {
  return value.replace(/\D/g, "").slice(0, PIN_LENGTH);
}

function isPin(value) {
  return PIN_PATTERN.test(value);
}

function PinField({ id, label, value, onChange }) {
  return (
    <div>
      <label className="sw-label" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        type="password"
        className="sw-input text-center tracking-[0.4em]"
        inputMode="numeric"
        autoComplete="off"
        maxLength={PIN_LENGTH}
        value={value}
        onChange={(event) => onChange(digitsOnly(event.target.value))}
        required
      />
    </div>
  );
}

function ProfileSecurityModal({ open, onClose }) {
  const { user, setUser } = useAuth();
  const [tab, setTab] = useState("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [currentPin, setCurrentPin] = useState("");
  const [nextPin, setNextPin] = useState("");
  const [saving, setSaving] = useState(false);
  const [deviceBusy, setDeviceBusy] = useState(false);
  const [deviceReady, setDeviceReady] = useState(false);

  useEffect(() => {
    if (open) {
      setTab("email");
      setEmail(user?.email || "");
      setPassword("");
      setCurrentPassword("");
      setNewPassword("");
      setCurrentPin("");
      setNextPin("");
    }
  }, [open, user?.email]);

  useEffect(() => {
    if (!open || tab !== "pin") return undefined;
    let cancelled = false;
    deviceUnlockAvailable().then((available) => {
      if (!cancelled) setDeviceReady(available);
    });
    return () => {
      cancelled = true;
    };
  }, [open, tab]);

  const saveEmail = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const updated = await changeEmail(email, password);
      setUser(updated);
      toast.success("Email updated", { position: "top-center" });
      onClose?.();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Could not update email");
    } finally {
      setSaving(false);
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await changePassword(currentPassword, newPassword);
      toast.success("Password updated", { position: "top-center" });
      onClose?.();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Could not update password");
    } finally {
      setSaving(false);
    }
  };

  const rememberBiometric = (enabled) => {
    setUser((current) => {
      const next = current ? { ...current, biometricEnabled: enabled } : current;
      if (next) persistUser(next);
      return next;
    });
  };

  const enableBiometric = async () => {
    try {
      setDeviceBusy(true);
      const options = await beginWebAuthnRegistration();
      const credential = await createDeviceCredential(options);
      await finishWebAuthnRegistration(credential);
      rememberBiometric(true);
      toast.success("Fingerprint or Face ID enabled", { position: "top-center" });
    } catch (error) {
      const message = biometricErrorMessage(error, "Could not enable fingerprint or Face ID");
      if (message) toast.error(message);
    } finally {
      setDeviceBusy(false);
    }
  };

  const disableBiometric = async () => {
    try {
      setDeviceBusy(true);
      await removeWebAuthnCredentials();
      rememberBiometric(false);
      toast.success("Device unlock removed", { position: "top-center" });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Could not remove device unlock");
    } finally {
      setDeviceBusy(false);
    }
  };

  const savePin = async (e) => {
    e.preventDefault();
    if (!isPin(currentPin) || !isPin(nextPin)) {
      toast.error(`PIN must be ${PIN_LENGTH} digits`);
      return;
    }
    try {
      setSaving(true);
      await changePin(currentPin, nextPin);
      toast.success("PIN updated", { position: "top-center" });
      onClose?.();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Could not update PIN");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalShell open={open} onClose={onClose} labelledBy="security-title" maxWidth="md">
      <div
        className="px-6 py-5"
        style={{
          borderBottom: "1px solid var(--sw-border)",
          background: "var(--sw-muted-bg)",
        }}
      >
        <h2 id="security-title" className="font-display text-lg font-semibold text-ink">
          Account security
        </h2>
      </div>
      <div className="p-6 space-y-4">
        <div className="sw-segment" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
          <button
            type="button"
            className={`rounded-lg py-2 text-sm font-semibold ${
              tab === "email" ? "sw-segment-btn is-active" : "sw-segment-btn"
            }`}
            onClick={() => setTab("email")}
          >
            Email
          </button>
          <button
            type="button"
            className={`rounded-lg py-2 text-sm font-semibold ${
              tab === "password" ? "sw-segment-btn is-active" : "sw-segment-btn"
            }`}
            onClick={() => setTab("password")}
          >
            Password
          </button>
          <button
            type="button"
            className={`rounded-lg py-2 text-sm font-semibold ${
              tab === "pin" ? "sw-segment-btn is-active" : "sw-segment-btn"
            }`}
            onClick={() => setTab("pin")}
          >
            PIN
          </button>
        </div>

        {tab === "pin" ? (
          <div className="space-y-3">
            <form onSubmit={savePin} className="space-y-3">
              <PinField id="current-pin" label="Current PIN" value={currentPin} onChange={setCurrentPin} />
              <PinField id="next-pin" label="New PIN" value={nextPin} onChange={setNextPin} />
              <button type="submit" disabled={saving} className="sw-btn-primary">
                {saving ? "Saving…" : "Update PIN"}
              </button>
            </form>
            {deviceReady ? (
              <div className="pt-3" style={{ borderTop: "1px solid var(--sw-border)" }}>
                <p className="sw-label">Device unlock</p>
                <p className="mb-3 text-sm text-ink-muted">
                  Use this phone or computer’s fingerprint or Face ID instead of the PIN.
                </p>
                {user?.biometricEnabled ? (
                  <button type="button" disabled={deviceBusy} className="sw-btn-primary" onClick={disableBiometric}>
                    {deviceBusy ? "Turning off…" : "Turn off fingerprint or Face ID"}
                  </button>
                ) : (
                  <button type="button" disabled={deviceBusy} className="sw-btn-primary" onClick={enableBiometric}>
                    {deviceBusy ? "Waiting…" : "Enable fingerprint or Face ID"}
                  </button>
                )}
              </div>
            ) : null}
          </div>
        ) : tab === "email" ? (
          <form onSubmit={saveEmail} className="space-y-3">
            <div>
              <label className="sw-label">New email</label>
              <input
                type="email"
                className="sw-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <PasswordInput
              id="confirm-email-password"
              label="Confirm with password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit" disabled={saving} className="sw-btn-primary">
              {saving ? "Saving…" : "Update email"}
            </button>
          </form>
        ) : (
          <form onSubmit={savePassword} className="space-y-3">
            <PasswordInput
              id="current-password"
              label="Current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
            <PasswordInput
              id="new-password"
              label="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              hint="At least 6 characters"
              required
            />
            <button type="submit" disabled={saving} className="sw-btn-primary">
              {saving ? "Saving…" : "Update password"}
            </button>
          </form>
        )}
      </div>
    </ModalShell>
  );
}

export default ProfileSecurityModal;
