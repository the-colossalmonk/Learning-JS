# Phase 4, Project 2: Live Animated Bar Chart from JSON

This project is a dynamic and reusable live bar chart component built entirely with vanilla JavaScript and the HTML Canvas API. The chart initializes its structure and starting values from a local JSON file, then simulates a real-time data feed by continuously updating with new random values. Each change is animated smoothly, making the chart feel like a live monitoring tool.

## Live Demo

**(Link to your deployed project would go here)**

## Features

-   **Data-Driven from JSON:** The chart's initial configuration (title, labels, starting values, color) is loaded asynchronously from a `data.json` file using `fetch`.
-   **Live Data Simulation:** A `setInterval` loop continuously feeds new random data to the chart, simulating a live, real-time data source.
-   **Perpetual Animation Loop:** The chart uses `requestAnimationFrame` to run a continuous render loop, ensuring all visual updates are smooth and performant.
-   **Smooth Easing Animation:** When data values change, the bars don't just snap to their new height. They animate smoothly using an easing (interpolation) formula, creating a fluid and professional visual effect.
-   **Fully Responsive:** The canvas chart is built to be responsive. It uses a `ResizeObserver` to automatically redraw itself to fit its container's dimensions perfectly.
-   **Interactive Tooltips:** Hovering over a bar displays a tooltip with its precise label and current value.

## Technologies Used

-   **HTML5:** For the `<canvas>` element and page structure.
-   **CSS3:** For modern styling of the chart container and tooltip.
-   **Vanilla JavaScript (ES6+):** For all application logic, including the rendering engine, animation loop, and data simulation.

## Core JavaScript Concepts Showcased

This project is a deep dive into creating data visualizations from scratch, with a strong focus on animation principles and performance.

#### 1. `requestAnimationFrame` for a Perpetual Render Loop

The heart of the application is a continuous animation loop. Instead of only animating once, `requestAnimationFrame` is used to create a perpetual "game loop" that redraws the entire chart on every frame. This is the foundation of any high-performance animation or real-time visualization.

**Example: The animation loop (`script.js`)**
```javascript
function animationLoop() {
    // 1. Clear the canvas for the new frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 2. Animate the state (move current values closer to target values)
    chartState.forEach(bar => { /* ... easing logic ... */ });

    // 3. Draw the chart with the new, interpolated values
    drawChart();

    // 4. Request the next frame to continue the loop
    requestAnimationFrame(animationLoop);
}
```

#### 2. Decoupled State Animation (Data vs. Visuals)

A key architectural pattern in this project is the separation of the data state from the visual state.
-   A **`setInterval`** loop is responsible for updating the *target data* (the `targetValue` for each bar). It acts like a real-time data feed.
-   The **`requestAnimationFrame`** loop is responsible for the *visuals*. It smoothly animates the `currentValue` of each bar until it reaches the `targetValue`.

This decoupling means the data can update at any time, and the animation will always gracefully catch up, which is a robust pattern for building live data visualizations.

**Example: The two separate states for a bar (`script.js`)**
```javascript
// State for a single bar
const bar = {
    label: 'Q1',
    targetValue: 850,    // The "real" data from the feed
    currentValue: 350.25 // The value being drawn on this frame
};

// In the animation loop, currentValue is moved closer to targetValue
bar.currentValue += (bar.targetValue - bar.currentValue) * 0.08;
```

#### 3. `ResizeObserver` for a Responsive Canvas

To ensure the canvas chart is fully responsive, a `ResizeObserver` is used. This modern API efficiently detects when the chart's container element changes size and automatically updates the `<canvas>` element's `width` and `height` attributes to match. The perpetual render loop then takes care of redrawing the chart to fit the new dimensions.

#### 4. Asynchronous Data Loading (`fetch`)

The application's initial configuration is loaded from an external `data.json` file. This is handled using the `fetch` API with `async/await` syntax, demonstrating how to initialize a component with asynchronous data.

## How to Run

1.  Save the three files (`index.html`, `style.css`, `data.json`, and `script.js`) in the same folder.
2.  **Important:** Because this project uses `fetch()` to load a local file, you must serve it from a local web server. You cannot just open `index.html` directly from your file system due to browser security policies. A simple way to do this is with the "Live Server" extension in VS Code.
3.  Once served, open the local server address (e.g., `http://127.0.0.1:5500`) in your web browser. The chart will load and begin animating.