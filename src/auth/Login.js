import React, { useState } from "react";
import { login } from "./authService";
import { toast } from "react-toastify";
// import SignInWithGoogle from "./SignInWithGoogle";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await login(email, password);
      console.log("User logged in Successfully");
      window.location.href = "/app";
      toast.success("User logged in Successfully", {
        position: "top-center",
      });
    } catch (error) {
      console.log(error?.response?.data?.message || error.message);

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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                      <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v2.25H6A2.25 2.25 0 003.75 11.25v7.5A2.25 2.25 0 006 21h12a2.25 2.25 0 002.25-2.25v-7.5A2.25 2.25 0 0018 9h-.75V6.75A5.25 5.25 0 0012 1.5zm-3.75 5.25A3.75 3.75 0 0112 3a3.75 3.75 0 013.75 3.75V9h-7.5V6.75z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 5c-7 0-10 7-10 7s3 7 10 7 10-7 10-7-3-7-10-7zm0 12a5 5 0 110-10 5 5 0 010 10z" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M3.98 8.223A10.477 10.477 0 002 12s3 7 10 7a10.45 10.45 0 005.67-1.67l1.65 1.65a1 1 0 001.41-1.41l-16-16a1 1 0 10-1.41 1.41l1.66 1.66zM12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.27-.36 1.84l-6.48-6.48c.57-.23 1.19-.36 1.84-.36z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

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
              <a href="/register" className="text-blue-600 font-semibold hover:underline">
                Create an account
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;
