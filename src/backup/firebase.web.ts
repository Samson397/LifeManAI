import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAVS4qEGOBkg-n0iZCgZoSBQKbWOrSBKGU",
  authDomain: "lifemate-ai.firebaseapp.com",
  projectId: "lifemate-ai",
  storageBucket: "lifemate-ai.firebasestorage.app",
  messagingSenderId: "102552612909",
  appId: "1:102552612909:web:your-web-app-id",
  measurementId: "G-W2E6796M95"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const firestore = getFirestore(app);

export { app, analytics, auth, firestore };
