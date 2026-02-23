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

// En desarrollo usamos una colección de prueba, en producción la real.
export const CONTRACTS_COLLECTION = import.meta.env.DEV ? 'test_contracts' : 'contracts';

// Lista de correos autorizados obtenida desde variables de entorno
const envEmails = import.meta.env.VITE_ALLOWED_EMAILS;
export const ALLOWED_EMAILS = envEmails ? envEmails.split(',').map(e => e.trim()) : [];
