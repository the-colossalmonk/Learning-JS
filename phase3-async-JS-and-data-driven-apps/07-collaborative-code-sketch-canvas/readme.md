# Phase 3, Project 7: Collaborative Code-Sketch Canvas

This project is a real-time, multi-user whiteboard application built entirely with vanilla JavaScript. It simulates a live, collaborative environment where multiple users can draw on a shared canvas, see each other's cursors move in real-time, and undo their actions.

To make the experience dynamic and demonstrate the collaborative features immediately, the application includes simulated "bot" users that join the session and draw on the canvas continuously.

## Live Demo

**(Link to your deployed project would go here)**

## Features

-   **Real-Time Collaborative Drawing:** Any line drawn by a user appears on the screens of all other connected users instantly.
-   **Live Cursor Broadcasting:** See the named cursors of other participants move across the canvas in real-time, creating a true sense of a shared space.
-   **"Who's Online" List:** A sidebar displays a live-updating list of all users currently on the canvas, each with a unique, randomly assigned name and color.
-   **Continuous User Simulation:** To showcase the app's capabilities, simulated "bot" users join the session and perform random drawing actions periodically, creating a perpetually active and collaborative environment.
-   **Synchronized Undo & Clear:** The undo feature is owner-specific and synchronized. When a user undoes their own action, it is correctly removed from the canvas for everyone. The "Clear All" button wipes the canvas for all participants.
-   **Drawing Tools:** Users can change their brush color and size using a simple, intuitive toolbar.
-   **Simulated WebSocket Server:** The entire real-time functionality is powered by a "mock" WebSocket server built in JavaScript, which handles message broadcasting and client management without needing a backend.

## Technologies Used

-   **HTML5:** For semantic structure, including the `<canvas>` element.
-   **CSS3:** For modern styling of the interface, toolbar, and user cursors.
-   **Vanilla JavaScript (ES6+):** For all application logic, including the drawing engine, state management, and the real-time communication simulation.

## Core JavaScript Concepts Showcased

This project is a capstone for understanding asynchronous patterns, complex state, and advanced event handling.

#### 1. Simulating Real-Time, Bi-Directional Communication

The heart of the application is a mock WebSocket server. This demonstrates an understanding of the principles of real-time communication without requiring a backend.
-   The **Server** object manages a list of connected clients and contains a `broadcast()` method.
-   The **Client** object has a `send()` method (which calls the server) and an `onmessage()` handler (which the server calls).
-   When a client sends a message, the server receives it and broadcasts it to all *other* clients, which then react to the message.

**Example: The server's broadcast logic (`script.js`)**

```javascript
const mockWebSocketServer = {
    clients: new Map(),
    // ... connect/disconnect methods ...
    handleMessage(message, fromClientId) {
        // Broadcast the message to all other clients
        this.broadcast(message, fromClientId);
    },
    broadcast(message, fromClientId) {
        for (const [id, { client }] of this.clients) {
            // Don't send the message back to the original sender
            if (id !== fromClientId) {
                // Call the client's message handler function
                client.onmessage({ data: JSON.stringify(message) });
            }
        }
    }
};
```

#### 2. The HTML Canvas API

All drawing is handled using the `<canvas>` element's 2D rendering context. This project demonstrates mastery of the fundamental drawing methods:
-   `getContext('2d')`
-   `beginPath()`, `moveTo()`, `lineTo()`, `stroke()` for drawing lines.
-   `strokeStyle`, `lineWidth`, `lineCap`, `lineJoin` for styling the strokes.
-   `clearRect()` for clearing the canvas before a redraw.

#### 3. Advanced State Management & History

To enable collaborative undo, the application cannot simply draw on the canvas and forget. It must maintain a `history` array that serves as the "single source of truth" for what is on the canvas.
-   Every completed line (path) is an object pushed into the `history` array.
-   The `redrawCanvas()` function clears the entire canvas and loops through the `history` array, redrawing every path from scratch.
-   "Undo" works by finding and removing the correct path object from the `history` and then triggering a global `redrawCanvas()`. This ensures all clients have a perfectly synchronized view.

#### 4. Complex Event Handling

The application masterfully handles the `mousedown`, `mousemove`, and `mouseup` event flow for drawing. It also listens for `mousemove` events even when not drawing to broadcast live cursor positions, creating a multi-layered, responsive user experience.

## How to Run Locally

1.  Save the three files (`index.html`, `style.css`, `script.js`) in the same folder.
2.  Open `index.html` in your web browser. The application will start immediately and simulate two other users joining and drawing on the canvas continuously.
```