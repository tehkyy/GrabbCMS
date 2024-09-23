import React, { useState } from "react";
import { CollectionActionsProps } from "firecms";
import { Button, Snackbar } from '@mui/material';
import { doc, getDoc, updateDoc, collection, getDocs } from "firebase/firestore";
import { firestoreDataBase } from "../utils/firebase.utils";
import MuiAlert from '@mui/material/Alert';
import { AlertProps } from "@mui/material/Alert";

type AdminActionsProps = CollectionActionsProps;

export default function AdminActions(props: AdminActionsProps) {
    const { selectionController } = props; // Destructure entityCollection from props
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const selectedEntities = selectionController.selectedEntities;

    const entityCollection = props.collection;

    const Alert = React.forwardRef<HTMLDivElement, AlertProps>((props, ref) => {
        return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
    });
    Alert.displayName = "Alert";


    const handleAddDate = async () => {
        if (selectedEntities.length < 1) {
            console.log("No entities selected.");
            return;
        }
    
        try {
            const updates = selectedEntities.map(async (entity) => {
                const docId = entity.id; // Assuming each entity has an "id" field
                let collectionName = entity.path; // Assuming each entity knows its collection

                //For some reason I am not sure of yet some of these docs entity.path returns collection/document and some only return collection
                //This checks to see if there are more than 1 segment and chooses only the first, the collection name
                if(collectionName.split('/').length > 1 ){
                    collectionName = entity.path.split('/')[0]
                } 
            
                const docRef = doc(firestoreDataBase, collectionName, docId);
                const docSnap = await getDoc(docRef);
            
                if (docSnap.exists()) {
                    // Update the document to set the 'createdAt' field to the current date and time
                    await updateDoc(docRef, {
                        createdAt: new Date()
                    });
                    console.log(`Updated ${docId} in ${collectionName} with current date and time.`);
                } else {
                    console.log(`Document with ID ${docId} in ${collectionName} does not exist.`);
                }
            });
    
            // Wait for all update operations to complete
            await Promise.all(updates);
            console.log("All selected entities have been updated with the current date and time.");
    
            // Deselect all products after updating
            selectionController.setSelectedEntities([]);
    
            // Show success message
            setOpenSnackbar(true);
        } catch (error) {
            console.error("Error updating documents:", error);
            // Handle errors, e.g., show an error message
        }
    };

    const selectAllEntities = async () => {
        if (!entityCollection) {
          console.error("Entity collection context is not available.");
          return;
        }
    
        //If there is a selection already, this will deselect instead
        if(selectedEntities.length > 0){
            selectionController.setSelectedEntities([]);
            return;
        }
        
        const collectionName = entityCollection.path; // Use the path as the collection name
        const querySnapshot = await getDocs(collection(firestoreDataBase, collectionName));
        const entities = querySnapshot.docs.map(doc => ({
          id: doc.id,
          path: `${collectionName}/${doc.id}`, // Assuming the path format you're using elsewhere
          values: doc.data() // Assuming 'values' should hold the document data
        }));
    
        selectionController.setSelectedEntities(entities);
        console.log(`Selected all entities from collection: ${collectionName}`);
    };
    const handleCloseSnackbar = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpenSnackbar(false);
    };
    


    return (
        <>
            <Button variant="contained" color={selectedEntities.length > 0 ? "primary" : "inherit"} onClick={handleAddDate}>
                Add Created Date
            </Button>
            <Button variant="contained" color={selectedEntities.length > 0 ? "secondary" : "inherit"} onClick={selectAllEntities}>
                {selectedEntities.length < 1 ? 'Select All' : 'Deselect All' }
            </Button>
            <Button onClick={(() => console.log(import.meta.env.VITE_PRODUCTION_API_KEY))}>Log ENV</Button>
            <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
                <Alert onClose={handleCloseSnackbar} severity="success">
                    Date Added!
                </Alert>
            </Snackbar>
        </>
    );
}

