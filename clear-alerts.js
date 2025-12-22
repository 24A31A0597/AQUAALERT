// Script to delete all emergency alerts except Tsunami Warning
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get, remove } from 'firebase/database';

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

console.log('🗑️  Deleting emergency alerts (keeping Tsunami Warning)...');

const alertsRef = ref(db, 'alerts/official');

get(alertsRef)
  .then((snapshot) => {
    if (snapshot.exists()) {
      const alerts = snapshot.val();
      const deletePromises = [];
      
      Object.entries(alerts).forEach(([id, alert]) => {
        // Keep only Tsunami Warning - Coastal Areas
        if (alert.title !== 'Tsunami Warning - Coastal Areas') {
          console.log(`🗑️  Deleting: ${alert.title}`);
          deletePromises.push(remove(ref(db, `alerts/official/${id}`)));
        } else {
          console.log(`✅ Keeping: ${alert.title}`);
        }
      });
      
      return Promise.all(deletePromises);
    } else {
      console.log('ℹ️  No alerts found in database.');
      return Promise.resolve();
    }
  })
  .then(() => {
    console.log('✅ Cleanup complete! Only Tsunami Warning remains.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
