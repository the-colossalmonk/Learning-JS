# Phase 3, Project 4: Custom Polling Dashboard (Ant Colony Simulator)

This is a dynamic dashboard that simulates monitoring a live ecosystem—an ant colony. The application demonstrates advanced asynchronous JavaScript patterns by creating independent "chamber monitors" (widgets) that fetch data on separate background threads using Web Workers.

### Key Features

-   **Multi-threaded Polling:** Each widget runs its `setInterval` for data polling inside a dedicated **Web Worker**, ensuring the main UI thread remains smooth and responsive, even with many widgets polling at different frequencies.
-   **Dynamic Widget Dashboard:** Users can add new "Chamber Monitors" to the dashboard via a modal, choosing the chamber type and update interval. Each widget can be removed individually.
-   **Custom SVG Mini-Charts:** Each widget features a live-updating line chart, rendered with SVG, that visualizes the history of the chamber's population. The chart is generated and updated from scratch using JavaScript.
-   **Global Controls:** A "Pause All" / "Resume All" button allows the user to stop and start the polling for all widgets simultaneously by sending messages to the workers.
-   **Stateful UI:** The application provides clear visual feedback for the state of each widget, including a "Live" status, a "Paused" status, and an "Error" status if the simulated API fails.
-   **Clean, Thematic UI:** A unique, earthy "ant colony" theme with a responsive grid layout makes the dashboard visually engaging.

---

### Core JavaScript Concepts Covered

This project is a deep dive into advanced asynchronous programming, state management, and creating a robust, data-driven interface.

#### 1. Web Workers for Background Tasks

The cornerstone of this project is the use of **Web Workers**. Instead of running multiple `setInterval` timers on the main UI thread (which can cause performance issues), each widget offloads its polling task to a separate background thread.

**Main Script (`script.js`):**
-   Creates a new `Worker` for each widget.
-   Communicates with the worker using `worker.postMessage({ command: 'start', ... })`.
-   Listens for results using `worker.onmessage`.

**Worker Script (`worker.js`):**
-   Listens for commands using `self.onmessage`.
-   Manages its own `setInterval` and `clearInterval`.
-   Performs the data-fetching task.
-   Sends data or errors back to the main thread with `self.postMessage({ status: 'success', ... })`.

This pattern demonstrates a professional approach to handling concurrent, long-running background tasks without impacting UI performance.

#### 2. Managing Multiple Asynchronous Processes

The application is designed to handle many independent, asynchronous data feeds at once. The main `widgets` object acts as a central registry, storing not only the configuration for each widget but also a reference to its active `Worker` instance and its data history. This allows for precise control over individual widgets (like removing one) as well as global control (like pausing all).

#### 3. Dynamic SVG Chart Generation

The mini-chart inside each widget is not from a library. It's an `<svg>` element that is dynamically controlled by JavaScript. A `renderChart` function takes an array of historical data, calculates the coordinates, and generates the `points` attribute for an SVG `<polyline>` and `<polygon>` to draw a live-updating graph.

**Example: Generating the SVG path (`script.js`)**

```javascript
function renderChart(widget) {
    const data = widget.history;
    // ... calculate scales and dimensions ...

    // Map each data point to an "x,y" coordinate string
    const linePoints = data.map((d, i) => `${getX(i)},${getY(d)}`).join(' ');
    // Create a path for the filled area underneath the line
    const fillPoints = `${getX(0)},${height} ${linePoints} ${getX(data.length - 1)},${height}`;
    
    // Update the SVG with the new paths
    svg.innerHTML = `
        <polygon class="chart-fill" points="${fillPoints}"></polygon>
        <polyline class="chart-line" points="${linePoints}"></polyline>
    `;
}```

### How to Run

1.  Create a folder for the project.
2.  Save the three files (`index.html`, `style.css`, `script.js`, and **`worker.js`**) inside that folder.
3.  **Important:** To use Web Workers, you must serve the files from a local web server. You cannot just open `index.html` directly from your file system. A simple way to do this is with the "Live Server" extension in VS Code.
4.  Once served, open the local server address (e.g., `http://127.0.0.1:5500`) in your web browser.