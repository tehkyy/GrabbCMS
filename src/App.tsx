import { useCallback, useState } from "react";
import { User as FirebaseUser } from "firebase/auth";
import {
  Authenticator,
  FirebaseCMSApp,
} from "firecms";

import "typeface-rubik";
import "@fontsource/ibm-plex-mono";
import { getApps } from 'firebase/app';
import { dbConfig } from "./utils/firebase.utils";

//Collection schema
import { productsCollection } from "./schema/product.schema";
import { queueCollection } from "./schema/queue.schema";
import { usersCollection } from "./schema/user.schema";
import { pagesCollection } from "./schema/page.schema";
import { promotionCollection } from "./schema/promotion.schema";
import { pressReleaseCollection } from "./schema/press-release.schema";
import { contentBlockCollection } from "./schema/content-block.schema";
import { Button } from "@mui/material";
import { getFirestore } from "firebase/firestore";

interface EnvironmentToolbarProps {}

export default function App() {
  const [activeDatabase, setActiveDatabase] = useState(dbConfig);

  const EnvironmentToolbar: React.FC<EnvironmentToolbarProps> = () => {
    const existingApps = getApps().map(app => app);
    
    return (
      <div>
      </div>
    );
  };

  const myAuthenticator: Authenticator<FirebaseUser> = useCallback(async ({
    user,
    authController
  }) => {

    if (user?.email?.includes("flanders")) {
      throw Error("Access Denied");
    }

    console.log("Allowing access to", user?.email);

    // This is an example of retrieving async data related to the user
    // and storing it in the user extra field.

    const sampleUserRoles = await Promise.resolve(["admin"]);
    authController.setExtra(sampleUserRoles);

    return true;
  }, []);
    
  return (
    <FirebaseCMSApp
      name="Grabbit"
      authentication={myAuthenticator}
      collections={[productsCollection, queueCollection, usersCollection, pagesCollection, contentBlockCollection, promotionCollection, pressReleaseCollection]}
      firebaseConfig={dbConfig}
      // toolbarExtraWidget={<EnvironmentToolbar />}
    />
  );
};