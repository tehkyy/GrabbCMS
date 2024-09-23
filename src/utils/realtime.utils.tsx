import { useState, useEffect } from 'react';
import {
  getDatabase,
  runTransaction,
  get,
  ref,
  child,
  onValue,
  off,
  DataSnapshot,
  DatabaseReference,
  connectDatabaseEmulator
} from "firebase/database";

import { firebaseApp } from './firebase.utils'

const db = getDatabase(firebaseApp);

//If running locally connect emulators
if(import.meta.env.MODE === 'loc'){
  console.log('Environment = ', import.meta.env.MODE)
// Connect Realtime Database to the emulator
connectDatabaseEmulator(db, "localhost", 9999);  // Connect to Storage emulator
}


// Global cache
const cache: {
  subscriptions: Record<string, { dbRef: DatabaseReference; count: number }>;
  data: Record<string, any>;
} = {
  subscriptions: {},
  data: {},
};

interface UseRealtimeDataProps {
  collectionName: string;
  documentName?: string;
  onChange?: () => void;
}

export const useRealtimeData = ({ collectionName, documentName, onChange }: UseRealtimeDataProps) => {
  const [data, setData] = useState<any>(null);
  const path = documentName ? `${collectionName}/${documentName}` : collectionName;

  useEffect(() => {
    const dbRef = ref(db, path);

    // Ensure the subscription object for the path exists
    if (!cache.subscriptions[path]) {
      cache.subscriptions[path] = {
        dbRef,
        count: 0 // Initialize reference count
      };
    }

    cache.subscriptions[path].count++;

    const handleValue = (snapshot: DataSnapshot) => {
      const val = snapshot.val();
      cache.data[path] = val; // Update global cache
      setData(val);
      if(onChange){
        onChange();
      }
    };

    const handleError = (error: Error) => {
      console.error("Error reading from Firebase Realtime Database:", error);
    };

    onValue(dbRef, handleValue, handleError);

    // Cleanup on unmount
    return () => {
      if (cache.subscriptions[path]) {
        cache.subscriptions[path].count--;
        if (cache.subscriptions[path].count === 0) {
          off(dbRef, "value", handleValue);
          delete cache.subscriptions[path];
        }
      }
    };
  }, [path]);

  return data;
};

interface SetRealtimeDataProps {
  collectionName: string;
  documentName?: string;
  value: any;
}

export const setRealtimeData = async ({ collectionName, documentName, value }: SetRealtimeDataProps) => {
  if (!collectionName || collectionName.trim() === "") {
    console.error("Invalid collectionName");
    return;
  }

  let dbRef = ref(db, collectionName);

  if (documentName && documentName.trim() !== "") {
    dbRef = ref(db, `${collectionName}/${documentName}`);
  }

  try {
    await runTransaction(dbRef, () => {
      return value;
    });
  } catch (error) {
    console.error("Error updating data:", error);
    // Handle error if necessary
  }
};

interface GetRealtimeValueProps {
  collectionName: string;
  documentName?: string;
}

export const getRealtimeValue = async ({ collectionName, documentName }: GetRealtimeValueProps): Promise<DataSnapshot | void> => {
  if (!collectionName || collectionName.trim() === "") {
    console.error("Invalid collectionName");
    return;
  }

  let dbRef = ref(db, collectionName);

  if (documentName && documentName.trim() !== "") {
    dbRef = ref(db, `${collectionName}/${documentName}`);
  }

  try {
    return await get(dbRef);
  } catch (error) {
    console.error("Error updating data:", error);
  }
};

// Get the count of unique viewers
export const getUniqueViewerCount = async (): Promise<number> => {
  const viewersRef = child(ref(db, 'currentsale'), 'viewers');
  const snapshot = await get(viewersRef);
  const viewers = snapshot.val() || {};
  return Object.keys(viewers).length;
};

export const getCurrentSale = async () => {
  const currentSaleRef = ref(db, 'currentsale');
  const snapshot = await get(currentSaleRef);
  const currentSaleData = snapshot.val();

  const { id, name, description, imageUrl, currentPrice, retailPrice, watchers, descriptionHeading } = currentSaleData;

  const currentSale = {
    id,
    name,
    description,
    descriptionHeading,
    imageUrl,
    currentPrice,
    watchers,
    retailPrice,
  };

  return currentSale;
};
