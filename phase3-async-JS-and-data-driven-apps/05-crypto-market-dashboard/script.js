// --- script.js ---

import { coinGeckoApi } from './api.js';

// --- State ---
const trackedAssets = ['bitcoin', 'ethereum', 'solana', 'dogecoin', 'ripple', 'cardano'];
let viewMode = 'cards'; // 'cards' or 'heatmap'

// --- DOM Elements ---
const mainContent = document.getElementById('main-content');
const cardGridContainer = document.getElementById('card-grid-container');
const heatmapContainer = document.getElementById('heatmap-container');
const viewToggle = document.getElementById('view-toggle');
const tooltip = document.getElementById('tooltip');
const assetCardTemplate = document.getElementById('asset-card-template');
const heatmapCellTemplate = document.getElementById('heatmap-cell-template');

// --- Worker Initialization ---
const dataWorker = new Worker('worker.js', { type: 'module' });
dataWorker.onmessage = handleWorkerUpdate;

function pollData() {
    dataWorker.postMessage({ command: 'fetch', assets: trackedAssets });
}

// --- Main Render Controller ---
function handleWorkerUpdate(e) {
    const { status, data } = e.data;
    if (status === 'success' && data) {
        if (viewMode === 'cards') {
            renderCardDashboard(data);
        } else {
            renderHeatmap(data);
        }
    }
}

// --- Card View Rendering ---
function renderCardDashboard(marketData) {
    cardGridContainer.innerHTML = ''; // Clear previous cards
    marketData.forEach(coin => {
        const card = assetCardTemplate.content.cloneNode(true).firstElementChild;
        const priceChange = coin.price_change_percentage_24h || 0;
        const changeClass = priceChange >= 0 ? 'positive' : 'negative';
        
        card.querySelector('.asset-icon').src = coin.image;
        card.querySelector('.asset-name').textContent = coin.name;
        card.querySelector('.asset-symbol').textContent = coin.symbol;
        card.querySelector('.asset-price').textContent = `$${coin.current_price.toLocaleString()}`;
        const changeEl = card.querySelector('.asset-change');
        changeEl.textContent = `${priceChange.toFixed(2)}%`;
        changeEl.classList.add(changeClass);

        card.querySelector('.info-icon').addEventListener('mouseover', (e) => showInfoTooltip(e, coin.id));
        card.querySelector('.info-icon').addEventListener('mouseout', hideTooltip);

        // Render sparkline
        renderSparkline(card.querySelector('.sparkline-chart'), coin.sparkline_in_7d.price, changeClass);

        cardGridContainer.appendChild(card);
    });
}

function renderSparkline(svg, priceData, changeClass) {
    const width = 120;
    const height = 40;
    const padding = 2;
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

    const maxPrice = Math.max(...priceData);
    const minPrice = Math.min(...priceData);
    const priceRange = maxPrice - minPrice;

    const points = priceData.map((price, index) => {
        const x = (index / (priceData.length - 1)) * width;
        const y = height - padding - ((price - minPrice) / priceRange) * (height - padding*2);
        return `${x},${y}`;
    }).join(' ');

    const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
    polyline.setAttribute('points', points);
    polyline.classList.add('sparkline', changeClass);
    svg.appendChild(polyline);
}

// --- Heatmap View Rendering ---
function renderHeatmap(marketData) {
    heatmapContainer.innerHTML = ''; // Clear previous cells
    marketData.forEach(coin => {
        const cell = heatmapCellTemplate.content.cloneNode(true).firstElementChild;
        const priceChange = coin.price_change_percentage_24h || 0;
        const heatLevel = Math.min(Math.floor(Math.abs(priceChange) / 1.5), 4); // 1.5% change per level
        
        cell.id = `cell-${coin.id}`;
        cell.querySelector('.asset-id').textContent = coin.symbol.toUpperCase();
        cell.querySelector('.spread-percent').textContent = `${priceChange.toFixed(2)}%`;
        cell.style.backgroundColor = priceChange >= 0 ? `var(--color-positive-bg)` : `var(--color-negative-bg)`;
        cell.style.color = priceChange >= 0 ? `var(--color-positive)` : `var(--color-negative)`;
        cell.style.border = `1px solid ${priceChange >= 0 ? 'var(--color-positive)' : 'var(--color-negative)'}`;

        cell.addEventListener('mouseover', (e) => showInfoTooltip(e, coin.id, true));
        cell.addEventListener('mouseout', hideTooltip);
        
        heatmapContainer.appendChild(cell);
    });
}

// --- Tooltip Logic ---
async function showInfoTooltip(e, coinId, isHeatmap = false) {
    const content = await coinGeckoApi.fetchCoinDescription(coinId);
    tooltip.innerHTML = content.split('. ')[0] + '.'; // Show first sentence
    tooltip.classList.remove('hidden');
    
    // Position tooltip
    const targetRect = e.target.getBoundingClientRect();
    tooltip.style.left = `${targetRect.left}px`;
    tooltip.style.top = `${targetRect.top - 10}px`;
    tooltip.style.transform = `translateY(-100%)`;
}
function hideTooltip() {
    tooltip.classList.add('hidden');
}


// --- Event Listeners ---
viewToggle.addEventListener('change', () => {
    viewMode = viewToggle.checked ? 'heatmap' : 'cards';
    mainContent.querySelector('.dashboard-grid')?.classList.toggle('hidden', viewMode === 'heatmap');
    mainContent.querySelector('.heatmap-container')?.classList.toggle('hidden', viewMode === 'cards');
    pollData(); // Re-render with the new view
});

// --- Start Application ---
pollData(); // Initial fetch
setInterval(pollData, 60000); // Refresh data every 60 seconds