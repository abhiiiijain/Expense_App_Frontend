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
import { AppConfigProvider } from "../config/AppConfigContext";
import { setOnUnauthorized } from "../api/client";
import Login from "../auth/Login";
import Register from "../auth/Register";
import Dashboard from "./Dashboard";
import BrandLogo from "../components/BrandLogo";

function LoadingScreen() {
  return (
    <div className="sw-page flex items-center justify-center">
      <div className="relative z-10 flex flex-col items-center gap-5 animate-fade-in">
        <div className="relative">
          <BrandLogo variant="mark" className="rounded-2xl shadow-panel" />
          <div className="absolute -inset-2 rounded-[1.25rem] border-2 border-sage-200 border-t-sage-600 animate-spin" />
        </div>
        <p className="text-sm text-ink-muted">Getting things ready…</p>
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
      <AppConfigProvider>
        <Router>
          <AuthRoutes />
          <ToastContainer theme="light" />
        </Router>
      </AppConfigProvider>
    </AuthProvider>
  );
}

export default Authentication;
