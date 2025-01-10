import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAVS4qEGOBkg-n0iZCgZoSBQKbWOrSBKGU",
  authDomain: "lifemate-ai.firebaseapp.com",
  projectId: "lifemate-ai",
  storageBucket: "lifemate-ai.firebasestorage.app",  // Updated bucket name
  messagingSenderId: "102552612909",
  appId: "1:102552612909:android:051ed492d94d459dc348a4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
