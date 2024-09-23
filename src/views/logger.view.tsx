import React, { useEffect, useState } from "react";
import {
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Container,
    Grid,
    Typography,
    Paper,
    TextField
} from "@mui/material";
import { useSnackbarController } from "firecms";
import axios from "axios";

// Log Interface
interface LogEntry {
    timestamp: string;
    type: string;
    message: string;
    process_id: number;
    app_name?: string;
}

const LOG_ENDPOINT = import.meta.env.VITE_LOGGER_ENDPOINT;

// Custom Logger Dashboard Component
export const LoggerDashboardView = () => {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');  // Sort order state
    const snackbarController = useSnackbarController();

    // Fetch logs from the backend
    const fetchLogs = async () => {
        try {
            setLoading(true);
            const response = await axios.get(LOG_ENDPOINT, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const logsData = response.data;
            setLogs(logsData);
            filterAndSortLogs(logsData, searchQuery, sortOrder);  // Filter and sort logs
            setLoading(false);
        } catch (error: any) {
            console.error("Axios Config:", error.config);
            console.error("Response Data:", error.response?.data || error.message);
            snackbarController.open({
                type: "error",
                message: error.response?.data?.message || "Error fetching logs"
            });
            setLoading(false);
        }
    };

    // Sort logs by date
    const sortLogs = (logs: LogEntry[], order: 'newest' | 'oldest') => {
        return logs.sort((a, b) => {
            const dateA = new Date(a.timestamp).getTime();
            const dateB = new Date(b.timestamp).getTime();
            return order === 'newest' ? dateB - dateA : dateA - dateB;
        });
    };

    // Handle sorting toggle
    const toggleSortOrder = () => {
        const newOrder = sortOrder === 'newest' ? 'oldest' : 'newest';
        setSortOrder(newOrder);
        filterAndSortLogs(logs, searchQuery, newOrder);  // Filter and sort logs when toggling sort order
    };

    // Handle search query changes
    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        const query = event.target.value.toLowerCase();
        setSearchQuery(query);
        filterAndSortLogs(logs, query, sortOrder);  // Filter and sort logs when searching
    };

    // Filter and sort logs based on search query and sort order
    const filterAndSortLogs = (logs: LogEntry[], query: string, order: 'newest' | 'oldest') => {
        const filtered = logs.filter((log) =>
            log.message.toLowerCase().includes(query) ||
            log.type.toLowerCase().includes(query)
        );
        const sortedFilteredLogs = sortLogs(filtered, order);
        setFilteredLogs(sortedFilteredLogs);
    };

    useEffect(() => {
        fetchLogs(); // Fetch logs when the component is mounted
    }, []);

    return (
        <Container>
            <Grid container spacing={4} justifyContent="space-around" alignItems="center">
                <Grid item >
                    <Typography variant="h4">Log Dashboard</Typography>
                </Grid>

                {/* Search bar */}
                <Grid item xs={12}>
                    <TextField
                        label="Search Logs"
                        variant="outlined"
                        fullWidth
                        value={searchQuery}
                        onChange={handleSearch}
                        placeholder="Search by message or type..."
                    />
                </Grid>

                {/* Sort Order Toggle Button */}
                <Grid item>
                    <Button
                        variant="outlined"
                        onClick={toggleSortOrder}
                    >
                        Sorted by {sortOrder === 'newest' ? 'Newest' : 'Oldest'}
                    </Button>
                </Grid>

                {/* Refresh Logs Button */}
                <Grid item xs={12} sm={6}>
                    <Grid container spacing={4} justifyContent="flex-end">
                        <Grid item>
                            <Button variant="contained" color="primary" onClick={fetchLogs}>
                                Refresh Logs
                            </Button>
                        </Grid>
                    </Grid>
                </Grid>

                {/* Log Display */}
                <Grid item xs={12}>
                    <Paper variant="outlined">
                        {loading ? (
                            <Box display="flex" justifyContent="center" alignItems="center">
                                <CircularProgress />
                            </Box>
                        ) : (
                            <Box p={3}>
                                {filteredLogs.length > 0 ? (
                                    filteredLogs.map((log: LogEntry, index: number) => (
                                        <Card
                                            key={index}
                                            sx={{
                                                marginBottom: 2,
                                                borderLeft: `4px solid ${getLogTypeColor(log.type)}`
                                            }}
                                        >
                                            <CardContent>
                                                <Typography variant="subtitle1">
                                                    {new Date(log.timestamp).toLocaleString()}
                                                </Typography>
                                                <Typography variant="h6">
                                                    {log.type.toUpperCase()} - {log.message}
                                                </Typography>
                                                <Typography variant="caption">
                                                    Process ID: {log.process_id}, App: {log.app_name}
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    ))
                                ) : (
                                    <Typography>No logs available.</Typography>
                                )}
                            </Box>
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

// Helper function to get color based on log type
const getLogTypeColor = (type: string): string => {
    switch (type.toLowerCase()) {
        case 'err':
            return 'red';
        case 'out':
            return 'lightgray';
        default:
            return 'blue'; // Default color for unknown types
    }
};
