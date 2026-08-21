import { useState } from "react";
import { registerUser } from "./authService";
import { useAuth } from "./AuthContext";
import { toast } from "react-toastify";
import PasswordInput from "./PasswordInput";
import AuthLayout from "./AuthLayout";
import { APP_NAME } from "../constants/app";
import { sanitizeAmountInput } from "../utils/sanitizeAmount";

function Register() {
  const { setUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [openingBalance, setOpeningBalance] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const user = await registerUser({
        firstName: fname,
        lastName: lname,
        email,
        password,
        openingBalance: openingBalance === "" ? undefined : Number(openingBalance),
      });
      setUser(user);
      toast.success("Account created successfully", { position: "top-center" });
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message, {
        position: "bottom-center",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle={`Start tracking your money with ${APP_NAME}`}
      footerPrompt="Already registered?"
      footerLinkTo="/login"
      footerLinkLabel="Sign in"
    >
      <form onSubmit={handleRegister} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="sw-label" htmlFor="register-fname">
              First name
            </label>
            <input
              id="register-fname"
              type="text"
              className="sw-input"
              placeholder="Abhinandan"
              value={fname}
              onChange={(e) => setFname(e.target.value)}
              required
              autoComplete="given-name"
            />
          </div>
          <div>
            <label className="sw-label" htmlFor="register-lname">
              Last name
            </label>
            <input
              id="register-lname"
              type="text"
              className="sw-input"
              placeholder="Jain"
              value={lname}
              onChange={(e) => setLname(e.target.value)}
              autoComplete="family-name"
            />
          </div>
        </div>

        <div>
          <label className="sw-label" htmlFor="register-email">
            Email address
          </label>
          <input
            id="register-email"
            type="email"
            className="sw-input"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        <PasswordInput
          id="register-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Create a password"
          hint="At least 6 characters"
          autoComplete="new-password"
        />

        <div>
          <label className="sw-label" htmlFor="register-opening">
            Opening bank balance (₹)
          </label>
          <input
            id="register-opening"
            type="text"
            inputMode="decimal"
            className="sw-input"
            placeholder="What is in your account today?"
            value={openingBalance}
            onChange={(e) => setOpeningBalance(sanitizeAmountInput(e.target.value))}
          />
          <p className="mt-1.5 text-xs text-ink-muted">
            Optional — use your current balance so {APP_NAME} matches your passbook.
          </p>
        </div>

        <button type="submit" disabled={loading} className="sw-btn-primary mt-2">
          {loading && (
            <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
          )}
          Create account
        </button>
      </form>
    </AuthLayout>
  );
}

export default Register;
