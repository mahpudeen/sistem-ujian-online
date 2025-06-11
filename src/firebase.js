// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBdCGR6ph7FXV8iq-e4SUvURo2kYdwbE34",
  authDomain: "sistem-ujian-online-a3ce7.firebaseapp.com",
  projectId: "sistem-ujian-online-a3ce7",
  storageBucket: "sistem-ujian-online-a3ce7.firebasestorage.app",
  messagingSenderId: "543555349783",
  appId: "1:543555349783:web:8939ae29073f298c80db52"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

const secondaryApp = initializeApp(firebaseConfig, "Secondary");
export const secondaryAuth = getAuth(secondaryApp);
