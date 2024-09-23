import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';  // Import getStorage and connectStorageEmulator

const dbConfig = {
    apiKey: import.meta.env.VITE_API_KEY,
    authDomain: import.meta.env.VITE_AUTH_DOMAIN,
    databaseURL: import.meta.env.VITE_URL,
    projectId: import.meta.env.VITE_ID,
    storageBucket: import.meta.env.VITE_BUCKET,
    messagingSenderId: import.meta.env.VITE_MESSAGING,
    appId: import.meta.env.VITE_APP_ID,
    measurementId: import.meta.env.VITE_MEASUREMENT_ID
};

// Initialize Firebase apps if they haven't been initialized yet
export const firebaseApp = initializeApp(dbConfig);

const firestoreDataBase = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp);  // Initialize Firebase Storage

//If running locally connect emulators
if(import.meta.env.MODE === 'loc'){
    console.log('Environment = ', import.meta.env.MODE)
// Connect Firestore to the emulator
connectFirestoreEmulator(firestoreDataBase, "localhost", 8080);

// Connect Storage to the emulator
connectStorageEmulator(storage, "localhost", 9199);  // Connect to Storage emulator
}


export { firestoreDataBase, storage, dbConfig };
