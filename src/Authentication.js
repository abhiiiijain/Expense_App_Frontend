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
// import Profile from "./auth/Profile";

function Authentication() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  return (
    <>
      <Router basename="/">
        <div>
          <div>
            <div>
              {/* <div className="min-h-screen flex flex-col font-sans font-normal">
          <div className="flex justify-center flex-col text-left w-full h-full">
            <div className="w-112 mx-auto bg-white shadow-lg p-10 rounded-lg transition-all duration-300"> */}
              <Routes>
                <Route
                  path="/"
                  element={user ? <Navigate to="/app" /> : <Login />}
                />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                {/* <Route path="/profile" element={<Profile />} /> */}
                <Route path="/app" element={<App />} />
              </Routes>
              <ToastContainer />
            </div>
          </div>
        </div>
      </Router>
    </>
  );
}

export default Authentication;
