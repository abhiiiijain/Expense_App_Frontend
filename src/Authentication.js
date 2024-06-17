import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { auth } from "./auth/Firebase";
import Login from "./auth/Login";
import Register from "./auth/Register";
import App from "./App";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Authentication() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Add a loading state

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false); // Set loading to false once auth state is resolved
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading...</div>; // Show a loading state while checking auth status
  }

  console.log("user:", user);

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
