export async function fetchDropperStatus() {
    const url = import.meta.env.VITE_DROPSERVER + "/status";
    const headers = {
        "Authorization": `Bearer ${import.meta.env.VITE_FUNCTION_DROPP_KEY}`
    };

    try {
        const response = await fetch(url, { method: "GET", headers });
        if (!response.ok) {
            const text = await response.text();
            return {
                error: true,
                message: `HTTP ${response.status} ${response.statusText}`,
                body: text
            };
        }

        const data = await response.json();
        return { error: false, data };
    } catch (err: any) {
        return {
            error: true,
            message: err.message || "Unknown fetch error"
        };
    }
}
