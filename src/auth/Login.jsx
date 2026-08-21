import { useState } from "react";
import { login } from "./authService";
import { useAuth } from "./AuthContext";
import { toast } from "react-toastify";
import PasswordInput from "./PasswordInput";
import AuthLayout from "./AuthLayout";

function Login() {
  const { setUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const loggedInUser = await login(email, password);
      setUser(loggedInUser);
      toast.success("Signed in successfully", { position: "top-center" });
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
      title="Welcome back"
      subtitle="Sign in to continue to your dashboard"
      footerPrompt="New here?"
      footerLinkTo="/register"
      footerLinkLabel="Create an account"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="sw-label" htmlFor="login-email">
            Email address
          </label>
          <input
            id="login-email"
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
          id="login-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          autoComplete="current-password"
        />

        <button type="submit" disabled={loading} className="sw-btn-primary mt-2">
          {loading && (
            <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
          )}
          Sign in
        </button>
      </form>
    </AuthLayout>
  );
}

export default Login;
