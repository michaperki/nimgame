// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCU4XNVcIuTNjhy5itiUcEySAHI6VrzJOk",
  authDomain: "nimgame-7475b.firebaseapp.com",
  projectId: "nimgame-7475b",
  storageBucket: "nimgame-7475b.appspot.com",
  messagingSenderId: "190588427059",
  appId: "1:190588427059:web:80949488bf1c8a6581fc46",
  measurementId: "G-PQ6LRQNMHJ",
  databaseURL: "https://nimgame-7475b-default-rtdb.firebaseio.com/"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const database = getDatabase(app);
const auth = getAuth(app);

export { app, analytics, database, auth };