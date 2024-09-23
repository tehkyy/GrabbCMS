import { useCallback, useState } from "react";
import { User as FirebaseUser } from "firebase/auth";
import {
  CMSView,
} from "@firecms/core";

import "typeface-rubik";
import "@fontsource/ibm-plex-mono";
import { getApps } from 'firebase/app';
import { dbConfig } from "./utils/firebase.utils";


import { Authenticator, FirebaseCMSApp } from "firecms";

import "typeface-rubik";


//Collection schema
import { productsCollection } from "./collections/product.collection";
import { queueCollection } from "./collections/queue.collection";
import { usersCollection } from "./collections/user.collection";
import { pagesCollection } from "./collections/page.collection";
import { promotionCollection } from "./collections/promotion.collection";
import { pressReleaseCollection } from "./collections/press-release.collection";
import { contentBlockCollection } from "./collections/content-block.collection";
import { ticketsCollection } from "./collections/ticket.collection";
import { GrabbControllerView } from "./views/grabb-controller.view";
import { shippingOptionsCollection } from "./collections/shipping-options.collection";
import { LoggerDashboardView } from "./views/logger.view";

const customViews: CMSView[] = [
  {
    path: "controller",
    name: "Controller",
    description: "Grabb controller",
    icon: 'BackHand',
    group: 'Admin',
    view: <GrabbControllerView />
  },
  {
    path: "logs",
    name: "Logs",
    description: "Log viewer",
    icon: "Terminal",
    group: 'Admin',
    view: <LoggerDashboardView />
  }
];


interface EnvironmentToolbarProps { }

export default function App() {
  const [activeDatabase, setActiveDatabase] = useState(dbConfig);

  const EnvironmentToolbar: React.FC<EnvironmentToolbarProps> = () => {
    const existingApps = getApps().map(app => app);

    return (
      <div>
        Test
      </div>
    );
  };

  const myAuthenticator: Authenticator<FirebaseUser> = useCallback(async ({
    user,
    authController
  }) => {

    if (!(user?.email?.includes("@gograbb.it"))) {
      throw Error("Access Denied");
    }

    console.log("Allowing access to", user?.email);

    // This is an example of retrieving async data related to the user
    // and storing it in the user extra field.

    const sampleUserRoles = await Promise.resolve(["3"]);
    authController.setExtra(sampleUserRoles);

    return true;
  }, []);

  return (
    <FirebaseCMSApp
      name="Grabbit"
      views={customViews}
      authentication={myAuthenticator}
      collections={
        [
          productsCollection,
          shippingOptionsCollection,
          usersCollection,
          pagesCollection,
          contentBlockCollection,
          promotionCollection,
          pressReleaseCollection,
          ticketsCollection,
        ]}
      firebaseConfig={dbConfig}
      logo="https://firebasestorage.googleapis.com/v0/b/grabbit-dev-b598a.appspot.com/o/images%2Fgrabbit_logo_circle.png?alt=media&token=c4abadd6-a81a-4ae8-860c-041cba87daf3"
      allowSkipLogin={false}
      signInOptions={["password"]}
    />
  );
};