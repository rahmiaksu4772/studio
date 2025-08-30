// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCJ3G_aB6dj3gvxgjg3sygeMnMNnEcXywE",
  authDomain: "takip-k0hdb.firebaseapp.com",
  projectId: "takip-k0hdb",
  storageBucket: "takip-k0hdb.firebasestorage.app",
  messagingSenderId: "1093335320755",
  appId: "1:1093335320755:web:b029a206cb0fe66f7408c6"
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

export { app, db };
