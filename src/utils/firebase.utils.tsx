import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const dbConfigs = {
  production: {
    apiKey: import.meta.env.VITE_PRODUCTION_API_KEY,
    authDomain: import.meta.env.VITE_PRODUCTION_AUTH_DOMAIN,
    databaseURL: import.meta.env.VITE_PRODUCTION_URL,
    projectId: import.meta.env.VITE_PRODUCTION_ID,
    storageBucket: import.meta.env.VITE_PRODUCTION_BUCKET,
    messagingSenderId: import.meta.env.VITE_PRODUCTION_MESSAGING,
    appId: import.meta.env.VITE_PRODUCTION_APP_ID,
    measurementId: import.meta.env.VITE_PRODUCTION_MEASUREMENT_ID
  },
  development: {
    apiKey: import.meta.env.VITE_DEVELOPMENT_API_KEY,
    authDomain: import.meta.env.VITE_DEVELOPMENT_AUTH_DOMAIN,
    databaseURL: import.meta.env.VITE_DEVELOPMENT_URL,
    projectId: import.meta.env.VITE_DEVELOPMENT_ID,
    storageBucket: import.meta.env.VITE_DEVELOPMENT_BUCKET,
    messagingSenderId: import.meta.env.VITE_DEVELOPMENT_MESSAGING,
    appId: import.meta.env.VITE_DEVELOPMENT_APP_ID,
    measurementId: import.meta.env.VITE_DEVELOPMENT_MEASUREMENT_ID
  }
}

//SWITCH ENVIRONMENT HERE
const dbConfig = dbConfigs.development

// Initialize Firebase apps if they haven't been initialized yet
initializeApp(dbConfigs.development, `[DEVELOPMENT]`);
initializeApp(dbConfigs.production, `[PRODUCTION]`);

const firestoreDataBase = [
  getFirestore(getApp(`[DEVELOPMENT]`)),
  getFirestore(getApp(`[PRODUCTION]`))
];

export { firestoreDataBase, dbConfig };
