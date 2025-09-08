import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { getStoredAuth, fetchMe } from "./auth/authService";
import Login from "./auth/Login";
import Register from "./auth/Register";
import App from "./App";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Authentication() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const { user: storedUser } = getStoredAuth();
      if (storedUser) {
        try {
          const me = await fetchMe();
          setUser({ ...storedUser, ...me });
        } catch (_e) {
          setUser(storedUser); // fallback to stored user if /me fails
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };
    init();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="h-14 w-14 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-extrabold tracking-wide text-blue-700">Budgett</span>
            </div>
          </div>
          <div className="text-gray-800 font-semibold">Getting things ready...</div>
          <div className="h-1 w-40 bg-blue-100 rounded overflow-hidden">
            <div className="h-full w-1/2 bg-blue-500 animate-[loadingbar_1.6s_ease-in-out_infinite]"></div>
          </div>
          <style>{`@keyframes loadingbar { 0%{transform: translateX(-100%);} 50%{transform: translateX(0%);} 100%{transform: translateX(100%);} }`}</style>
        </div>
      </div>
    );
  }

  // console.log("user:", user);

  return (
    <>
      <Router basename="/">
        <div>
          <Routes>
            <Route
              path="/"
              element={user ? <Navigate to="/app" /> : <Navigate to="/login" />}
            />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/app" element={user ? <App /> : <Navigate to="/login" />} />
          </Routes>
          <ToastContainer />
        </div>
      </Router>
    </>
  );
}

export default Authentication;
