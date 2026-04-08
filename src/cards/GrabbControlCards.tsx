// ─── GrabbControlCards.tsx ────────────────────────────────────────────────────

import { ChangeEvent } from "react";
import {
    Box, Button, Card, CardContent, Divider, Grid,
    IconButton, Input, Stack, Switch, FormControlLabel, Typography,
} from "@mui/material";
import {
    Add, Remove, Stop, PlayArrow, FlashOn,
    FitnessCenter, RemoveRedEye, Speed, Tune,
} from "@mui/icons-material";

interface GrabbControlCardsProps {
    currentPrice: number | null;
    activeProduct: any;
    dropperStatus: any;
    currentInventory: number | null;
    grabbActive: boolean;
    disableStartGrabb: boolean;
    hasInvalidItems: boolean;
    queue: any[];
    queueIsEmpty: boolean;
    currentSpeed: number | null;
    effectiveSpeed: number | null;
    weighting: boolean;
    viewerWeight: number | null;
    priceWeight: number | null;
    bonusViewers: number;
    naturalCount: number;
    varianceEnabled: boolean;
    varianceTolerance: number | null;
    varianceMode: string | null;
    onStart: () => void;
    onStop: () => void;
    onTriggerGrabb: () => void;
    onSpeedChange: (delta: number) => void;
    onSpeedInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
    onWeightingChange: (enabled: boolean) => void;
    onViewerWeightChange: (e: ChangeEvent<HTMLInputElement>) => void;
    onPriceWeightChange: (e: ChangeEvent<HTMLInputElement>) => void;
    onVarianceEnabledChange: (enabled: boolean) => void;
    onVarianceToleranceChange: (e: ChangeEvent<HTMLInputElement>) => void;
    onVarianceModeChange: (mode: string) => void;
}

const mono = { fontFamily: "'Space Mono', monospace" };

const stateColor = (state: string) => {
    switch (state) {
        case "ACTIVE": return "#4caf50";
        case "GRABBED": return "#ff9800";
        case "PAUSED": return "#9e9e9e";
        case "LOADING": return "#03a9f4";
        case "TRANSITIONING": return "#2196f3";
        case "IDLE": return "#607d8b";
        case "STOPPED": return "#f44336";
        default: return "#9e9e9e";
    }
};

function StatRow({ label, value, accent = false }: { label: string; value: string | number; accent?: boolean }) {
    return (
        <Box display="flex" justifyContent="space-between" alignItems="baseline">
            <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: "0.06em", textTransform: "uppercase", fontSize: "0.65rem" }}>
                {label}
            </Typography>
            <Typography variant="body2" sx={{ ...mono, color: accent ? "primary.main" : "text.primary", fontWeight: accent ? 700 : 400 }}>
                {value}
            </Typography>
        </Box>
    );
}

function PriceCard({ currentPrice, activeProduct, dropperStatus }: Pick<GrabbControlCardsProps, "currentPrice" | "activeProduct" | "dropperStatus">) {
    const data = dropperStatus?.data;
    const state = data?.currentState ?? "—";
    const dot = stateColor(state);

    return (
        <Card variant="outlined" sx={{ height: "100%", position: "relative", overflow: "hidden" }}>
            <Box sx={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, backgroundColor: dot, transition: "background-color 0.4s" }} />
            <CardContent sx={{ pt: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                    <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: "0.12em" }}>Current Price</Typography>
                    <Box display="flex" alignItems="center" gap={0.75}>
                        <Box sx={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: dot, boxShadow: `0 0 6px ${dot}` }} />
                        <Typography variant="caption" sx={{ ...mono, color: "text.secondary" }}>{state}</Typography>
                    </Box>
                </Box>

                <Typography variant="h2" sx={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, lineHeight: 1, mb: 1 }}>
                    {currentPrice != null ? currentPrice.toLocaleString("en-US", { style: "currency", currency: "USD" }) : "—"}
                </Typography>

                <Typography variant="body2" color="text.secondary" mb={2}>
                    Retail: {activeProduct?.retailPrice != null
                        ? activeProduct.retailPrice.toLocaleString("en-US", { style: "currency", currency: "USD" })
                        : "—"}
                </Typography>

                <Divider sx={{ mb: 2 }} />

                <Stack spacing={1}>
                    <StatRow label="Varied Floor" value={data?.variedStoppingPrice != null ? `$${data.variedStoppingPrice.toFixed(2)}` : "—"} />
                    <StatRow label="Hard Floor" value={data?.floorPrice != null ? `$${data.floorPrice.toFixed(2)}` : "—"} accent />
                </Stack>
            </CardContent>
        </Card>
    );
}

function InventoryCard({ dropperStatus }: Pick<GrabbControlCardsProps, "dropperStatus">) {
    const data = dropperStatus?.data;

    // quantityRemaining — units left to sell in the current run (source of truth)
    const remaining = data?.quantityRemaining ?? null;
    // quantityStart — how many units this run started with (stock bar denominator)
    const start = data?.quantityStart ?? null;
    // currentInventory — total product inventory across all runs (informational)
    const totalInventory = data?.currentInventory ?? null;

    const pct = remaining != null && start != null && start > 0
        ? Math.min(100, (remaining / start) * 100)
        : 0;

    const barColor = pct > 50 ? "#4caf50" : pct > 20 ? "#ff9800" : "#f44336";

    return (
        <Card variant="outlined" sx={{ height: "100%" }}>
            <CardContent>
                <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: "0.12em" }}>
                    Run Inventory
                </Typography>
                <Typography variant="h2" sx={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, lineHeight: 1.1, mt: 0.5, mb: 0.5 }}>
                    {remaining ?? "—"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    of {start ?? "—"} units remaining this run
                </Typography>

                <Box sx={{ mt: 2, height: 6, borderRadius: 3, backgroundColor: "action.hover", overflow: "hidden" }}>
                    <Box sx={{
                        height: "100%",
                        width: `${pct}%`,
                        borderRadius: 3,
                        backgroundColor: barColor,
                        transition: "width 0.6s ease, background-color 0.4s",
                    }} />
                </Box>

                <Divider sx={{ my: 1.5 }} />

                <StatRow label="Total inventory" value={totalInventory ?? "—"} />
            </CardContent>
        </Card>
    );
}

function ActionsCard({
    grabbActive, disableStartGrabb, hasInvalidItems, queue, queueIsEmpty,
    onStart, onStop, onTriggerGrabb
}: Pick<GrabbControlCardsProps, "grabbActive" | "disableStartGrabb" | "hasInvalidItems" | "queue" | "queueIsEmpty" | "onStart" | "onStop" | "onTriggerGrabb">) {
    return (
        <Card variant="outlined" sx={{ height: "100%" }}>
            <CardContent>
                <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: "0.12em" }}>Actions</Typography>

                <Box mt={2} display="flex" flexDirection="column" gap={1.5}>
                    {grabbActive ? (
                        <>
                            <Button fullWidth variant="contained" color="error" startIcon={<Stop />} onClick={onStop}
                                sx={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, py: 1.2 }}>
                                Stop Grabb
                            </Button>
                            <Button fullWidth variant="outlined" startIcon={<FlashOn />} onClick={onTriggerGrabb}
                                sx={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, py: 1.2 }}>
                                Trigger Grabb
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button fullWidth variant="contained" color="success" startIcon={<PlayArrow />}
                                disabled={disableStartGrabb} onClick={onStart}
                                sx={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, py: 1.2 }}>
                                Start Grabb
                            </Button>
                            {hasInvalidItems && (
                                <Typography variant="caption" color="error" textAlign="center">
                                    ⚠️ Some queued products are missing Stripe IDs
                                </Typography>
                            )}
                        </>
                    )}
                </Box>

                <Box mt={2} pt={2} borderTop="1px solid" borderColor="divider">
                    {queueIsEmpty ? (
                        <Typography variant="caption" color="error" sx={{ ...mono }}>Queue empty</Typography>
                    ) : (() => {
                        const activeCount = queue?.filter((q: any) => q.values?.isActive).length ?? 0;
                        const waitingCount = (queue?.length ?? 0) - activeCount;
                        return (
                            <Box display="flex" flexDirection="column" gap={0.5}>
                                {activeCount > 0 && (
                                    <Typography variant="caption" sx={{ ...mono, color: "#4caf50" }}>
                                        ● {activeCount} active
                                    </Typography>
                                )}
                                <Typography variant="caption" color="text.secondary" sx={{ ...mono }}>
                                    {waitingCount} waiting
                                </Typography>
                            </Box>
                        );
                    })()}
                </Box>
            </CardContent>
        </Card>
    );
}

function SpeedCard({ currentSpeed, effectiveSpeed, onSpeedChange, onSpeedInputChange }:
    Pick<GrabbControlCardsProps, "currentSpeed" | "effectiveSpeed" | "onSpeedChange" | "onSpeedInputChange">) {
    return (
        <Card variant="outlined" sx={{ height: "100%" }}>
            <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                    <Speed fontSize="small" color="action" />
                    <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: "0.12em" }}>Dropp Speed</Typography>
                </Box>
                <Typography variant="caption" color="text.secondary">¢ per second</Typography>

                <Box mt={2.5} mb={1.5}>
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", fontSize: "0.65rem", letterSpacing: "0.06em" }}>
                        Base Rate
                    </Typography>
                    <Box display="flex" alignItems="center" justifyContent="center" gap={1} mt={0.5}>
                        <IconButton size="small" onClick={() => onSpeedChange(-0.1)} sx={{ border: "1px solid", borderColor: "divider" }}>
                            <Remove fontSize="small" />
                        </IconButton>
                        <Input value={currentSpeed ?? 0} onChange={onSpeedInputChange} disableUnderline
                            inputProps={{ type: "number", min: 0.1, step: 0.1, style: { textAlign: "center", width: 60, ...mono, fontSize: "1.1rem" } }} />
                        <IconButton size="small" onClick={() => onSpeedChange(0.1)} sx={{ border: "1px solid", borderColor: "divider" }}>
                            <Add fontSize="small" />
                        </IconButton>
                    </Box>
                </Box>

                <Divider sx={{ my: 1.5 }} />
                <StatRow label="Effective" value={effectiveSpeed != null ? `$${(effectiveSpeed / 100).toFixed(3)}/s` : "—"} accent />
            </CardContent>
        </Card>
    );
}

function WeightsCard({ weighting, viewerWeight, priceWeight, onWeightingChange, onViewerWeightChange, onPriceWeightChange }:
    Pick<GrabbControlCardsProps, "weighting" | "viewerWeight" | "priceWeight" | "onWeightingChange" | "onViewerWeightChange" | "onPriceWeightChange">) {
    return (
        <Card variant="outlined" sx={{ height: "100%" }}>
            <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                    <FitnessCenter fontSize="small" color="action" />
                    <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: "0.12em" }}>Speed Weights</Typography>
                </Box>

                <FormControlLabel sx={{ mt: 1, mb: 1.5 }}
                    control={<Switch checked={!!weighting} size="small" onChange={(e) => onWeightingChange(e.target.checked)} />}
                    label={<Typography variant="caption" color={weighting ? "text.primary" : "text.secondary"}>
                        {weighting ? "Weights active" : "Weights disabled"}
                    </Typography>}
                />

                <Stack spacing={1.5}>
                    <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", fontSize: "0.65rem", letterSpacing: "0.06em" }}>
                            Viewer influence %
                        </Typography>
                        <Input fullWidth disabled={!weighting} value={viewerWeight ? viewerWeight * 100 : 0}
                            onChange={onViewerWeightChange} disableUnderline={false}
                            inputProps={{ step: 0.1, min: 0, max: 100, type: "number", style: { ...mono } }} />
                    </Box>
                    <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", fontSize: "0.65rem", letterSpacing: "0.06em" }}>
                            Price ratio influence %
                        </Typography>
                        <Input fullWidth disabled={!weighting} value={priceWeight ? priceWeight * 100 : 0}
                            onChange={onPriceWeightChange} disableUnderline={false}
                            inputProps={{ step: 0.1, min: 0, max: 500, type: "number", style: { ...mono } }} />
                    </Box>
                </Stack>
            </CardContent>
        </Card>
    );
}

function ViewersCard({ bonusViewers, naturalCount }: Pick<GrabbControlCardsProps, "bonusViewers" | "naturalCount">) {
    const total = naturalCount + bonusViewers;
    return (
        <Card variant="outlined" sx={{ height: "100%" }}>
            <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <RemoveRedEye fontSize="small" color="action" />
                    <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: "0.12em" }}>Viewers</Typography>
                </Box>
                <Typography variant="h3" sx={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, lineHeight: 1, mb: 0.5 }}>{total}</Typography>
                <Typography variant="caption" color="text.secondary" mb={2} display="block">total watching</Typography>
                <Divider sx={{ my: 1.5 }} />
                <Stack spacing={1}>
                    <StatRow label="Natural" value={naturalCount} />
                    <StatRow label="Bonus" value={bonusViewers} />
                </Stack>
            </CardContent>
        </Card>
    );
}

function VarianceCard({ varianceEnabled, varianceTolerance, varianceMode, onVarianceEnabledChange, onVarianceToleranceChange, onVarianceModeChange }:
    Pick<GrabbControlCardsProps, "varianceEnabled" | "varianceTolerance" | "varianceMode" | "onVarianceEnabledChange" | "onVarianceToleranceChange" | "onVarianceModeChange">) {
    return (
        <Card variant="outlined" sx={{ height: "100%" }}>
            <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                    <Tune fontSize="small" color="action" />
                    <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: "0.12em" }}>Price Variance</Typography>
                </Box>

                <FormControlLabel sx={{ mt: 1, mb: 1.5 }}
                    control={<Switch checked={!!varianceEnabled} size="small" onChange={(e) => onVarianceEnabledChange(e.target.checked)} />}
                    label={<Typography variant="caption" color={varianceEnabled ? "text.primary" : "text.secondary"}>
                        {varianceEnabled ? "Variance active" : "Variance off"}
                    </Typography>}
                />

                <Stack spacing={1.5}>
                    <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", fontSize: "0.65rem", letterSpacing: "0.06em" }}>
                            Tolerance (¢)
                        </Typography>
                        <Input fullWidth value={varianceTolerance ?? 0} onChange={onVarianceToleranceChange}
                            disableUnderline={false} inputProps={{ type: "number", step: 0.01, min: 0, style: { ...mono } }} />
                    </Box>
                    <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", fontSize: "0.65rem", letterSpacing: "0.06em" }}>
                            Mode
                        </Typography>
                        <Box component="select" value={varianceMode ?? "random"} onChange={(e: any) => onVarianceModeChange(e.target.value)}
                            sx={{ mt: 0.5, width: "100%", backgroundColor: "transparent", border: "none", borderBottom: "1px solid",
                                borderColor: "divider", color: "text.primary", pb: 0.5, ...mono, fontSize: "0.875rem",
                                cursor: "pointer", outline: "none", "&:hover": { borderColor: "text.primary" } }}>
                            <option value="random">Random</option>
                            <option value="sinusoidal">Sinusoidal</option>
                            <option value="fixed">Fixed Offset</option>
                            <option value="step">Step</option>
                            <option value="drift">Drift</option>
                        </Box>
                    </Box>
                </Stack>
            </CardContent>
        </Card>
    );
}

export function GrabbControlCards(props: GrabbControlCardsProps) {
    return (
        <>
            <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid item xs={12} sm={5}>
                    <PriceCard currentPrice={props.currentPrice} activeProduct={props.activeProduct} dropperStatus={props.dropperStatus} />
                </Grid>
                <Grid item xs={12} sm={3}>
                    <InventoryCard dropperStatus={props.dropperStatus} />
                </Grid>
                <Grid item xs={12} sm={4}>
                    <ActionsCard grabbActive={props.grabbActive} disableStartGrabb={props.disableStartGrabb}
                        hasInvalidItems={props.hasInvalidItems} queue={props.queue} queueIsEmpty={props.queueIsEmpty}
                        onStart={props.onStart} onStop={props.onStop} onTriggerGrabb={props.onTriggerGrabb} />
                </Grid>
            </Grid>

            <Grid container spacing={2} sx={{ mt: 0 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <SpeedCard currentSpeed={props.currentSpeed} effectiveSpeed={props.effectiveSpeed}
                        onSpeedChange={props.onSpeedChange} onSpeedInputChange={props.onSpeedInputChange} />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <WeightsCard weighting={props.weighting} viewerWeight={props.viewerWeight} priceWeight={props.priceWeight}
                        onWeightingChange={props.onWeightingChange} onViewerWeightChange={props.onViewerWeightChange}
                        onPriceWeightChange={props.onPriceWeightChange} />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <ViewersCard bonusViewers={props.bonusViewers} naturalCount={props.naturalCount} />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <VarianceCard varianceEnabled={props.varianceEnabled} varianceTolerance={props.varianceTolerance}
                        varianceMode={props.varianceMode} onVarianceEnabledChange={props.onVarianceEnabledChange}
                        onVarianceToleranceChange={props.onVarianceToleranceChange} onVarianceModeChange={props.onVarianceModeChange} />
                </Grid>
            </Grid>
        </>
    );
}
