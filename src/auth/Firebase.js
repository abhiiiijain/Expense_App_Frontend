// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {getFirestore} from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBr9cKhGWaZbRK-efPy3WtTtulBoRQJIZU",
  authDomain: "expenseapp-bee1a.firebaseapp.com",
  projectId: "expenseapp-bee1a",
  storageBucket: "expenseapp-bee1a.appspot.com",
  messagingSenderId: "523116088117",
  appId: "1:523116088117:web:9b77128306725dd9021a7c",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth();
export const db=getFirestore(app);
export default app;
