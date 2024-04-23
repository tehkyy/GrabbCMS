import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const dbConfigs = {
  production: {
<<<<<<< HEAD
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
=======
        apiKey: "AIzaSyB7WREdD0qbva7z_IczthA_mFwlYyFfzCE",
    authDomain: "grabbit-370315.firebaseapp.com",
    databaseURL: "https://grabbit-370315-default-rtdb.firebaseio.com",
    projectId: "grabbit-370315",
    storageBucket: "grabbit-370315.appspot.com",
    messagingSenderId: "752720519034",
    appId: "1:752720519034:web:a75de670a0f1fa4945c0c3",
    measurementId: "G-4NE9Q3C3BQ"
  },
  development: {
    apiKey: "AIzaSyDC6b8-KRk-OvnsL9Uk-xVIrrUkFNlz6cA",
    authDomain: "grabbit-dev-b598a.firebaseapp.com",
    databaseURL: "https://grabbit-dev-b598a-default-rtdb.firebaseio.com",
    projectId: "grabbit-dev-b598a",
    storageBucket: "grabbit-dev-b598a.appspot.com",
    messagingSenderId: "16188557936",
    appId: "1:16188557936:web:5eafafa096a59e411ac2b5",
    measurementId: "G-4NE9Q3C3BQ"
>>>>>>> 055890a (many updates…)
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
