// Script to add location to Tsunami Warning alert
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get, update } from 'firebase/database';

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

console.log('📍 Adding location to Tsunami Warning alert...');

const alertsRef = ref(db, 'alerts/official');

get(alertsRef)
  .then((snapshot) => {
    if (snapshot.exists()) {
      const alerts = snapshot.val();
      
      Object.entries(alerts).forEach(([id, alert]) => {
        if (alert.title === 'Tsunami Warning - Coastal Areas') {
          // Add coastal location (example: Chennai coast)
          const updates = {
            location: {
              latitude: 13.0827,
              longitude: 80.2707
            }
          };
          
          console.log(`📍 Setting location for "${alert.title}"`);
          console.log(`   Coordinates: ${updates.location.latitude}, ${updates.location.longitude}`);
          
          return update(ref(db, `alerts/official/${id}`), updates);
        }
      });
    } else {
      console.log('ℹ️  No alerts found.');
    }
  })
  .then(() => {
    console.log('✅ Tsunami Warning alert updated with location!');
    console.log('🗺️  It will now appear on the hazard map.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
