import { ChangeEvent, useEffect, useState } from "react";
import {
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    Container,
    Grid,
    Input,
    Paper,
    Typography
} from "@mui/material";

import {
    buildCollection,
    Entity,
    EntityCollectionView,
    useAuthController,
    useReferenceDialog,
    useSelectionController,
    useSideEntityController,
    useSnackbarController
} from "firecms";

import { Product } from "../types/product.type";
import { triggerDropperProxy } from "../utils/dropper.utils";
import { setRealtimeData, useRealtimeData } from "../utils/realtime.utils";
import { Remove, RemoveRedEye, Speed } from "@mui/icons-material";
import { AddIcon } from "@firecms/ui";


const queueCollection = buildCollection({
    name: "Queue Products",
    group: 'Product',
    icon: 'Queue',
    singularName: "Queued Product",
    path: "grabb_q",
    permissions: ({ authController }) => ({
        edit: true,
        create: true,
        delete: true
    }),

    properties: {
        createdAt: {
            name: 'Created',
            dataType: 'date',
            autoValue: "on_create",
            hideFromCollection: true,
            readOnly: true,
        },
        product: {
            dataType: "reference",
            name: "Product Queue",
            description: "Reference to self",
            path: "products",
            previewProperties: ["main_image", "name"]
        },
    },
});

/**
 * Sample CMS view not bound to a collection, customizable by the developer
 * @constructor
 */
export function GrabbControllerView() {
    // hook to display custom snackbars
    const snackbarController = useSnackbarController();

    const selectionController = useSelectionController();

    // hook to open the side dialog that shows the entity forms
    const sideEntityController = useSideEntityController();

    // hook to do operations related to authentication
    const authController = useAuthController();

    // hook to open a reference dialog
    const referenceDialog = useReferenceDialog({
        path: "products",
        onSingleEntitySelected(entity: Entity<Product> | null) {
            snackbarController.open({
                type: "success",
                message: "Selected " + entity?.values.name
            })
        }
    });
    const activeProduct = useRealtimeData({ collectionName: 'currentsale', documentName: 'product' })
    const bonusViewers = useRealtimeData({ collectionName: 'currentsale', documentName: 'bonusviewers' })
    const currentPrice = useRealtimeData({ collectionName: 'currentsale', documentName: 'currentprice' })
    const currentInventory = useRealtimeData({ collectionName: 'currentsale', documentName: 'product/quantity' })
    const grabbActive = useRealtimeData({ collectionName: 'currentsale', documentName: 'active' })
    const currentSpeed = useRealtimeData({ collectionName: 'currentsale', documentName: 'speed' })

    const StartGrabb = async () => {
        const response = await triggerDropperProxy('start');
        console.log(response);

        if (response.statusCode === 200) {
            snackbarController.open({
                type: "success",
                message: 'Grabb has started!'
            });
        }
        else {
            snackbarController.open({
                type: "error",
                message: `Error! ${response.body}`
            });
        }
    };

    const StopGrabb = async () => {
        const response = await triggerDropperProxy('stop');
        console.log(response);

        if (response.statusCode === 200) {
            snackbarController.open({
                type: "success",
                message: 'Grabb was stopped.'
            });
        }
        else {
            snackbarController.open({
                type: "error",
                message: `Error! ${response.body}`
            });
        }
    };

    const TriggerEndpoint = async (method: string) => {
        const response = await triggerDropperProxy(method);
        console.log(response);

        if (response.statusCode === 200) {
            snackbarController.open({
                type: "success",
                message: response.body
            });
        }
        else {
            snackbarController.open({
                type: "error",
                message: `Error! ${response.body}`
            });
        }
    };

    function handleSliderChange(event: Event, value: number | number[]): void {
        const numberValue = Array.isArray(value) ? value[0] : value;
        setRealtimeData({ collectionName: 'currentsale', documentName: 'bonusviewers', value: numberValue });
    }

    function handleInputChange(event: ChangeEvent<HTMLInputElement>): void {
        const value = Number(event.target.value);
        setRealtimeData({ collectionName: 'currentsale', documentName: 'bonusviewers', value: value });
    }

    function handleViewerChange(value: Number): void {
        const newValue = bonusViewers + Number(value)
        setRealtimeData({ collectionName: 'currentsale', documentName: 'bonusviewers', value: newValue });
    }

    function handleSpeedChange(value: Number): void{
        const newValue = currentSpeed + value
        setRealtimeData({ collectionName: 'currentsale', documentName: 'speed', value: newValue });
    }

    function handleSpeedInputChange(event: ChangeEvent<HTMLInputElement>): void {
        const value = Number(event.target.value);
        setRealtimeData({ collectionName: 'currentsale', documentName: 'speed', value: value });
    }

    function remapSpeed(speed: number): number {
        const inMin = 0.1;
        const inMax = 1;
        const outMin = 1;
        const outMax = 0.1;
        const remappedSpeed = (speed - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;

        return remappedSpeed
    }


    return (
        <Box
            display="flex"
            width={"100%"}
            height={"100%"}>

            <Box m="auto"
                display="flex"
                flexDirection={"column"}
                alignItems={"center"}
                justifyItems={"center"}>

                <Container maxWidth={"md"}
                    sx={{
                        my: 4
                    }}>

                    <Grid item xs={12}>
                        <Typography variant={"h4"}> Grabb Control Center</Typography>
                    </Grid>

                    <Grid container rowSpacing={5} columnSpacing={2}>
                        <Grid item xs={12} sm={4}>
                            <Card variant="outlined" sx={{ height: "100%", display: 'flex' }}>
                                <Box
                                    display="flex"
                                    flexDirection={"column"}
                                    alignItems={"center"}
                                    justifyItems={"center"}
                                >
                                    <CardContent sx={{ flex: '1 0 auto' }}>
                                        <Typography variant={"h5"} >
                                            Current Price
                                        </Typography>
                                        <Typography variant={"h2"} >
                                            {currentPrice?.toLocaleString("en-US", { style: "currency", currency: "USD" })}
                                        </Typography>
                                        <Typography variant={"body1"} >
                                            Retail price: {activeProduct?.retailPrice.toLocaleString("en-US", { style: "currency", currency: "USD" })}
                                        </Typography>
                                    </CardContent>
                                </Box>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Card variant="outlined" sx={{ height: "100%", display: 'flex' }}>
                                <Box
                                    display="flex"
                                    flexDirection={"column"}
                                    alignItems={"center"}
                                    justifyItems={"center"}
                                >
                                    <CardContent sx={{ flex: '1 0 auto' }}>
                                        <Typography variant={"h5"} >
                                            Current Inventory
                                        </Typography>
                                        <Typography variant={"h2"} >
                                            {currentInventory || '🤷🏻‍♂️'}
                                        </Typography>
                                    </CardContent>
                                </Box>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Card variant="outlined" sx={{ height: "100%" }}>
                                <CardContent>
                                    <Typography variant={"h5"}> Grabb Actions</Typography>
                                </CardContent>
                                <CardActions sx={{
                                    display: "flex",
                                    flexDirection: "row",
                                    justifyContent: "center",
                                    marginBottom: "20px"
                                }}>
                                    <Grid>
                                        {grabbActive ?
                                            <Grid container rowSpacing={5} columnSpacing={2}>
                                                <Grid item>
                                                    <Button
                                                        onClick={() => StopGrabb()}
                                                        color="secondary"
                                                        variant="contained">
                                                        Stop Grabb
                                                    </Button>
                                                </Grid>
                                                <Grid item>
                                                    <Button
                                                        onClick={() => TriggerEndpoint('throw')}
                                                        color="primary"
                                                        variant="contained">
                                                        Trigger Grabb
                                                    </Button>
                                                </Grid>
                                            </Grid>
                                            :
                                            <Grid container rowSpacing={5} columnSpacing={2}>
                                                <Grid item>
                                                    <Button
                                                        onClick={() => StartGrabb()}
                                                        color="success"
                                                        variant="contained">
                                                        Start Grabb
                                                    </Button>
                                                </Grid>
                                            </Grid>

                                        }
                                    </Grid>
                                </CardActions>
                            </Card>
                        </Grid>

                        <Grid item xs={12} sm={4}>
                            <Card variant="outlined" sx={{
                                height: "100%",
                                display: "flex",
                                flexDirection: "column"
                            }}>
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Typography id="input-slider" gutterBottom>Dropp Speed</Typography>
                                    <Typography variant="caption" gutterBottom>This is the time between updates, a smaller number (i.e. 0.2) means a faster speed.</Typography>
                                </CardContent>

                                <CardActions>
                                    <Grid container spacing={2} alignItems="center">
                                        <Grid item>
                                            <Speed />
                                        </Grid>
                                        <Grid item>
                                            <Grid container spacing={2} alignItems="center">
                                                <Grid item>
                                                    <Button size="small" color="primary" aria-label="remove" onClick={() => handleSpeedChange(.01)}>
                                                        <Remove />
                                                    </Button>
                                                </Grid>
                                                <Grid item>

                                                    <Input
                                                        value={currentSpeed ? currentSpeed : 0}
                                                        onChange={handleSpeedInputChange}
                                                        inputProps={{
                                                            step: 1,
                                                            min: 1,
                                                            max: 250,
                                                            type: 'number',
                                                            'aria-labelledby': 'input-slider',
                                                        }}
                                                    />
                                                </Grid>
                                                <Grid item>

                                                    <Button size="small" color="primary" aria-label="add" onClick={() => handleSpeedChange(-.01)}>
                                                        <AddIcon />
                                                    </Button>
                                                </Grid>
                                            </Grid>
                                        </Grid>

                                    </Grid>
                                </CardActions>
                            </Card>
                        </Grid>

                        <Grid item xs={12} sm={4}>
                            <Card variant="outlined" sx={{
                                height: "100%",
                                display: "flex",
                                flexDirection: "column"
                            }}>
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Typography id="input-slider" gutterBottom>
                                        Bonus Viewers
                                    </Typography>
                                </CardContent>

                                <CardActions>
                                    <Grid container spacing={2} alignItems="center">
                                        <Grid item>
                                            <RemoveRedEye />
                                        </Grid>
                                        <Grid item>
                                            <Grid container spacing={2} alignItems="center">
                                                <Grid item>
                                                    <Button size="small" color="primary" aria-label="remove" onClick={() => handleViewerChange(-1)}>
                                                        <Remove />
                                                    </Button>
                                                </Grid>
                                                <Grid item>

                                                    <Input
                                                        value={bonusViewers ? bonusViewers : 0}
                                                        onChange={handleInputChange}
                                                        inputProps={{
                                                            step: 1,
                                                            min: 1,
                                                            max: 250,
                                                            type: 'number',
                                                            'aria-labelledby': 'input-slider',
                                                        }}
                                                    />
                                                </Grid>
                                                <Grid item>

                                                    <Button size="small" color="primary" aria-label="add" onClick={() => handleViewerChange(1)}>
                                                        <AddIcon />
                                                    </Button>
                                                </Grid>
                                            </Grid>
                                        </Grid>

                                    </Grid>
                                </CardActions>
                            </Card>
                        </Grid>

                        <Grid item xs={12} sx={{ mt: 3 }}>
                            <Typography>
                                Current Grabb Queue:
                            </Typography>

                            <Paper
                                variant={"outlined"}
                                sx={{
                                    // width: 800,
                                    height: 400,
                                    overflow: "hidden",
                                    my: 2
                                }}>
                                <EntityCollectionView
                                    fullPath={"grabb_q"}
                                    selectionController={selectionController}
                                    {...queueCollection}
                                />
                            </Paper>
                        </Grid>

                    </Grid>

                </Container>
            </Box>
        </Box>
    );
}
