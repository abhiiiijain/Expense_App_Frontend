import { useState } from "react";
import { Link } from "react-router-dom";
import { login } from "./authService";
import { useAuth } from "./AuthContext";
import { toast } from "react-toastify";
import PasswordInput from "../components/PasswordInput";
import { APP_NAME } from "../constants/app";

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
      toast.success("User logged in Successfully", {
        position: "top-center",
      });
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message, {
        position: "bottom-center",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen font-sans bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="bg-white/80 backdrop-blur-md shadow-xl rounded-2xl p-8 ring-1 ring-gray-100">
            <div className="mb-6 text-center">
              <p className="text-lg font-extrabold tracking-tight text-blue-700 mb-2">{APP_NAME}</p>
              <h3 className="text-2xl font-extrabold tracking-tight text-gray-900">Welcome back</h3>
              <p className="text-sm text-gray-500 mt-1">Sign in to continue to your dashboard</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2.94 6.34A2 2 0 014 6h12a2 2 0 011.06.34L10 10.882 2.94 6.34z" />
                      <path d="M18 8.118l-8 4.941-8-4.94V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </span>
                  <input
                    type="email"
                    className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    placeholder="abhinandanbansal123@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <PasswordInput
                id="login-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold rounded-lg shadow-sm transition">
                {loading && (
                  <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                  </svg>
                )}
                Sign in
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-4">
              New user?{" "}
              <Link to="/register" className="text-blue-600 font-semibold hover:underline">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;
