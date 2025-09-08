# Phase 4 Project: Live Bento Grid Dashboard

This project is a customizable, real-time data dashboard featuring a modern Bento Grid layout. Users can drag, drop, and resize a variety of live-updating chart widgets to create a personalized monitoring tool. All layout management, chart rendering, and animation logic are built entirely from scratch in vanilla JavaScript.

This application serves as a comprehensive demonstration of advanced frontend development skills, including creating a custom layout engine, managing a high-performance animation loop, and building a persistent, data-driven user experience.

## Live Demo

**(Link to your deployed project would go here)**

![Screenshot of the Live Bento Grid Dashboard in action.](placeholder.png)
*(**Note:** You should replace `placeholder.png` with a screenshot or animated GIF of your actual project for your portfolio.)*

## Key Features

-   **Customizable Bento Grid Layout:** A modern, multi-column grid layout that is visually appealing and great for displaying a variety of data visualizations.
-   **Drag, Drop & Resize from Scratch:** The entire layout engine is custom-built. Users can intuitively move and resize widgets on the grid, with their preferences saved automatically.
-   **Multiple Live-Updating Chart Types:** The dashboard supports a variety of widgets, each rendered on a `<canvas>` element:
    -   **Line Chart:** For time-series data.
    -   **Bar Chart:** For categorical data.
    -   **Gauge Chart:** For percentage-based metrics.
    -   **KPI Card:** For displaying a single, important number.
-   **Real-Time Data Simulation:** A mock API service and a `setInterval` loop provide a continuous stream of new data, making all widgets update and animate in real-time.
-   **Smooth Easing Animations:** All data changes are animated smoothly using an interpolation formula within a `requestAnimationFrame` loop, ensuring a fluid and professional user experience.
-   **Persistent Layout:** The custom layout of the dashboard is saved to `localStorage`, so the user's arrangement of widgets is remembered on their next visit.

## Technologies Used

-   **HTML5:** For the `<canvas>` element and page structure, including a `<template>` for efficient widget creation.
-   **CSS3:** For modern styling, including:
    -   **CSS Grid** for the core of the custom layout engine.
    -   CSS Variables for a clean, modern color scheme.
-   **Vanilla JavaScript (ES6+):** For all application logic, including the rendering engine, animation loop, data simulation, and the custom layout engine.

## Core JavaScript Concepts Showcased

This project is a deep dive into building complex, interactive UIs from first principles.

#### 1. Custom Drag-and-Drop & Resize Engine

Instead of relying on a third-party library, the entire grid management system is custom-built.
-   **Drag and Drop:** Uses the HTML Drag and Drop API (`dragstart`, `dragover`, `drop`). As a widget is dragged, a placeholder element is shown on the grid to provide clear visual feedback. On drop, the widget's grid position in the central state object is updated, triggering a re-render.
-   **Resizing:** Achieved by dynamically adding a "resize handle" to each widget. A `mousedown` -> `mousemove` -> `mouseup` event flow tracks the user's drag, calculates the new dimensions in terms of grid units, and updates the widget's `grid-column-end` and `grid-row-end` CSS properties in real-time.

**Example: Updating a widget's CSS Grid properties (`script.js`)**
```javascript
// This function is called after the state is updated
function renderDashboard() {
    widgets.forEach(widget => {
        // ... create widgetEl ...
        
        // The widget's position is set directly by manipulating CSS Grid properties
        widgetEl.style.gridColumn = `${widget.layout.x} / span ${widget.layout.w}`;
        widgetEl.style.gridRow = `${widget.layout.y} / span ${widget.layout.h}`;
        
        dashboardGrid.appendChild(widgetEl);
        makeResizable(widgetEl); // Attach resize handlers
    });
}
```

#### 2. Unified `requestAnimationFrame` Render Loop

A single, perpetual animation loop is the performance core of the application. It iterates through all active widgets on every frame and calls the appropriate drawing function based on the widget's type. This polymorphic approach makes the system highly scalable and efficient.

**Example: The animation loop (`script.js`)**
```javascript
function animationLoop() {
    widgets.forEach(widget => {
        if (widget.ctx) { // Check if the canvas context exists
            widget.ctx.clearRect(0, 0, widget.canvas.width, widget.canvas.height);
            // Call the correct drawing function for this widget's type
            drawFunctions[widget.type]?.(widget);
        }
    });
    // Continue the loop on the next available frame
    requestAnimationFrame(animationLoop);
}
```

#### 3. Decoupled State Animation (Interpolation / Easing)

A key architectural pattern is the separation of the data state from the visual state.
-   A **`setInterval`** loop updates the *target data* (e.g., `widget.data.target`).
-   The **`requestAnimationFrame`** loop smoothly animates the *visual data* (e.g., `widget.data.current`) until it reaches the target.

This decoupling means the data can update at any time, and the animation will always gracefully catch up.

**Example: The easing logic for a KPI card (`script.js`)**
```javascript
// In the KPI drawing function, called every frame:
function drawKpi(widget) {
    const { data } = widget;
    if (data.target === null) return;
    if (data.current === null) data.current = 0;

    // Move the 'current' value a fraction of the way towards the 'target' value
    data.current += (data.target - data.current) * 0.1; // Easing factor

    // Draw the smoothly animating 'current' value, not the 'target'
    ctx.fillText(Math.round(data.current).toLocaleString(), ...);
}
```

#### 4. Persistent State with `localStorage`

The entire `widgets` array, which includes each widget's ID, type, and custom layout (`x`, `y`, `w`, `h`), is saved to `localStorage` whenever a change is made. On page load, the application checks for this saved state and uses it to perfectly reconstruct the user's personalized dashboard.

## How to Run

1.  Save the `index.html`, `style.css`, `data.json`, and `script.js` files in the same folder.
2.  **Important:** Because this project uses `fetch()` to load the local `data.json` file, you must serve it from a local web server. You cannot just open `index.html` directly from your file system. A simple way to do this is with the "Live Server" extension in VS Code.
3.  Once served, open the local server address (e.g., `http://127.0.0.1:5500`) in your web browser. The dashboard will load with a default layout and begin animating.