import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBiM9X5MvkPvq2R9rxmdgMNZwsxbMMYRfs",
  authDomain: "mayorix-71788.firebaseapp.com",
  projectId: "mayorix-71788",
  storageBucket: "mayorix-71788.appspot.com",
  messagingSenderId: "1052345678901",
  appId: "1:1052345678901:web:abcdef1234567890"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);