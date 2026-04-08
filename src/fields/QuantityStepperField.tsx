// ─── QuantityStepperField.tsx ─────────────────────────────────────────────────
// Custom FireCMS field for queue quantity selection.
// Shows +/- buttons, current value, and available inventory context.
// Place in src/fields/QuantityStepperField.tsx
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import { FieldProps } from "firecms";
import {
    Box,
    IconButton,
    Typography,
    CircularProgress,
} from "@mui/material";
import { Add, Remove } from "@mui/icons-material";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { dbConfig } from "../utils/firebase.utils";
import { initializeApp, getApps } from "firebase/app";

const firebaseApp = getApps().length ? getApps()[0] : initializeApp(dbConfig);
const db = getFirestore(firebaseApp);

const mono = { fontFamily: "IBM Plex Mono, monospace" };

export function QuantityStepperField({ value, setValue, customProps, context }: FieldProps<number>) {
    const [availableQty, setAvailableQty] = useState<number | null>(null);
    const [productName, setProductName] = useState<string>("");
    const [loading, setLoading] = useState(false);

    // Watch the product reference field on the same entity
    const productRef = context.values?.product;

    useEffect(() => {
        if (!productRef?.id || !productRef?.path) {
            setAvailableQty(null);
            setProductName("");
            return;
        }

        const fetchProduct = async () => {
            setLoading(true);
            try {
                const [collection, docId] = `${productRef.path}/${productRef.id}`.split("/").filter(Boolean);
                const snap = await getDoc(doc(db, collection, docId));
                if (snap.exists()) {
                    const data = snap.data();
                    const total: number = data.quantity ?? 0;
                    const queued: number = data.quantityQueued ?? 0;
                    const available = Math.max(0, total - queued);
                    setAvailableQty(available);
                    setProductName(data.name ?? docId);

                    // Default to all available units if no value set yet
                    if (!value || value === 0) {
                        setValue(available);
                    }
                }
            } catch (err) {
                console.error("QuantityStepperField: error fetching product", err);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [productRef?.id]);

    const current = value ?? 0;
    const max = availableQty ?? 0;
    const atMin = current <= 1;
    const atMax = current >= max;

    const decrement = () => {
        if (!atMin) setValue(current - 1);
    };

    const increment = () => {
        if (!atMax) setValue(current + 1);
    };

    return (
        <Box>
            <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: "0.06em", fontSize: "0.65rem" }}>
                Quantity to Queue
            </Typography>

            {loading ? (
                <Box display="flex" alignItems="center" gap={1} mt={1}>
                    <CircularProgress size={16} />
                    <Typography variant="caption" color="text.secondary">Loading inventory…</Typography>
                </Box>
            ) : availableQty === null ? (
                <Box mt={1}>
                    <Typography variant="caption" color="text.secondary">
                        Select a product first
                    </Typography>
                </Box>
            ) : (
                <>
                    <Box display="flex" alignItems="center" gap={1} mt={1}>
                        <IconButton
                            size="small"
                            onClick={decrement}
                            disabled={atMin}
                            sx={{ border: "1px solid", borderColor: "divider" }}
                        >
                            <Remove fontSize="small" />
                        </IconButton>

                        <Box
                            sx={{
                                minWidth: 64,
                                textAlign: "center",
                                border: "1px solid",
                                borderColor: "divider",
                                borderRadius: 1,
                                px: 2,
                                py: 0.75,
                            }}
                        >
                            <Typography variant="h6" sx={mono}>{current}</Typography>
                        </Box>

                        <IconButton
                            size="small"
                            onClick={increment}
                            disabled={atMax}
                            sx={{ border: "1px solid", borderColor: "divider" }}
                        >
                            <Add fontSize="small" />
                        </IconButton>
                    </Box>

                    <Box mt={1} display="flex" gap={2}>
                        <Typography variant="caption" color="text.secondary" sx={mono}>
                            {availableQty} available
                        </Typography>
                        <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ cursor: "pointer", textDecoration: "underline" }}
                            onClick={() => setValue(max)}
                        >
                            use all
                        </Typography>
                    </Box>

                    {atMax && availableQty > 0 && (
                        <Typography variant="caption" color="warning.main" display="block" mt={0.5}>
                            Maximum available selected
                        </Typography>
                    )}

                    {availableQty === 0 && (
                        <Typography variant="caption" color="error" display="block" mt={0.5}>
                            No inventory available to queue
                        </Typography>
                    )}
                </>
            )}
        </Box>
    );
}
