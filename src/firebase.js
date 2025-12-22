import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

// 🔴 Your Firebase config goes here
const firebaseConfig = {
  apiKey: "AIzaSyDWwe7Icd1ztPCE1zfn-zLUuIMjUr770f4",
  authDomain: "aquaalert-ae2f7.firebaseapp.com",
  databaseURL: "https://aquaalert-ae2f7-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "aquaalert-ae2f7",
  storageBucket: "aquaalert-ae2f7.firebasestorage.app",
  messagingSenderId: "831711052554",
  appId: "1:831711052554:web:5b6dc605f56ab6c9f1b0f3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export what we will use later
export const auth = getAuth(app);
export const db = getDatabase(app);
export const storage = getStorage(app);
