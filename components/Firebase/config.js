// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import firebase from "firebase/compat/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCmPue833ouOySJQICnd__80_1BvoDdgsc",
  authDomain: "apartment-app-da74a.firebaseapp.com",
  projectId: "apartment-app-da74a",
  storageBucket: "apartment-app-da74a.firebasestorage.app",
  messagingSenderId: "1055959216696",
  appId: "1:1055959216696:web:9bf4586476dc9af1c56ccd",
  measurementId: "G-0ER1X04Y2W",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export const database = getFirestore();
