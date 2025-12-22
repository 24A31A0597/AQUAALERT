// Script to clear all hazard reports from Firebase
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, remove } from 'firebase/database';

// Firebase config (from your firebase.js)
const firebaseConfig = {
  apiKey: "AIzaSyDWwe7Icd1ztPCE1zfn-zLUuIMjUr770f4",
  authDomain: "aquaalert-ae2f7.firebaseapp.com",
  databaseURL: "https://aquaalert-ae2f7-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "aquaalert-ae2f7",
  storageBucket: "aquaalert-ae2f7.firebasestorage.app",
  messagingSenderId: "831711052554",
  appId: "1:831711052554:web:5b6dc605f56ab6c9f1b0f3"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

console.log('🗑️  Deleting all hazard reports from Firebase...');

// Delete all reports
const reportsRef = ref(db, 'hazards/reports');
remove(reportsRef)
  .then(() => {
    console.log('✅ All hazard reports deleted successfully!');
    console.log('📝 You can now submit fresh reports.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error deleting reports:', error);
    process.exit(1);
  });
