import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCFajJ6siiIIOdXb3mH_MaRNbQ8xzYTacU",
  authDomain: "calculadora-alquileres.firebaseapp.com",
  projectId: "calculadora-alquileres",
  storageBucket: "calculadora-alquileres.firebasestorage.app",
  messagingSenderId: "758455795282",
  appId: "1:758455795282:web:ca38b9c8ad1ad90b31a98b"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
