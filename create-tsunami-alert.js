// Script to create Tsunami Warning alert with location
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, push } from 'firebase/database';

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

console.log('🚨 Creating Tsunami Warning alert...');

const alertsRef = ref(db, 'alerts/official');

const tsunamiAlert = {
  title: 'Tsunami Warning - Coastal Areas',
  message: 'Tsunami warning issued for coastal areas. Move to higher ground immediately.',
  severity: 'critical',
  location: {
    latitude: 13.0827,
    longitude: 80.2707
  },
  status: 'active',
  timestamp: Date.now(),
  type: 'tsunami'
};

push(alertsRef, tsunamiAlert)
  .then((newRef) => {
    console.log('✅ Tsunami Warning alert created!');
    console.log('🆔 Alert ID:', newRef.key);
    console.log('📍 Location: Chennai Coast (13.0827, 80.2707)');
    console.log('🗺️  Alert will now appear on the hazard map.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
