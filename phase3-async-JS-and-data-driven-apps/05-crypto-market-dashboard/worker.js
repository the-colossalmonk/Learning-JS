// --- worker.js ---

import { coinGeckoApi } from './api.js';

self.onmessage = async function(e) {
    const { command, assets } = e.data;

    if (command === 'fetch') {
        try {
            const marketData = await coinGeckoApi.fetchMarketData(assets);
            self.postMessage({ status: 'success', data: marketData });
        } catch (error) {
            self.postMessage({ status: 'error', error: error.message });
        }
    }
};