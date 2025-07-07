// --- api.js ---

const API_BASE_URL = 'https://api.coingecko.com/api/v3';

/**
 * Fetches comprehensive market data for a list of coin IDs.
 * @param {string[]} coinIds - An array of coin IDs (e.g., ['bitcoin', 'ethereum']).
 * @returns {Promise<object[]>} A promise that resolves with an array of market data objects.
 */
async function fetchMarketData(coinIds) {
    if (coinIds.length === 0) return [];
    
    // The sparkline=true parameter is key for getting the 7-day chart data.
    const url = `${API_BASE_URL}/coins/markets?vs_currency=usd&ids=${coinIds.join(',')}&order=market_cap_desc&per_page=100&page=1&sparkline=true&price_change_percentage=24h`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`CoinGecko API request failed with status ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Failed to fetch market data:", error);
        return []; // Return empty array on failure
    }
}

/**
 * Fetches a simple description for a coin.
 * @param {string} coinId - The ID of the coin.
 * @returns {Promise<string>} A promise that resolves with the coin's description.
 */
async function fetchCoinDescription(coinId) {
    const url = `${API_BASE_URL}/coins/${coinId}?localization=false&tickers=false&market_data=false&community_data=false&developer_data=false`;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch coin description.');
        const data = await response.json();
        // Return only the English description, stripped of HTML tags.
        return data.description?.en.replace(/<a[^>]*>|<\/a>/g, "") || "No description available.";
    } catch (error) {
        console.error(`Failed to fetch description for ${coinId}:`, error);
        return "Description currently unavailable.";
    }
}

export const coinGeckoApi = { fetchMarketData, fetchCoinDescription };