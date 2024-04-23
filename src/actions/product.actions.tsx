import React, { useState } from "react";
import { CollectionActionsProps } from "firecms";
import { Button, Snackbar } from '@mui/material';
import { doc, getDoc, setDoc, updateDoc} from "firebase/firestore";
import { firestoreDataBase } from "../utils/firebase.utils";
import MuiAlert from '@mui/material/Alert';
import { AlertProps } from "@mui/material/Alert";
type ProductActionsProps = CollectionActionsProps;

export default function ProductActions(props: ProductActionsProps) {
  const { selectionController } = props;
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const selectedEntities = selectionController.selectedEntities;

  const Alert = React.forwardRef<HTMLDivElement, AlertProps>((props, ref) => {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
  });
  Alert.displayName = "Alert";

  const handleCopyToDevelopment = async () => {
    if(selectedEntities.length < 1){
      return;
    }
    for (const entity of selectedEntities) {
      const docId = entity.id; // Assuming each entity has an "id" field

      // Fetch the document from the production database
      const prodDocRef = doc(firestoreDataBase, "products", docId);
      const prodDocSnap = await getDoc(prodDocRef);

      if (prodDocSnap.exists()) {
        // Copy the document to the dev database
        const devDocRef = doc(firestoreDataBase, "products", docId);
        await setDoc(devDocRef, prodDocSnap.data());
      }
    }

    // Deselect all products after copying
    selectionController.setSelectedEntities([]);

    // Show success message
    setOpenSnackbar(true);
  };



  const handleCloseSnackbar = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackbar(false);
  };


  return (
    <>
      <Button variant="contained" color={selectedEntities.length > 0 ?  "primary" : "inherit"} onClick={handleCopyToDevelopment}>
        Copy Selected to Development
      </Button>
      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity="success">
          Products successfully copied!
        </Alert>
      </Snackbar>
    </>
  );
}

