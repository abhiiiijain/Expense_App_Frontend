import { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider, useAuth } from "../auth/AuthContext";
import { setOnUnauthorized } from "../api/client";
import Login from "../auth/Login";
import Register from "../auth/Register";
import Dashboard from "./Dashboard";
import { APP_NAME } from "../constants/app";

function LoadingScreen() {
  return (
    <div className="sw-page flex items-center justify-center">
      <div className="relative z-10 flex flex-col items-center gap-5 animate-fade-in">
        <div className="relative h-16 w-16">
          <div className="absolute inset-0 rounded-full border-[3px] border-sage-200 border-t-sage-600 animate-spin" />
        </div>
        <div className="text-center">
          <p className="font-display text-2xl font-bold text-sage-600">{APP_NAME}</p>
          <p className="text-sm text-ink-muted mt-1">Getting things ready…</p>
        </div>
      </div>
    </div>
  );
}

function AuthRoutes() {
  const { user, loading, logout } = useAuth();

  useEffect(() => {
    setOnUnauthorized(logout);
  }, [logout]);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Routes>
      <Route
        path="/"
        element={user ? <Navigate to="/app" replace /> : <Navigate to="/login" replace />}
      />
      <Route path="/login" element={user ? <Navigate to="/app" replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/app" replace /> : <Register />} />
      <Route path="/app" element={user ? <Dashboard /> : <Navigate to="/login" replace />} />
    </Routes>
  );
}

function Authentication() {
  return (
    <AuthProvider>
      <Router>
        <AuthRoutes />
        <ToastContainer theme="light" />
      </Router>
    </AuthProvider>
  );
}

export default Authentication;
