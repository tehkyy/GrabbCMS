import { ChangeEvent, useEffect, useState } from "react";
import {
    Box,
    Container,
    Grid,
    Typography
} from "@mui/material";

import {
    Entity,
    useAuthController,
    useDataSource,
    useReferenceDialog,
    useSelectionController,
    useSideEntityController,
    useSnackbarController,
    useCollectionFetch
} from "firecms";

import { Product } from "../types/product.type";
import { triggerDropperProxy } from "../utils/dropper.utils";
import { setRealtimeData, useRealtimeData } from "../utils/realtime.utils";
import { grabbsCollection } from "../collections/grabbs.collection";
import { GrabbControlCards } from "../cards/GrabbControlCards";
import { GrabbDashboardCards } from "../cards/GrabbDashboardCards";
import { GrabbQueue } from "../cards/GrabbQueue";

export function GrabbControllerView() {
    const snackbarController = useSnackbarController();
    const selectionController = useSelectionController();
    const sideEntityController = useSideEntityController();
    const authController = useAuthController();
    const dataSource = useDataSource();

    const referenceDialog = useReferenceDialog({
        path: "products",
        onSingleEntitySelected(entity: Entity<Product> | null) {
            snackbarController.open({
                type: "success",
                message: "Selected " + entity?.values.name
            });
        }
    });

    // ── RTDB subscriptions ──────────────────────────────────────────────────
    const activeProduct = useRealtimeData({ collectionName: 'currentsale', documentName: 'product' });
    const bonusViewers = useRealtimeData({ collectionName: 'currentsale', documentName: 'bonusviewers' });
    const natchyViewers = useRealtimeData({ collectionName: 'currentsale', documentName: 'viewers' });
    const currentPrice = useRealtimeData({ collectionName: 'currentsale', documentName: 'currentprice' });
    const currentInventory = useRealtimeData({ collectionName: 'currentsale', documentName: 'product/quantity' });
    const grabbActive = useRealtimeData({ collectionName: 'currentsale', documentName: 'active' });
    const currentSpeed = useRealtimeData({ collectionName: 'currentsale', documentName: 'speed' });
    const effectiveSpeed = useRealtimeData({ collectionName: 'currentsale', documentName: 'effectiveSpeed' });
    const viewerWeight = useRealtimeData({ collectionName: 'currentsale', documentName: 'speedFactors/viewerWeight' });
    const priceWeight = useRealtimeData({ collectionName: 'currentsale', documentName: 'speedFactors/priceWeight' });
    const varianceEnabled = useRealtimeData({ collectionName: "currentsale", documentName: "varianceConfig/enabled" });
    const varianceTolerance = useRealtimeData({ collectionName: "currentsale", documentName: "varianceConfig/tolerance" });
    const varianceMode = useRealtimeData({ collectionName: "currentsale", documentName: "varianceConfig/mode" });
    const weighting = useRealtimeData({ collectionName: "currentsale", documentName: "speedFactors/weigthing" });

    const naturalCount = natchyViewers ? Object.keys(natchyViewers).length - 1 : 1;

    // ── Queue ───────────────────────────────────────────────────────────────
    const { data: queue } = useCollectionFetch({
        path: "grabb_q",
        collection: grabbsCollection,
    });

    const queueIsEmpty = !queue || queue.length === 0;
    const hasInvalidItems = queue?.some((item: any) => !item.values?.stripe_id) ?? false;
    const disableStartGrabb = queueIsEmpty || hasInvalidItems;

    // ── Product name resolution ─────────────────────────────────────────────
    const [productNames, setProductNames] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!queue || queue.length === 0) return;

        const unresolvedIds = queue
            .map((item: any) => item.values?.product?.id)
            .filter((id: string) => id && !productNames[id]);

        if (unresolvedIds.length === 0) return;

        const resolve = async () => {
            const entries = await Promise.all(
                unresolvedIds.map(async (id: string) => {
                    try {
                        const entity = await dataSource.fetchEntity({
                            path: "products",
                            entityId: id,
                            collection: { properties: {} } as any,
                        });
                        return [id, (entity?.values as any)?.name ?? id];
                    } catch {
                        return [id, id];
                    }
                })
            );
            setProductNames(prev => ({ ...prev, ...Object.fromEntries(entries) }));
        };

        resolve();
    }, [queue]);

    // ── SSE dropper status ──────────────────────────────────────────────────
    const [dropperStatus, setDropperStatus] = useState<any>(null);

    useEffect(() => {
        const source = new EventSource(import.meta.env.VITE_DROPSERVER + "/status/stream", {
            withCredentials: false
        });
        source.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setDropperStatus({ error: false, data });
        };
        source.onerror = (err) => {
            console.error("SSE error:", err);
            setDropperStatus({ error: true, message: "SSE connection lost" });
        };
        return () => source.close();
    }, []);

    // ── Actions ─────────────────────────────────────────────────────────────

    const StartGrabb = async () => {
        const response = await triggerDropperProxy('start');
        if (response.statusCode === 200) {
            snackbarController.open({ type: "success", message: 'Grabb has started!' });
        } else {
            snackbarController.open({ type: "error", message: `Error! ${response.body}` });
        }
    };

    const StopGrabb = async () => {
        try {
            const response = await triggerDropperProxy('stop');
            if (response.statusCode === 200) {
                snackbarController.open({ type: "success", message: 'Grabb was stopped.' });
                return;
            }
            const body = JSON.parse(response.body ?? '{}');
            const isStateError =
                (typeof body?.error === 'string' && body.error.includes('Invalid transition')) ||
                (typeof body?.message === 'string' && body.message.includes('Invalid transition'));
            if (isStateError) { await escalateToForceStop(); return; }
            snackbarController.open({ type: "error", message: `Error! ${response.body}` });
        } catch (error: any) {
            const serverError = error?.response?.data?.error ?? error?.message ?? 'Unknown error';
            if (typeof serverError === 'string' && serverError.includes('Invalid transition')) {
                await escalateToForceStop();
                return;
            }
            snackbarController.open({ type: "error", message: `Error! ${String(serverError)}` });
        }
    };

    const escalateToForceStop = async () => {
        try {
            console.warn('Escalating to force-stop');
            const forceResponse = await triggerDropperProxy('force-stop');
            if (forceResponse.statusCode === 200) {
                snackbarController.open({ type: "warning", message: 'Server was force reset to stopped state.' });
            } else {
                snackbarController.open({ type: "error", message: 'Force stop also failed. Check server logs.' });
            }
        } catch {
            snackbarController.open({ type: "error", message: 'Force stop also failed. Check server logs.' });
        }
    };

    const TriggerEndpoint = async (method: string) => {
        const response = await triggerDropperProxy(method);
        if (response.statusCode === 200) {
            snackbarController.open({ type: "success", message: response.body });
        } else {
            snackbarController.open({ type: "error", message: `Error! ${response.body}` });
        }
    };

    function handleSpeedChange(value: Number): void {
        const newValue = Math.round((currentSpeed + value) * 100) / 100;
        setRealtimeData({ collectionName: 'currentsale', documentName: 'speed', value: newValue });
    }

    function handleSpeedInputChange(event: ChangeEvent<HTMLInputElement>): void {
        setRealtimeData({ collectionName: 'currentsale', documentName: 'speed', value: Number(event.target.value) });
    }

    // ── Queue handlers ───────────────────────────────────────────────────────

    const handleOpenEntry = (id: string) => {
        sideEntityController.open({
            path: "grabb_q",
            entityId: id,
            collection: grabbsCollection,
        });
    };

    const handleDeleteEntry = async (id: string) => {
        try {
            // Get quantity and product ref from local queue state — no extra fetch needed
            const entry = (queue ?? []).find((item: any) => item.id === id);
            const quantity = entry?.values?.quantity ?? 0;
            const productId = entry?.values?.product?.id;

            // Release quantityQueued on the product doc before deleting
            if (productId && quantity > 0) {
                const currentProduct = await dataSource.fetchEntity({
                    path: "products",
                    entityId: productId,
                    collection: { properties: {} } as any,
                });
                const currentQueued = (currentProduct?.values as any)?.quantityQueued ?? 0;
                const newQueued = Math.max(0, currentQueued - quantity);

                await dataSource.saveEntity({
                    path: "products",
                    entityId: productId,
                    values: { ...(currentProduct?.values as any), quantityQueued: newQueued },
                    collection: { properties: {} } as any,
                    status: "existing",
                });
            }

            // Now delete the queue entry
            await dataSource.deleteEntity({
                entity: { id, path: "grabb_q", values: {} as any }
            });

            snackbarController.open({ type: "success", message: "Queue entry removed." });
        } catch (error: any) {
            snackbarController.open({ type: "error", message: `Failed to remove: ${error?.message ?? "Unknown error"}` });
        }
    };

    // ── Render ──────────────────────────────────────────────────────────────

    return (
        <Box display="flex" width="100%" height="100%">
            <Box m="auto" display="flex" flexDirection="column" alignItems="center" justifyItems="center">
                <Container sx={{ y: 4, px: 4, py: 4 }}>

                    <Grid item xs={12} sx={{ my: 4 }}>
                        <Typography variant="h4">Grabb Control Center</Typography>
                    </Grid>

                    {/* ── Top control cards ─────────────────────────────── */}
                    <GrabbControlCards
                        currentPrice={currentPrice}
                        activeProduct={activeProduct}
                        dropperStatus={dropperStatus}
                        currentInventory={currentInventory}
                        grabbActive={!!grabbActive}
                        disableStartGrabb={disableStartGrabb}
                        hasInvalidItems={hasInvalidItems}
                        queue={queue ?? []}
                        queueIsEmpty={queueIsEmpty}
                        currentSpeed={currentSpeed}
                        effectiveSpeed={effectiveSpeed}
                        weighting={!!weighting}
                        viewerWeight={viewerWeight}
                        priceWeight={priceWeight}
                        bonusViewers={bonusViewers ?? 0}
                        naturalCount={naturalCount}
                        varianceEnabled={!!varianceEnabled}
                        varianceTolerance={varianceTolerance}
                        varianceMode={varianceMode}
                        onStart={StartGrabb}
                        onStop={StopGrabb}
                        onTriggerGrabb={() => TriggerEndpoint('throw')}
                        onSpeedChange={handleSpeedChange}
                        onSpeedInputChange={handleSpeedInputChange}
                        onWeightingChange={(v) => setRealtimeData({ collectionName: "currentsale", documentName: "speedFactors/weigthing", value: v })}
                        onViewerWeightChange={(e) => setRealtimeData({ collectionName: "currentsale", documentName: "speedFactors/viewerWeight", value: Number(e.target.value) / 100 })}
                        onPriceWeightChange={(e) => setRealtimeData({ collectionName: "currentsale", documentName: "speedFactors/priceWeight", value: Number(e.target.value) / 100 })}
                        onVarianceEnabledChange={(v) => setRealtimeData({ collectionName: "currentsale", documentName: "varianceConfig/enabled", value: v })}
                        onVarianceToleranceChange={(e) => setRealtimeData({ collectionName: "currentsale", documentName: "varianceConfig/tolerance", value: Number(e.target.value) })}
                        onVarianceModeChange={(v) => setRealtimeData({ collectionName: "currentsale", documentName: "varianceConfig/mode", value: v })}
                    />

                    {/* ── Live analytics cards ───────────────────────────── */}
                    <GrabbDashboardCards dropperStatus={dropperStatus} />

                    {/* ── Queue ─────────────────────────────────────────── */}
                    <Grid item xs={12} sx={{ mt: 4 }}>
                        <GrabbQueue
                            queue={queue ?? []}
                            dropperStatus={dropperStatus}
                            productNames={productNames}
                            onAddEntry={() => sideEntityController.open({
                                path: "grabb_q",
                                collection: grabbsCollection,
                            })}
                            onOpenEntry={handleOpenEntry}
                            onDeleteEntry={handleDeleteEntry}
                        />
                    </Grid>

                </Container>
            </Box>
        </Box>
    );
}
