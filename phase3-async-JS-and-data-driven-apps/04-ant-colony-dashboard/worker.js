// --- worker.js ---

// This is a "mock" API. In a real app, this would be a fetch call.
const mockColonyApi = {
    fetchNurseryData: () => ({
        population: Math.floor(Math.random() * 50) + 100, // 100-150
        foodLevel: Math.floor(Math.random() * 20) + 80, // 80-100
    }),
    fetchFoodStoresData: () => ({
        population: Math.floor(Math.random() * 20) + 10, // 10-30
        foodLevel: Math.floor(Math.random() * 300) + 500, // 500-800
    }),
    fetchQueenChamberData: () => ({
        population: 1,
        foodLevel: Math.floor(Math.random() * 10) + 90, // 90-100
    }),
};

let intervalId = null;

// Listen for messages from the main script
self.onmessage = function(e) {
    const { command, widget } = e.data;

    if (command === 'start') {
        // Clear any existing interval before starting a new one
        if (intervalId) clearInterval(intervalId);

        // Immediately fetch data once, then start the interval
        fetchData(widget);
        intervalId = setInterval(() => fetchData(widget), widget.interval * 1000);
    } else if (command === 'stop') {
        clearInterval(intervalId);
        intervalId = null;
    }
};

// Function to fetch data and send it back to the main script
function fetchData(widget) {
    let data;
    try {
        switch (widget.type) {
            case 'nursery':
                data = mockColonyApi.fetchNurseryData();
                break;
            case 'foodStore':
                data = mockColonyApi.fetchFoodStoresData();
                break;
            case 'queenChamber':
                data = mockColonyApi.fetchQueenChamberData();
                break;
            default:
                throw new Error('Unknown chamber type');
        }
        // Send the successful data back to the main thread
        self.postMessage({ status: 'success', widgetId: widget.id, data });
    } catch (error) {
        // Send an error message back to the main thread
        self.postMessage({ status: 'error', widgetId: widget.id, error: error.message });
    }
}