import { initializeApp, getApps } from '@react-native-firebase/app';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

// Initialize Firebase if it hasn't been initialized yet
if (getApps().length === 0) {
  initializeApp();
}

// Get Firebase instances
const db = firestore();
const firebaseAuth = auth();

export { db, firebaseAuth as auth };
