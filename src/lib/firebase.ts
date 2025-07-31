
// Import the functions you need from the SDKs you need
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getFirestore }from 'firebase/firestore';
import { getAuth } from "firebase/auth";


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "takip-sistemi-jlej4",
  "appId": "1:250028828318:web:965696395b5e9dbadb7d8f",
  "storageBucket": "takip-sistemi-jlej4.firebasestorage.app",
  "apiKey": "AIzaSyDJC45bkju3DUARcefHKF7-9e-hUsLRets",
  "authDomain": "takip-sistemi-jlej4.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "250028828318"
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);


export { app, db, auth };
