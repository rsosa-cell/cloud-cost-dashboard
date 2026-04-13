// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyClojk8jbFLq0ZDRYG4KPHgCb70xGFSRQc",
  authDomain: "cloud-cost-tracker-4ca2a.firebaseapp.com",
  projectId: "cloud-cost-tracker-4ca2a",
  storageBucket: "cloud-cost-tracker-4ca2a.firebasestorage.app",
  messagingSenderId: "83328333831",
  appId: "1:83328333831:web:a5f1355acc8889765b92a2",
  measurementId: "G-1WHDSRT5ZN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);