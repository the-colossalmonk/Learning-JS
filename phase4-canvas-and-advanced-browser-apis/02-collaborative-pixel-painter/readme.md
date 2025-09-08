# Phase 4, Project 2: Collaborative Pixel Painter

This is a real-time, multi-user pixel art canvas inspired by community projects like Reddit's r/place. The application is built entirely with vanilla JavaScript and uses the HTML Canvas API for all rendering. It features a simulated real-time environment where multiple "users" can join, see each other's cursors, and paint on a shared, infinite, wrapping canvas.

## Live Demo

**(Link to your deployed project would go here)**

## Features

-   **Real-Time Collaborative Painting:** Any pixel painted by a user appears on the screens of all other connected users instantly.
-   **Infinite Wrapping Canvas:** The canvas is seamless. Painting off one edge (e.g., the right side) will cause your drawing to appear on the opposite edge (the left side).
-   **Live Cursor Broadcasting:** See the colored cursors of other participants move across the canvas in real-time.
-   **Pan and Zoom:** The canvas is fully navigable. Users can zoom in and out with the mouse wheel and pan across the canvas (hold Shift + Drag) to work on detailed sections.
-   **Time-Lapse GIF Export:** The application records every pixel placement. An "Export as GIF" button uses the `gif.js` library to generate a downloadable, animated GIF of the entire artwork's creation process on the client-side.
-   **Toggleable Pixel Grid:** A semi-transparent grid overlay can be toggled on and off, making it easier to see and select individual pixels.
-   **Simulated WebSocket Server:** The entire real-time functionality is powered by a "mock" WebSocket server built in JavaScript, demonstrating the principles of a real-time application without needing a backend.

## Technologies Used

-   **HTML5:** For semantic structure and layout, including the `<canvas>` element.
-   **CSS3:** For modern styling of the interface, color palette, and user cursors.
-   **Vanilla JavaScript (ES6+):** For all application logic, including the drawing engine, state management, and the real-time communication simulation.
-   **gif.js:** A third-party library for client-side animated GIF generation.

## Core JavaScript Concepts Showcased

This project is a deep dive into the HTML Canvas API and demonstrates a range of advanced, client-side browser capabilities.

#### 1. Advanced Canvas Rendering & State Management

The entire artwork is stored in a 2D JavaScript array (`gridState`), which acts as the "single source of truth." A `renderGrid()` function iterates through this array and draws each pixel onto the canvas using `ctx.fillRect()`. This separation of state and rendering is crucial for managing the canvas.

#### 2. Implementing Pan, Zoom, and Infinite Wrapping

-   **Pan & Zoom:** Achieved by applying CSS `transform` (`translate` and `scale`) to a wrapper element. JavaScript listens for mouse events to update a `transform` state object, and a key function (`screenToGridCoords`) translates screen coordinates to canvas coordinates by reversing the transform.
-   **Wrapping:** Implemented with the modulo operator (`%`) when calculating pixel coordinates. This ensures that any coordinate outside the grid's bounds is "wrapped" around to the other side.

**Example: The coordinate wrapping logic (`script.js`)**
```javascript
function paintPixel(canvasX, canvasY) {
    const { col, row } = screenToGridCoords(canvasX, canvasY);
    // This formula ensures both positive and negative out-of-bounds coordinates wrap correctly.
    const wrappedRow = (row % GRID_SIZE + GRID_SIZE) % GRID_SIZE;
    const wrappedCol = (col % GRID_SIZE + GRID_SIZE) % GRID_SIZE;
    
    // ... proceed to paint at [wrappedRow][wrappedCol] ...
}
```

#### 3. In-Browser GIF Generation

The time-lapse feature uses the third-party `gif.js` library to create an animated GIF entirely on the client-side. The process involves:
1.  Looping through the `history` of all paint actions.
2.  Drawing each state of the artwork onto a hidden, off-screen `<canvas>`.
3.  Adding the off-screen canvas as a frame to a `GIF` instance.
4.  Rendering the final GIF and creating a downloadable `Blob`.

#### 4. Simulating Real-Time Collaboration

The project uses a mock WebSocket server to demonstrate the event-driven architecture of a real-time app. The frontend code is written as if it were communicating over a real network, sending and receiving messages like `PAINT_PIXEL`, `USER_JOINED`, and `CURSOR_UPDATE`.

## How to Run

1.  Save the three files (`index.html`, `style.css`, `script.js`) in the same folder.
2.  Open `index.html` in your web browser.
3.  Click on a color to select it, then click or drag on the canvas to paint.
4.  Hold `Shift` and drag to pan. Use the mouse wheel to zoom.