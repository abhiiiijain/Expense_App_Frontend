import { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import { setOnUnauthorized } from "./auth/authService";
import Login from "./auth/Login";
import Register from "./auth/Register";
import App from "./App";
import { APP_NAME } from "./constants/app";

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="h-14 w-14 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-extrabold tracking-wide text-blue-700">{APP_NAME}</span>
          </div>
        </div>
        <div className="text-gray-800 font-semibold">Getting things ready...</div>
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
      <Route path="/app" element={user ? <App /> : <Navigate to="/login" replace />} />
    </Routes>
  );
}

function Authentication() {
  return (
    <AuthProvider>
      <Router basename="/">
        <AuthRoutes />
        <ToastContainer />
      </Router>
    </AuthProvider>
  );
}

export default Authentication;
