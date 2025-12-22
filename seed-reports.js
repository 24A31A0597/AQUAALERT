// Script to seed sample hazard reports into Firebase for map testing
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, push } from 'firebase/database';

// Firebase config (same as firebase.js / clear-reports.js)
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

const now = Date.now();

const samples = [
  {
    hazardType: 'contamination',
    title: 'Water Contamination Report',
    description: 'Unusual odor detected in local water supply.',
    severity: 'low',
    location: { lat: 12.9716, lng: 77.5946 }, // Bengaluru
    submittedBy: 'anonymous',
    reporterName: 'Anonymous',
    verified: false,
    timestamp: now - 1000 * 60 * 60
  },
  {
    hazardType: 'flooding',
    title: 'Minor Flooding Near Lake',
    description: 'Water level slightly above normal.',
    severity: 'medium',
    location: { lat: 12.9722, lng: 77.5950 },
    submittedBy: 'anonymous',
    reporterName: 'Anonymous',
    verified: false,
    timestamp: now - 1000 * 60 * 45
  },
  {
    hazardType: 'chemical',
    title: 'Chemical Spill Warning',
    description: 'Possible small chemical leakage observed.',
    severity: 'high',
    location: { lat: 12.9730, lng: 77.5960 },
    submittedBy: 'anonymous',
    reporterName: 'Anonymous',
    verified: false,
    timestamp: now - 1000 * 60 * 30
  },
  {
    hazardType: 'temperature',
    title: 'Temperature Anomaly Detected',
    description: 'Unusual water temperature spike.',
    severity: 'critical',
    location: { lat: 12.9740, lng: 77.5970 },
    submittedBy: 'anonymous',
    reporterName: 'Anonymous',
    verified: false,
    timestamp: now - 1000 * 60 * 10
  },
  {
    hazardType: 'contamination',
    title: 'Harbor Water Test',
    description: 'Elevated turbidity levels reported.',
    severity: 'low',
    location: { lat: 19.0760, lng: 72.8777 }, // Mumbai
    submittedBy: 'Admin',
    reporterName: 'Admin',
    verified: true,
    timestamp: now - 1000 * 60 * 80
  },
  {
    hazardType: 'flooding',
    title: 'River Overflow Alert',
    description: 'Localized overflow in riverside area.',
    severity: 'medium',
    location: { lat: 19.0770, lng: 72.8790 },
    submittedBy: 'Admin',
    reporterName: 'Admin',
    verified: true,
    timestamp: now - 1000 * 60 * 50
  }
];

async function run() {
  console.log('🌱 Seeding sample hazard reports...');
  const reportsRef = ref(db, 'hazards/reports');
  for (const payload of samples) {
    const newRef = await push(reportsRef, payload);
    console.log('✅ Seeded hazard with ID:', newRef.key, payload.title);
  }
  console.log('🎉 Seeding complete. Open the map to verify clusters.');
  process.exit(0);
}

run().catch(err => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
