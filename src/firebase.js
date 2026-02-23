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

// Parseamos la lista, haciendo trim y filtrando entradas vacías
const envEmails = import.meta.env.VITE_ALLOWED_EMAILS;
const parsedAllowedEmails = envEmails
  ? envEmails
      .split(",")
      .map((e) => e.trim())
      .filter((e) => e.length > 0)
  : [];

// En producción, si no hay correos configurados, fallamos rápido para evitar
// dejar la app inutilizable con una lista vacía que bloquea todos los accesos.
if (import.meta.env.PROD && parsedAllowedEmails.length === 0) {
  // eslint-disable-next-line no-console
  console.error(
    "Configuración inválida: VITE_ALLOWED_EMAILS debe estar definida y contener al menos un correo en producción."
  );
  throw new Error(
    "VITE_ALLOWED_EMAILS no está configurada correctamente para el entorno de producción."
  );
}

export const ALLOWED_EMAILS = parsedAllowedEmails;
