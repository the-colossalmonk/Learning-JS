# Phase 3, Project 5: Crypto Market Dashboard

This is a dynamic, data-driven cryptocurrency dashboard that provides market insights in two distinct, user-selectable views: a beginner-friendly "Card View" and a data-dense "Heatmap View." The application fetches live data from the public CoinGecko API and uses Web Workers to handle data polling in the background, ensuring a smooth and responsive user interface.

## Live Demo

**(Link to your deployed project would go here)**

## Features

-   **Dual View Modes:**
    -   **Card View:** A clean, intuitive layout perfect for beginners. Each asset is displayed on its own card with its name, logo, live price, 24-hour price change, and an educational tooltip.
    -   **Heatmap View:** An expert-level view that visualizes the 24-hour performance of multiple assets at a glance, with color intensity representing the magnitude of the price change.
-   **Live Data from Public API:** Fetches real-time market data from the free and popular CoinGecko API.
-   **Performant Background Polling:** Uses a **Web Worker** to fetch market data on a 60-second interval, preventing any API latency from freezing the main UI thread.
-   **Custom SVG Sparklines:** The Card View features custom-built SVG line charts that visualize the 7-day price trend for each asset, generated entirely in vanilla JavaScript.
-   **Educational Tooltips:** In Card View, users can hover over an info icon to get a beginner-friendly description of each cryptocurrency, fetched on-demand from the API.
-   **Interactive UI:** The interface provides clear visual feedback, with color-coded price changes and interactive tooltips.

## Technologies Used

-   **HTML5:** For semantic structure and layout, including the use of `<template>` for efficient DOM cloning.
-   **CSS3:** For styling and visual feedback, including:
    -   CSS Grid for responsive dashboard layouts.
    -   CSS Variables for a clean, modern color scheme.
    -   Smooth transitions and hover effects.
-   **Vanilla JavaScript (ES6+):** For all application logic, including:
    -   **Web Workers** for background API polling.
    -   **`async/await`** for handling `fetch()` Promises.
    -   Dynamic DOM Manipulation.
    -   Dynamic SVG generation.

## Core JavaScript Concepts Showcased

This project demonstrates a robust architecture for building modern, data-driven web applications.

#### 1. Web Workers for Performant Asynchronous Tasks

To ensure the user interface remains fast and responsive, all API calls are offloaded from the main thread to a Web Worker. The worker runs on a `setInterval` loop, fetches the data, and uses `postMessage` to send the results back to the main thread, which then updates the UI. This is a professional pattern for handling recurring background tasks like data polling.

**Main Script (`script.js`):**
```javascript
// 1. Create the worker
const dataWorker = new Worker('worker.js', { type: 'module' });

// 2. Listen for messages (data) from the worker
dataWorker.onmessage = (e) => {
    const { status, data } = e.data;
    if (status === 'success' && data) {
        // 3. Update the UI with the fresh data
        renderCardDashboard(data);
    }
};

// 4. Start polling and set it to repeat
function pollData() {
    dataWorker.postMessage({ command: 'fetch', assets: trackedAssets });
}
setInterval(pollData, 60000); // Poll every 60 seconds
```

**Worker Script (`worker.js`):**
```javascript
import { coinGeckoApi } from './api.js';

self.onmessage = async function(e) {
    // 1. Receive command from the main thread
    const { command, assets } = e.data;
    if (command === 'fetch') {
        // 2. Perform the async task (API call)
        const marketData = await coinGeckoApi.fetchMarketData(assets);
        // 3. Post the result back to the main thread
        self.postMessage({ status: 'success', data: marketData });
    }
};
```

#### 2. Data-Driven UI Rendering

The application has two distinct rendering functions, `renderCardDashboard()` and `renderHeatmap()`, which are called depending on the currently selected `viewMode`. Both functions take the same array of data from the API and transform it into a completely different visual representation, demonstrating the power of separating data from presentation.

#### 3. Dynamic SVG Chart Generation

The sparkline chart in the Card View is not from a library. It's an `<svg>` element that is dynamically controlled by JavaScript. A `renderSparkline` function takes an array of 7-day price data, calculates the coordinates, and generates the `points` attribute for an SVG `<polyline>` to draw the chart. The line is even color-coded based on the asset's performance.

**Example: Generating the SVG path (`script.js`)**

```javascript
function renderSparkline(svg, priceData, changeClass) {
    // ... calculate scales and dimensions ...

    // Map each data point to an "x,y" coordinate string
    const points = priceData.map((price, index) => {
        const x = (index / (priceData.length - 1)) * width;
        const y = height - ((price - minPrice) / priceRange) * (height - padding*2);
        return `${x},${y}`;
    }).join(' ');

    // Create the SVG element and set its attributes
    const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
    polyline.setAttribute('points', points);
    polyline.classList.add('sparkline', changeClass);
    svg.appendChild(polyline);
}
```

## How to Run Locally

1.  Clone this repository or save the `index.html`, `style.css`, `script.js`, and `api.js` files to a single folder.
2.  **Important:** To use Web Workers, you must serve the files from a local web server. You cannot just open `index.html` directly from your file system. A simple way to do this is with the "Live Server" extension in VS Code.
3.  Once served, open the local server address (e.g., `http://127.0.0.1:5500`) in your web browser.

The dashboard will load with a default set of cryptocurrencies and begin fetching data immediately.