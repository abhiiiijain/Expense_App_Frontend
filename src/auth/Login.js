import { signInWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import { auth } from "./Firebase";
import { toast } from "react-toastify";
// import SignInWithGoogle from "./SignInWithGoogle";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log("User logged in Successfully");
      window.location.href = "/app";
      toast.success("User logged in Successfully", {
        position: "top-center",
      });
    } catch (error) {
      console.log(error.message);

      toast.error(error.message, {
        position: "bottom-center",
      });
    }
  };

  return (
    <>
      <div className="flex flex-col font-sans font-normal">
        <div className="mx-auto bg-white shadow-lg p-10 rounded-lg transition-all duration-300">
          <form onSubmit={handleSubmit}>
            <h3 className="font-bold">Login</h3>

            <div className="mb-3">
              <label>Email address</label>
              <input
                type="email"
                className="w-full px-4 py-2 border rounded focus:outline-none focus:border-blue-500"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label>Password</label>
              <input
                type="password"
                className="w-full px-4 py-2 border rounded focus:outline-none focus:border-blue-500"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="grid">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white font-semibold rounded">
                Submit
              </button>
            </div>
            <p className="text-right text-sm text-gray-500 mt-2">
              New user{" "}
              <a href="/register" className="text-blue-500 font-bold">
                Register Here
              </a>
            </p>
            {/* <SignInWithGoogle /> */}
          </form>
        </div>
      </div>
    </>
  );
}

export default Login;
