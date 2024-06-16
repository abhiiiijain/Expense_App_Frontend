import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth, db } from "./Firebase";
import { toast } from "react-toastify";
import { setDoc, doc } from "firebase/firestore";

function SignInwithGoogle() {
  function googleLogin() {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider).then(async (result) => {
      console.log(result);
      const user = result.user;
      if (result.user) {
        await setDoc(doc(db, "Users", user.uid), {
          email: user.email,
          firstName: user.displayName,
          photo: user.photoURL,
          lastName: "",
        });
        toast.success("User logged in Successfully", {
          position: "top-center",
        });
        window.location.href = "/app";
      }
    });
  }
  return (
    <div>
      <p className="text-center text-xs text-gray-400 font-semibold mt-4">
        --Or continue with--
      </p>
      <div
        className="flex justify-center cursor-pointer mt-2"
        onClick={googleLogin}>
        <img src={require("../google.png")} className="w-1/2" />
      </div>
    </div>
  );
}

export default SignInwithGoogle;
