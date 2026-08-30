import { useEffect, useState } from "react";
import ModalShell from "./ModalShell";
import { changeEmail, changePassword } from "../auth/authService";
import { useAuth } from "../auth/AuthContext";
import PasswordInput from "../auth/PasswordInput";
import { toast } from "react-toastify";

function ProfileSecurityModal({ open, onClose }) {
  const { user, setUser } = useAuth();
  const [tab, setTab] = useState("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) {
      setTab("email");
      setEmail(user?.email || "");
      setPassword("");
      setCurrentPassword("");
      setNewPassword("");
    }
  }, [open, user?.email]);

  const saveEmail = async (e) => {
    e.preventDefault();
    try {
      setBusy(true);
      const updated = await changeEmail(email, password);
      setUser(updated);
      toast.success("Email updated", { position: "top-center" });
      onClose?.();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Could not update email");
    } finally {
      setBusy(false);
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    try {
      setBusy(true);
      await changePassword(currentPassword, newPassword);
      toast.success("Password updated", { position: "top-center" });
      onClose?.();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Could not update password");
    } finally {
      setBusy(false);
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
        <div className="sw-segment">
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
        </div>

        {tab === "email" ? (
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
            <button type="submit" disabled={busy} className="sw-btn-primary">
              {busy ? "Saving…" : "Update email"}
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
            <button type="submit" disabled={busy} className="sw-btn-primary">
              {busy ? "Saving…" : "Update password"}
            </button>
          </form>
        )}
      </div>
    </ModalShell>
  );
}

export default ProfileSecurityModal;
