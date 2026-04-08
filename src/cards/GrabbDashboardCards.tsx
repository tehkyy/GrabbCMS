import { useEffect, useRef, useState } from "react";
import {
    Box,
    Card,
    CardContent,
    Chip,
    Divider,
    Grid,
    Stack,
    Tooltip,
    Typography,
} from "@mui/material";
import {
    AccessTime,
    Inventory2,
    LocalFireDepartment,
    Paid,
    TrendingDown,
} from "@mui/icons-material";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Transaction {
    grabbId: string;
    type: "user" | "floor" | "triggered";
    price: string | number;
    status: "reserved" | "paid" | "abandoned" | "auto";
    userId: string | null;
    stripeSessionId: string | null;
    timestamp: string;
}

interface CurrentProduct {
    id: string;
    name?: string;
    main_image?: string;
    retailPrice?: number;
    floorPrice?: number;
    quantity?: number;
}

interface DropperStatusData {
    active: boolean;
    currentPrice: number | null;
    floorPrice: number | null;
    variedStoppingPrice: number | null;
    startingPrice: number | null;
    stoppingPrice: number | null;
    speed: number | null;
    rate: number | null;
    currentInventory: number | null;
    floorHitCount: number;
    currentState: string;
    saleStartTime: number | null;
    currentProduct: CurrentProduct | null;
}

interface DropperStatus {
    error: boolean;
    message?: string;
    data: DropperStatusData;
}

interface GrabbDashboardCardsProps {
    dropperStatus: DropperStatus | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const mono = { fontFamily: "IBM Plex Mono, monospace" };

const formatCents = (cents: string | number | null | undefined): string => {
    if (cents == null) return "—";
    const num = typeof cents === "string" ? parseFloat(cents) : cents;
    return (num / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });
};

// const formatDuration = (startMs: number | null): string => {
//     if (!startMs) return "—";
//     const elapsed = Math.floor((Date.now() - startMs) / 1000);
//     const h = Math.floor(elapsed / 3600);
//     const m = Math.floor((elapsed % 3600) / 60);
//     const s = elapsed % 60;
//     if (h > 0) return `${h}h ${m}m ${s}s`;
//     if (m > 0) return `${m}m ${s}s`;
//     return `${s}s`;
// };

const statusColor = (status: string): "default" | "success" | "warning" | "error" | "info" | "primary" => {
    switch (status) {
        case "paid": return "success";
        case "reserved": return "warning";
        case "abandoned": return "error";
        default: return "default";
    }
};

const stateColor = (state: string): string => {
    switch (state) {
        case "ACTIVE": return "#4caf50";
        case "GRABBED": return "#ff9800";
        case "TRANSITIONING": return "#2196f3";
        case "PAUSED": return "#9e9e9e";
        case "LOADING": return "#03a9f4";
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

// ─── Sparkline ────────────────────────────────────────────────────────────────

function Sparkline({ data, height = 60, color = "#4caf50" }: { data: number[]; height?: number; color?: string }) {
    if (data.length < 2) {
        return (
            <Box display="flex" alignItems="center" justifyContent="center" height={height}>
                <Typography variant="caption" color="text.secondary">Collecting data…</Typography>
            </Box>
        );
    }
    const width = 300;
    const pad = 4;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const points = data.map((v, i) => {
        const x = pad + (i / (data.length - 1)) * (width - pad * 2);
        const y = pad + ((max - v) / range) * (height - pad * 2);
        return `${x},${y}`;
    }).join(" ");
    const lastX = pad + ((data.length - 1) / (data.length - 1)) * (width - pad * 2);
    const lastY = pad + ((max - data[data.length - 1]) / range) * (height - pad * 2);

    return (
        <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} style={{ display: "block" }}>
            <polyline fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" points={points} />
            <circle cx={lastX} cy={lastY} r={3} fill={color} />
        </svg>
    );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function GrabbDashboardCards({ dropperStatus }: GrabbDashboardCardsProps) {
    // const [elapsed, setElapsed] = useState("—");
    const [priceHistory, setPriceHistory] = useState<number[]>([]);
    const [recentTransactions] = useState<Transaction[]>([]);
    const prevProductId = useRef<string | null>(null);

    const data: DropperStatusData | null = dropperStatus?.error ? null : dropperStatus?.data ?? null;

    // useEffect(() => {
    //     if (!data?.saleStartTime) return;
    //     const tick = () => setElapsed(formatDuration(data.saleStartTime));
    //     tick();
    //     const id = setInterval(tick, 1000);
    //     return () => clearInterval(id);
    // }, [data?.saleStartTime]);

    useEffect(() => {
        if (!data?.currentPrice) return;
        if (data.currentProduct?.id && data.currentProduct.id !== prevProductId.current) {
            prevProductId.current = data.currentProduct.id;
            setPriceHistory([]);
        }
        setPriceHistory(prev => {
            const next = [...prev, data.currentPrice!];
            return next.length > 120 ? next.slice(-120) : next;
        });
    }, [data?.currentPrice, data?.currentProduct?.id]);

    if (!data) {
        return (
            <Grid item xs={12} sx={{ mt: 3 }}>
                <Typography variant="body2" color="text.secondary">
                    {dropperStatus?.error ? "⚠️ SSE connection lost" : "Connecting to dropper…"}
                </Typography>
            </Grid>
        );
    }

    const product = data.currentProduct;
    const currentPriceDollars = data.currentPrice != null ? data.currentPrice : null;
    const startingPriceDollars = data.startingPrice != null ? data.startingPrice : null;
    const priceHistoryDollars = priceHistory.map(p => p);
    const priceDrop = startingPriceDollars != null && currentPriceDollars != null
        ? `${((startingPriceDollars - currentPriceDollars) / startingPriceDollars * 100).toFixed(1)}% off retail`
        : "—";

    return (
        <>
            {/* ── Section header ── */}
            <Grid item xs={12} sx={{ mt: 4, mb: 1 }}>
                <Box display="flex" alignItems="center" gap={2}>
                    <Typography variant="h5">Live Sale Analytics</Typography>
                    <Box sx={{
                        width: 10, height: 10, borderRadius: "50%",
                        backgroundColor: stateColor(data.currentState),
                        boxShadow: `0 0 8px ${stateColor(data.currentState)}`,
                        animation: data.currentState === "ACTIVE" ? "pulse 2s infinite" : "none",
                        "@keyframes pulse": { "0%, 100%": { opacity: 1 }, "50%": { opacity: 0.4 } }
                    }} />
                    <Typography variant="caption" color="text.secondary" sx={mono}>
                        {data.currentState}
                    </Typography>
                </Box>
            </Grid>

            {/* ── Row 1: Product · Stats · Sparkline ── */}
            <Grid container spacing={2} sx={{ mt: 0 }}>

                {/* Product */}
                <Grid item xs={12} md={4}>
                    <Card variant="outlined" sx={{ height: "100%" }}>
                        <CardContent>
                            <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: "0.12em" }}>
                                Current Product
                            </Typography>
                            {product ? (
                                <Box display="flex" gap={2} alignItems="flex-start" mt={1}>
                                    {product.main_image && (
                                        <Box component="img" src={product.main_image} alt={product.name ?? "Product"}
                                            sx={{ width: 80, height: 80, objectFit: "cover", borderRadius: 1, flexShrink: 0, border: "1px solid", borderColor: "divider" }}
                                        />
                                    )}
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight={600}>
                                            {product.name ?? "Unknown Product"}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" sx={mono} display="block">
                                            {product.id}
                                        </Typography>
                                        <Box mt={1}>
                                            <Chip size="small" icon={<Inventory2 fontSize="inherit" />}
                                                label={`${data.currentInventory ?? "?"} in stock`} />
                                        </Box>
                                    </Box>
                                </Box>
                            ) : (
                                <Typography variant="body2" color="text.secondary" mt={1}>No product active</Typography>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Stats */}
                <Grid item xs={12} md={4}>
                    <Card variant="outlined" sx={{ height: "100%" }}>
                        <CardContent>
                            <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: "0.12em" }}>
                                Sale Stats
                            </Typography>
                            <Stack spacing={1.5} mt={1.5}>
                                {/* <Box display="flex" justifyContent="space-between" alignItems="center">
                                    <Box display="flex" alignItems="center" gap={0.5}>
                                        <AccessTime fontSize="small" color="action" />
                                        <Typography variant="body2" color="text.secondary">Duration</Typography>
                                    </Box>
                                    <Typography variant="body2" sx={mono}>{elapsed}</Typography>
                                </Box> */}
                                <Divider />
                                <StatRow label="Floor Hits" value={data.floorHitCount} />
                                <Divider />
                                <StatRow label="Price Drop" value={priceDrop} />
                                <Divider />
                                <StatRow label="Conversion" value="—" accent />
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Sparkline */}
                <Grid item xs={12} md={4}>
                    <Card variant="outlined" sx={{ height: "100%" }}>
                        <CardContent>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: "0.12em" }}>
                                    Price History
                                </Typography>
                                <Typography variant="caption" sx={mono}>
                                    {currentPriceDollars != null
                                        ? currentPriceDollars.toLocaleString("en-US", { style: "currency", currency: "USD" })
                                        : "—"}
                                </Typography>
                            </Box>
                            <Sparkline
                                data={priceHistoryDollars}
                                height={80}
                                color={data.active ? "#4caf50" : "#9e9e9e"}
                            />
                            <Box display="flex" justifyContent="space-between" mt={1}>
                                <Typography variant="caption" color="text.secondary">
                                    Floor: {data.floorPrice != null ? `$${data.floorPrice.toFixed(2)}` : "—"}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Start: {startingPriceDollars != null
                                        ? startingPriceDollars.toLocaleString("en-US", { style: "currency", currency: "USD" })
                                        : "—"}
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* ── Row 2: Transaction feed ── */}
            <Grid container spacing={2} sx={{ mt: 0 }}>
                <Grid item xs={12}>
                    <Card variant="outlined">
                        <CardContent>
                            <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: "0.12em" }}>
                                Recent Transactions
                            </Typography>
                            {recentTransactions.length === 0 ? (
                                <Box sx={{ py: 4, display: "flex", alignItems: "center", justifyContent: "center", border: "1px dashed", borderColor: "divider", borderRadius: 1, mt: 1.5 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        COMING SOON …
                                        {/* Wire a Firestore onSnapshot listener to the active sale doc to populate this feed */}
                                    </Typography>
                                </Box>
                            ) : (
                                <Stack spacing={1} mt={1.5}>
                                    {recentTransactions.slice(-10).reverse().map((tx) => (
                                        <Box key={tx.grabbId} display="flex" alignItems="center" justifyContent="space-between"
                                            sx={{ px: 2, py: 1, borderRadius: 1, backgroundColor: "action.hover" }}>
                                            <Box display="flex" alignItems="center" gap={1}>
                                                <Chip size="small" label={tx.type} variant="outlined"
                                                    icon={tx.type === "floor" ? <LocalFireDepartment fontSize="inherit" /> : <Paid fontSize="inherit" />}
                                                />
                                                <Typography variant="body2" sx={mono}>{formatCents(tx.price)}</Typography>
                                                {tx.userId && (
                                                    <Tooltip title={tx.userId}>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {tx.userId.slice(0, 8)}…
                                                        </Typography>
                                                    </Tooltip>
                                                )}
                                            </Box>
                                            <Box display="flex" alignItems="center" gap={1}>
                                                <Chip size="small" label={tx.status} color={statusColor(tx.status)} />
                                                <Typography variant="caption" color="text.secondary" sx={mono}>
                                                    {new Date(tx.timestamp).toLocaleTimeString()}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    ))}
                                </Stack>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </>
    );
}
