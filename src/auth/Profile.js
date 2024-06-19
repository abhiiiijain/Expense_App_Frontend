import React, { useEffect, useState } from "react";
import { auth, db } from "./Firebase";
import { doc, getDoc } from "firebase/firestore";

function Profile() {
  const [userDetails, setUserDetails] = useState(null);
  const fetchUserData = async () => {
    auth.onAuthStateChanged(async (user) => {
      console.log(user);

      const docRef = doc(db, "Users", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setUserDetails(docSnap.data());
        console.log(docSnap.data());
      } else {
        console.log("User is not logged in");
      }
    });
  };
  useEffect(() => {
    fetchUserData();
  }, []);

  async function handleLogout() {
    try {
      await auth.signOut();
      window.location.href = "/login";
      console.log("User logged out successfully!");
    } catch (error) {
      console.error("Error logging out:", error.message);
    }
  }
  return (
    <>
      <div>
        {userDetails ? (
          <>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <img
                src={userDetails.photo}
                width={"40%"}
                alt="User"
                style={{ borderRadius: "50%" }}
              />
            </div>
            <h3>Welcome {userDetails.firstName}</h3>
            <div>
              <p>Email: {userDetails.email}</p>
              <p>First Name: {userDetails.firstName}</p>
              <p>Last Name: {userDetails.lastName}</p>
            </div>
            <button
              className="px-4 py-2 bg-blue-500 text-white font-semibold rounded"
              onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <p>You are not logged In</p>
        )}
      </div>
    </>
  );
}
export default Profile;
