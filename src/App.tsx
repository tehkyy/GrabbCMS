import { useCallback, useState } from "react";
import { User as FirebaseUser } from "firebase/auth";

import { ThemeProvider } from "@mui/material";
import { getApps, initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getStorage, connectStorageEmulator } from "firebase/storage";
import { connectDatabaseEmulator, getDatabase } from "firebase/database";

import { dbConfig } from "./utils/firebase.utils";
import { Authenticator, FirebaseCMSApp, CMSView } from "firecms";

// Collection schema
import { productsCollection } from "./collections/product.collection";
import { settingsCollection } from "./collections/settings.collection";
import { usersCollection } from "./collections/user.collection";
import { pagesCollection } from "./collections/page.collection";
import { promotionCollection } from "./collections/promotion.collection";
import { pressReleaseCollection } from "./collections/press-release.collection";
import { contentBlockCollection } from "./collections/content-block.collection";
import { ticketsCollection } from "./collections/ticket.collection";
import { GrabbControllerView } from "./views/grabb-controller.view";
import { shippingOptionsCollection } from "./collections/shipping-options.collection";
import { LoggerDashboardView } from "./views/logger.view";
import { salesCollection } from "./collections/sales.collection";
import { Palette } from "@mui/icons-material";
import { grabbitTheme } from "./themes/grabbit-theme";

// Initialize Firebase services
const firebaseApp = initializeApp(dbConfig);
const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);
const storage = getStorage(firebaseApp);
const rtdb = getDatabase(firebaseApp);

/**
 * Connects to Firebase emulators if running locally.
 */
if (import.meta.env.MODE === "loc") {
  connectFirestoreEmulator(db, "localhost", 8080);
  connectAuthEmulator(auth, "http://localhost:9099");
  connectStorageEmulator(storage, "localhost", 9199);
  console.log("✅ Connected to Firebase Emulators");
}

const customViews: CMSView[] = [
  {
    path: "controller",
    name: "Controller",
    description: "Grabb controller",
    icon: "BackHand",
    group: "Admin",
    view: <GrabbControllerView />
  },
  // {
  //   path: "logs",
  //   name: "Logs",
  //   description: "Log viewer",
  //   icon: "Terminal",
  //   group: "Admin",
  //   view: <LoggerDashboardView />
  // }
];

interface EnvironmentToolbarProps { }

const EnvironmentToolbar: React.FC<EnvironmentToolbarProps> = () => {
  const existingApps = getApps().map(app => app);
  return (
    <div>
      Test
    </div>
  );
};

export default function App() {
  const [activeDatabase, setActiveDatabase] = useState(dbConfig);

  const myAuthenticator: Authenticator<FirebaseUser> = useCallback(async ({
    user,
    authController
  }) => {

    if (!(user?.email?.includes("@gograbb.it"))) {
      throw Error("Access Denied");
    }

    console.log("Allowing access to", user?.email);

    // Retrieve async user roles
    const sampleUserRoles = await Promise.resolve(["3"]);
    authController.setExtra(sampleUserRoles);

    return true;
  }, []);
  
  return (
    <ThemeProvider theme={grabbitTheme}>
      <FirebaseCMSApp
        name="Grabbit"
        views={customViews}
        authentication={myAuthenticator}
        collections={[
          productsCollection,
          shippingOptionsCollection,
          usersCollection,
          pagesCollection,
          contentBlockCollection,
          promotionCollection,
          pressReleaseCollection,
          salesCollection,
          // ticketsCollection,
          // settingsCollection,
        ]}
        firebaseConfig={dbConfig}
        logo="https://firebasestorage.googleapis.com/v0/b/grabbit-dev-b598a.appspot.com/o/images%2Fgrabbit_logo_circle.png?alt=media&token=c4abadd6-a81a-4ae8-860c-041cba87daf3"
        allowSkipLogin={false}
        signInOptions={["password"]}
      />
     </ThemeProvider>
  );
};
