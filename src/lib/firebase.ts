
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDJC45bkju3DUARcefHKF7-9e-hUsLRets",
  authDomain: "takip-sistemi-jlej4.firebaseapp.com",
  projectId: "takip-sistemi-jlej4",
  storageBucket: "takip-sistemi-jlej4.firebasestorage.app",
  messagingSenderId: "250028828318",
  appId: "1:250028828318:web:965696395b5e9dbadb7d8f"
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

export { app, db };
