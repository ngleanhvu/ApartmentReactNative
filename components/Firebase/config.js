// src/config/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCmPue833ouOySJQICnd__80_1BvoDdgsc",
  authDomain: "apartment-app-da74a.firebaseapp.com",
  projectId: "apartment-app-da74a",
  storageBucket: "apartment-app-da74a.appspot.com",
  messagingSenderId: "1055959216696",
  appId: "1:1055959216696:web:9bf4586476dc9af1c56ccd",
  measurementId: "G-0ER1X04Y2W",
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const database = getFirestore(app);

export { app, analytics, database };
