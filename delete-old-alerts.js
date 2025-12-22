// Script to delete all emergency alerts
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, remove } from 'firebase/database';

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

console.log('🗑️  Deleting old emergency alerts...');

const alertsRef = ref(db, 'alerts/official');

remove(alertsRef)
  .then(() => {
    console.log('✅ All old alerts deleted successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
