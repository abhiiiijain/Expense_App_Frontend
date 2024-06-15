// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
        apiKey: "AIzaSyBr9cKhGWaZbRK-efPy3WtTtulBoRQJIZU",
        authDomain: "expenseapp-bee1a.firebaseapp.com",
        projectId: "expenseapp-bee1a",
        storageBucket: "expenseapp-bee1a.appspot.com",
        messagingSenderId: "523116088117",
        appId: "1:523116088117:web:9b77128306725dd9021a7c",
      };
      

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
