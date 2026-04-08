// ─── GrabbQueue.tsx ───────────────────────────────────────────────────────────
// Horizontal scrolling queue display for the Grabb Control Center.
// Active entry is filtered out (shown in control cards above).
// Click a card to open the FireCMS side panel.
// Hover to reveal delete button.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    IconButton,
    Skeleton,
    Tooltip,
    Typography,
} from "@mui/material";
import {
    Add,
    Delete,
    Inventory2,
} from "@mui/icons-material";

// ─── Types ────────────────────────────────────────────────────────────────────

interface QueueEntry {
    id: string;
    values: {
        product?: { id: string; path: string };
        quantity?: number;
        stripe_id?: string;
        originType?: string;
        isActive?: boolean;
        slug?: string;
        createdAt?: any;
    };
    [key: string]: any;
}

interface GrabbQueueProps {
    queue: QueueEntry[];
    dropperStatus: any;
    productNames?: Record<string, string>;
    onDeleteEntry?: (id: string) => void;
    onAddEntry?: () => void;
    onOpenEntry?: (id: string) => void;
    loading?: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const mono = { fontFamily: "'Space Mono', monospace" };

const originConfig = (originType?: string) => {
    switch (originType) {
        case "manual":              return { label: "Manual",    color: "#607d8b", icon: null };
        case "floor_requeue":       return { label: "Floor",     color: "#ff9800", icon: "⬇" };
        case "abandonment_requeue": return { label: "Abandoned", color: "#9c27b0", icon: "↩" };
        default:                    return { label: "Manual",    color: "#607d8b", icon: null };
    }
};

// ─── Waiting Card ─────────────────────────────────────────────────────────────

function WaitingCard({
    entry,
    position,
    productNames,
    onDelete,
    onOpen,
}: {
    entry: QueueEntry;
    position: number;
    productNames?: Record<string, string>;
    onDelete?: () => void;
    onOpen?: () => void;
}) {
    const [hovered, setHovered] = useState(false);
    const values = entry.values ?? {};
    const quantity = values.quantity ?? 0;
    const hasStripe = !!values.stripe_id;
    const productId = values.product?.id ?? "—";
    const displayName = productNames?.[productId] ?? productId;
    const origin = originConfig(values.originType);

    return (
        <Box
            sx={{ flexShrink: 0, width: 160, position: "relative" }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <Card
                variant="outlined"
                onClick={onOpen}
                sx={{
                    height: 160,
                    borderColor: hovered ? "primary.main" : "divider",
                    transition: "border-color 0.15s, box-shadow 0.15s",
                    boxShadow: hovered ? "0 0 0 1px rgba(255,255,255,0.08)" : "none",
                    display: "flex",
                    flexDirection: "column",
                    cursor: onOpen ? "pointer" : "default",
                }}
            >
                <CardContent sx={{
                    p: 1.5,
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    "&:last-child": { pb: 1.5 },
                }}>
                    {/* Header row */}
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Box sx={{
                            width: 20, height: 20,
                            borderRadius: "50%",
                            border: "1px solid",
                            borderColor: "divider",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                        }}>
                            <Typography variant="caption" sx={{ ...mono, fontSize: "0.55rem", color: "text.secondary", lineHeight: 1 }}>
                                {position}
                            </Typography>
                        </Box>

                        <Box display="flex" alignItems="center" gap={0.75}>
                            <Tooltip title={hasStripe ? "Stripe ID present" : "Missing Stripe ID"}>
                                <Box sx={{
                                    width: 6, height: 6, borderRadius: "50%",
                                    backgroundColor: hasStripe ? "#4caf50" : "#f44336",
                                }} />
                            </Tooltip>

                            {onDelete && (
                                <IconButton
                                    size="small"
                                    onClick={(e) => {
                                        e.stopPropagation(); // prevent card click
                                        onDelete();
                                    }}
                                    sx={{
                                        opacity: hovered ? 1 : 0,
                                        transition: "opacity 0.15s",
                                        p: 0.25,
                                        color: "text.disabled",
                                        "&:hover": { color: "error.main" },
                                    }}
                                >
                                    <Delete sx={{ fontSize: 12 }} />
                                </IconButton>
                            )}
                        </Box>
                    </Box>

                    {/* Product name */}
                    <Typography variant="caption" sx={{
                        fontSize: "0.7rem",
                        fontWeight: 600,
                        color: "text.primary",
                        display: "block",
                        mb: 0.25,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                    }}>
                        {displayName}
                    </Typography>

                    {/* Product ID — smaller, dimmer */}
                    <Typography variant="caption" sx={{
                        ...mono,
                        fontSize: "0.55rem",
                        color: "text.disabled",
                        display: "block",
                        mb: 0.5,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                    }}>
                        {productId}
                    </Typography>

                    {/* Quantity */}
                    <Box flex={1} display="flex" alignItems="center" justifyContent="center" flexDirection="column">
                        <Typography variant="h3" sx={{
                            fontFamily: "'Space Grotesk', sans-serif",
                            fontWeight: 700,
                            lineHeight: 1,
                            color: quantity > 0 ? "text.primary" : "text.disabled",
                        }}>
                            {quantity}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.6rem", mt: 0.25 }}>
                            units
                        </Typography>
                    </Box>

                    {/* Origin badge */}
                    <Box mt={1}>
                        <Chip
                            size="small"
                            label={`${origin.icon ? origin.icon + " " : ""}${origin.label}`}
                            sx={{
                                height: 18,
                                fontSize: "0.55rem",
                                fontFamily: "'Space Mono', monospace",
                                backgroundColor: `${origin.color}18`,
                                color: origin.color,
                                border: `1px solid ${origin.color}40`,
                                "& .MuiChip-label": { px: 0.75 },
                            }}
                        />
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
}

// ─── Add Card ─────────────────────────────────────────────────────────────────

function AddCard({ onAdd }: { onAdd: () => void }) {
    const [hovered, setHovered] = useState(false);

    return (
        <Box
            sx={{ flexShrink: 0, width: 160 }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <Card
                variant="outlined"
                onClick={onAdd}
                sx={{
                    height: 160,
                    borderStyle: "dashed",
                    borderColor: hovered ? "primary.main" : "divider",
                    backgroundColor: hovered ? "action.hover" : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "column",
                    gap: 1,
                    cursor: "pointer",
                    transition: "border-color 0.15s, background-color 0.15s",
                }}
            >
                <Box sx={{
                    width: 32, height: 32,
                    borderRadius: "50%",
                    border: "1px dashed",
                    borderColor: hovered ? "primary.main" : "divider",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "border-color 0.15s",
                }}>
                    <Add sx={{ fontSize: 16, color: hovered ? "primary.main" : "text.disabled" }} />
                </Box>
                <Typography variant="caption" sx={{
                    fontSize: "0.65rem",
                    color: hovered ? "primary.main" : "text.disabled",
                    transition: "color 0.15s",
                }}>
                    Add Grabb
                </Typography>
            </Card>
        </Box>
    );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyCard() {
    return (
        <Box sx={{ flexShrink: 0, width: 160 }}>
            <Card variant="outlined" sx={{
                height: 160,
                borderStyle: "dashed",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                gap: 1,
            }}>
                <Inventory2 sx={{ fontSize: 28, color: "action.disabled" }} />
                <Typography variant="caption" color="text.disabled" textAlign="center" sx={{ px: 2, fontSize: "0.65rem" }}>
                    No items waiting
                </Typography>
            </Card>
        </Box>
    );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function GrabbQueue({
    queue,
    dropperStatus,
    productNames,
    onDeleteEntry,
    onAddEntry,
    onOpenEntry,
    loading,
}: GrabbQueueProps) {
    // Filter out the active entry — its info is shown in the control cards above
    const waitingEntries = queue.filter(e => e.values?.isActive !== true);

    const totalUnits = waitingEntries.reduce((sum, e) => sum + (e.values?.quantity ?? 0), 0);
    const readyCount = waitingEntries.filter(e => !!e.values?.stripe_id).length;

    return (
        <Box sx={{ mt: 3 }}>
            {/* ── Section header ── */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                <Box display="flex" alignItems="baseline" gap={1.5}>
                    <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: "0.12em" }}>
                        Grabb Queue
                    </Typography>
                    <Typography variant="caption" color="text.disabled">
                        {waitingEntries.length} waiting · {totalUnits} units · {readyCount}/{waitingEntries.length} ready
                    </Typography>
                </Box>

                <Box display="flex" alignItems="center" gap={2}>
                    {/* Legend */}
                    <Box display="flex" gap={1.5} alignItems="center">
                        {[
                            { label: "Manual",    color: "#607d8b" },
                            { label: "Floor",     color: "#ff9800" },
                            { label: "Abandoned", color: "#9c27b0" },
                        ].map(({ label, color }) => (
                            <Box key={label} display="flex" alignItems="center" gap={0.5}>
                                <Box sx={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: color }} />
                                <Typography variant="caption" color="text.disabled" sx={{ fontSize: "0.6rem" }}>
                                    {label}
                                </Typography>
                            </Box>
                        ))}
                    </Box>

                    {/* Add button */}
                    {onAddEntry && (
                        <Button
                            size="small"
                            variant="contained"
                            startIcon={<Add />}
                            onClick={onAddEntry}
                            sx={{
                                fontFamily: "'Space Grotesk', sans-serif",
                                fontWeight: 600,
                                fontSize: "0.75rem",
                                py: 0.5,
                            }}
                        >
                            Add Grabb
                        </Button>
                    )}
                </Box>
            </Box>

            {/* ── Horizontal scroll container ── */}
            <Box sx={{
                display: "flex",
                gap: 1.5,
                overflowX: "auto",
                pb: 1.5,
                "&::-webkit-scrollbar": { height: 4 },
                "&::-webkit-scrollbar-track": { backgroundColor: "transparent" },
                "&::-webkit-scrollbar-thumb": { backgroundColor: "action.selected", borderRadius: 2 },
            }}>
                {loading ? (
                    [1, 2, 3, 4].map(i => (
                        <Box key={i} sx={{ flexShrink: 0, width: 160 }}>
                            <Skeleton variant="rounded" height={160} sx={{ borderRadius: 1 }} />
                        </Box>
                    ))
                ) : waitingEntries.length === 0 ? (
                    <EmptyCard />
                ) : (
                    waitingEntries.map((entry, index) => (
                        <WaitingCard
                            key={entry.id}
                            entry={entry}
                            position={index + 1}
                            productNames={productNames}
                            onDelete={onDeleteEntry ? () => onDeleteEntry(entry.id) : undefined}
                            onOpen={onOpenEntry ? () => onOpenEntry(entry.id) : undefined}
                        />
                    ))
                )}

                {/* Add card always at the end */}
                {onAddEntry && <AddCard onAdd={onAddEntry} />}
            </Box>
        </Box>
    );
}
