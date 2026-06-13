import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "./authService";
import { useAuth } from "./AuthContext";
import { toast } from "react-toastify";
import PasswordInput from "../components/PasswordInput";

function Register() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const user = await registerUser({ firstName: fname, lastName: lname, email, password });
      setUser(user);
      navigate("/app", { replace: true });
      toast.success("User Registered Successfully!!", {
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
      <div className="min-h-screen font-sans bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="bg-white/80 backdrop-blur-md shadow-xl rounded-2xl p-8 ring-1 ring-gray-100">
            <div className="mb-6 text-center">
              <h3 className="text-2xl font-extrabold tracking-tight text-gray-900">Create your account</h3>
              <p className="text-sm text-gray-500 mt-1">Start tracking your expenses in minutes</p>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  placeholder="Abhinandan"
                  onChange={(e) => setFname(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  placeholder="Jain"
                  onChange={(e) => setLname(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  placeholder="abhinandanbansal123@gmail.com"
                  onChange={(e) => setEmail(e.target.value)}
                  required
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

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold rounded-lg shadow-sm transition"
              >
                {loading && (
                  <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                  </svg>
                )}
                Create account
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-4">
              Already registered?{" "}
              <a href="/login" className="text-blue-600 font-semibold hover:underline">
                Sign in
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
export default Register;
