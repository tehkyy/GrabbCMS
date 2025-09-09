import { ChangeEvent } from "react";
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
    Entity,
    EntityCollectionView,
    useAuthController,
    useReferenceDialog,
    useSelectionController,
    useSideEntityController,
    useSnackbarController,
    useCollectionFetch
} from "firecms";

import { Product } from "../types/product.type";
import { triggerDropperProxy } from "../utils/dropper.utils";
import { setRealtimeData, useRealtimeData } from "../utils/realtime.utils";
import { Remove, RemoveRedEye, Speed, FitnessCenter } from "@mui/icons-material";
import { AddIcon } from "@firecms/ui";
import { grabbsCollection } from "../collections/grabbs.collection";
import { Switch, FormControlLabel } from "@mui/material";

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
    const effectiveSpeed = useRealtimeData({ collectionName: 'currentsale', documentName: 'effectiveSpeed' })
    const viewerWeight = useRealtimeData({ collectionName: 'currentsale', documentName: 'speedFactors/viewerWeight' })
    const priceWeight = useRealtimeData({ collectionName: 'currentsale', documentName: 'speedFactors/priceWeight' })


    const { data: queue } = useCollectionFetch({
        path: "grabb_q",
        collection: grabbsCollection
    });

    // true if queue is empty
    const queueIsEmpty = !queue || queue.length === 0;

    // true if ANY queued item has no stripe_id
    const hasInvalidItems = queue?.some((item: any) => !item.values?.stripe_id) ?? false;

    // final disable condition
    const disableStartGrabb = queueIsEmpty || hasInvalidItems;

    const ignoreWeights = useRealtimeData({
        collectionName: "currentsale",
        documentName: "speedFactors/ignoreWeights"
    });

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

    // function handleSliderChange(event: Event, value: number | number[]): void {
    //     const numberValue = Array.isArray(value) ? value[0] : value;
    //     setRealtimeData({ collectionName: 'currentsale', documentName: 'bonusviewers', value: numberValue });
    // }

    function handleInputChange(documentPath: string) {
        return (event: React.ChangeEvent<HTMLInputElement>) => {
            const value = Number(event.target.value);
            setRealtimeData({
                collectionName: "currentsale",
                documentName: documentPath,
                value,
            });
        };
    }


    function handleViewerChange(value: Number): void {
        const newValue = bonusViewers + Number(value)
        setRealtimeData({ collectionName: 'currentsale', documentName: 'bonusviewers', value: newValue });
    }

    function handleSpeedChange(value: Number): void {
        const newValue = Math.round((currentSpeed + value) * 100) / 100;
        setRealtimeData({ collectionName: 'currentsale', documentName: 'speed', value: newValue });
    }

    function handleSpeedInputChange(event: ChangeEvent<HTMLInputElement>): void {
        const centsPerSecond = Number(event.target.value);
        setRealtimeData({
            collectionName: 'currentsale',
            documentName: 'speed',
            value: centsPerSecond
        });
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

                <Container maxWidth={"lg"} sx={{ my: 4 }}>
                    <Grid item xs={12} sx={{ my: 4 }}>
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
                                            <Grid container justifyContent={"center"} alignItems={"center"} flexDirection={"column"}>
                                                <Grid item>
                                                    <Button
                                                        disabled={disableStartGrabb}
                                                        onClick={() => StartGrabb()}
                                                        color="success"
                                                        variant="contained"
                                                    >
                                                        Start Grabb
                                                    </Button>

                                                    {hasInvalidItems && (
                                                        <Typography variant="caption" color="error">
                                                            ⚠️ Some queued products are missing Stripe IDs
                                                        </Typography>
                                                    )}

                                                </Grid>
                                                <Grid item>
                                                    <Typography variant="caption" color={queueIsEmpty ? "error" : "textSecondary"}>
                                                        {queueIsEmpty
                                                            ? "Queue is empty"
                                                            : `Queue length: ${queue.length}`}
                                                    </Typography>
                                                </Grid>
                                            </Grid>

                                        }
                                    </Grid>
                                </CardActions>
                            </Card>
                        </Grid>

                        {/* --- Controls Row: Speed, Weights, Bonus --- */}
                        <Grid container spacing={2} sx={{ mt: 2 }}>
                            {/* Dropp Speed */}
                            <Grid item xs={12} md={4}>
                                <Card variant="outlined" sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                                    <CardContent>
                                        <Box display="flex" alignItems="center" mb={1}>
                                            <Speed fontSize="small" sx={{ mr: 1 }} />
                                            <Typography variant="h6">Dropp Speed</Typography>
                                        </Box>
                                        <Typography variant="caption" color="text.secondary">
                                            Rate of drop in ¢ per second
                                        </Typography>
                                    </CardContent>
                                    <CardActions sx={{ flexDirection: "column", alignItems: "stretch", px: 2, pb: 2 }}>
                                        {/* Base Speed */}
                                        <Typography variant="subtitle2" gutterBottom>
                                            Base Dropp Speed
                                        </Typography>
                                        <Box display="flex" alignItems="center" justifyContent="center" mb={1}>
                                            <Button size="small" onClick={() => handleSpeedChange(-0.1)}>
                                                <Remove />
                                            </Button>
                                            <Input
                                                value={currentSpeed ?? 0}
                                                onChange={handleSpeedInputChange}
                                                inputProps={{
                                                    type: "number",
                                                    min: 0.1,
                                                    step: 0.1,
                                                    style: { textAlign: "center", width: 80 }
                                                }}
                                            />
                                            <Button size="small" onClick={() => handleSpeedChange(0.1)}>
                                                <AddIcon />
                                            </Button>
                                        </Box>

                                        {/* Effective Speed */}
                                        <Typography variant="subtitle2">Effective Dropp Speed</Typography>
                                        <Typography variant="h6" textAlign="center">
                                            ${((effectiveSpeed ?? 0) / 100).toFixed(3)} / Second
                                        </Typography>
                                    </CardActions>
                                </Card>
                            </Grid>

                            {/* Speed Weights */}
                            <Grid item xs={12} md={4}>
                                <Card variant="outlined" sx={{
                                    height: "100%",
                                    display: "flex",
                                    flexDirection: "column"
                                }}>
                                    <CardContent sx={{ flexGrow: 1 }}>
                                        <Box display="flex" alignItems="center" mb={1}>
                                            <FitnessCenter fontSize="small" sx={{ mr: 1 }} />
                                            <Typography variant="h6">Dropp Speed</Typography>
                                        </Box>
                                        <Typography variant="caption" color="text.secondary">
                                            Rate of drop in ¢ per second
                                        </Typography>
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={!!ignoreWeights}
                                                    onChange={(e) =>
                                                        setRealtimeData({
                                                            collectionName: "currentsale",
                                                            documentName: "speedFactors/ignoreWeights",
                                                            value: e.target.checked
                                                        })
                                                    }
                                                />
                                            }
                                            label="Ignore all weights"
                                        />
                                    </CardContent>

                                    <CardActions>
                                        <Grid container alignItems="center" spacing={2}>
                                            <Grid item xs={12}>
                                                <Input
                                                    value={viewerWeight ? viewerWeight * 100 : 0}
                                                    disabled={!!ignoreWeights}   // 👈 disable when toggle is on
                                                    onChange={(e) => {
                                                        const percent = Number(e.target.value);
                                                        const raw = percent / 100;
                                                        setRealtimeData({
                                                            collectionName: "currentsale",
                                                            documentName: "speedFactors/viewerWeight",
                                                            value: raw
                                                        });
                                                    }}
                                                    inputProps={{
                                                        step: 0.1,
                                                        min: 0,
                                                        max: 100,
                                                        type: "number",
                                                        style: { textAlign: "center" }
                                                    }}
                                                />
                                                <Typography variant="caption">Influence per viewer (%)</Typography>
                                            </Grid>

                                            <Grid item xs={12}>
                                                <Input
                                                    value={priceWeight ? priceWeight * 100 : 0}
                                                    disabled={!!ignoreWeights}   // 👈 disable when toggle is on
                                                    onChange={(e) => {
                                                        const percent = Number(e.target.value);
                                                        const raw = percent / 100;
                                                        setRealtimeData({
                                                            collectionName: "currentsale",
                                                            documentName: "speedFactors/priceWeight",
                                                            value: raw
                                                        });
                                                    }}
                                                    inputProps={{
                                                        step: 0.1,
                                                        min: 0,
                                                        max: 500,
                                                        type: "number",
                                                        style: { textAlign: "center" }
                                                    }}
                                                />
                                                <Typography variant="caption">Influence from price ratio (%)</Typography>
                                            </Grid>
                                        </Grid>
                                    </CardActions>
                                </Card>
                            </Grid>

                            {/* Bonus Viewers */}
                            <Grid item xs={12} md={4}>
                                <Card variant="outlined" sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                                    <CardContent>
                                        <Box display="flex" alignItems="center" mb={1}>
                                            <RemoveRedEye fontSize="small" sx={{ mr: 1 }} />
                                            <Typography variant="h6">Bonus Viewers</Typography>
                                        </Box>
                                        <Typography variant="caption" color="text.secondary">
                                            Extra viewers
                                        </Typography>
                                    </CardContent>
                                    <CardActions sx={{ height: "100%", alignContent: "center", justifyContent: "center", pb: 2 }}>
                                        <Button size="small" onClick={() => handleViewerChange(-1)}>
                                            <Remove />
                                        </Button>
                                        <Input
                                            value={bonusViewers ?? 0}
                                            onChange={handleInputChange("bonusviewers")}
                                            inputProps={{
                                                type: "number",
                                                min: 0,
                                                style: { textAlign: "center", width: 80 }
                                            }}
                                        />
                                        <Button size="small" onClick={() => handleViewerChange(1)}>
                                            <AddIcon />
                                        </Button>
                                    </CardActions>
                                </Card>
                            </Grid>
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
                                    {...grabbsCollection}
                                />
                            </Paper>
                        </Grid>
                    </Grid>
                </Container>
            </Box>
        </Box>
    );
}
