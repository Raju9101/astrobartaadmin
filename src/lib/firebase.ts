import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCx2suoTKaBvDdswiEgfoPPVAGK2E5s9GY",
  authDomain: "astroconnect-cta21.firebaseapp.com",
  projectId: "astroconnect-cta21",
  storageBucket: "astroconnect-cta21.appspot.com",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };
