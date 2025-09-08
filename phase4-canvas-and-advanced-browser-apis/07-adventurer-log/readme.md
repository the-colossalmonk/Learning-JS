# Phase 4, Project 7: The Adventurer's Log

This is a dynamic, map-based journaling application for chronicling adventures in a fantasy world. Users can mark locations on a custom fantasy map, write journal entries about their discoveries, and attach "sketches" (photos). All entries are plotted as interactive pins, and a "Fog of War" is cleared as new areas are explored, creating a visual story of a grand journey.

## Live Demo

**(Link to your deployed project would go here)**

## Features

-   **Interactive Fantasy Map:** The central UI is a canvas displaying a fantasy map where users can click to place pins, marking their discoveries.
-   **Full CRUD Functionality:** Users can **C**reate, **R**ead, **U**pdate, and **D**elete their journal entries. Clicking an entry opens a detail view, with options to edit the text or delete the log entirely.
-   **"Fog of War" / Discovery Zones:** The map starts obscured. As new journal entries are added, the fog is cleared in a radius around the new pin, creating a powerful sense of exploration and progress.
-   **Journey Path:** The application automatically draws a dashed line connecting journal entries in chronological order, visually tracing the path of the adventure.
-   **Customizable Map Pins:** Users can choose from a variety of thematic icons (a castle, a sword, a forest) to represent the type of event for each journal entry.
-   **Journal Reset:** A button on the map allows the user to completely reset the journal and start a new adventure.
-   **Persistent State:** All journal entries are saved to the browser's `localStorage`, ensuring the entire adventure is preserved across sessions.
-   **Thematic UI:** The entire application is styled with a "fantasy cartographer" theme, using rustic fonts and parchment-like textures.

## Technologies Used

-   **HTML5:** For semantic structure, including layered `<canvas>` elements.
-   **CSS3:** For modern styling, including a thematic design with custom fonts, Flexbox, and modal transitions.
-   **Vanilla JavaScript (ES6+):** For all application logic, including state management, asynchronous file reading, and all Canvas API rendering.

## Core JavaScript Concepts Showcased

This project is a comprehensive showcase of integrating multiple advanced, asynchronous browser APIs with the HTML Canvas for a rich, interactive experience.

#### 1. Advanced Canvas API Manipulation

This project uses multiple layered canvases to achieve its effects, demonstrating a sophisticated understanding of the Canvas API.
-   A **bottom layer** for the static map image (`drawImage`).
-   A **middle layer** where journey paths (`lineTo`, `setLineDash`) and location pins (`fillText`, `arc`) are drawn. The active pin is highlighted with a glowing effect.
-   A **top "Fog of War" layer** that uses `globalCompositeOperation = 'destination-out'` to "erase" parts of the fog, revealing the map underneath.

**Example: The Fog of War clearing effect (`script.js`)**

```javascript
function drawFogOfWar() {
    // 1. Fill the entire top canvas with semi-transparent black
    fogCtx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    fogCtx.fillRect(0, 0, fogCanvas.width, fogCanvas.height);
    
    if (journalEntries.length === 0) return;
    
    // 2. Set the composite operation to "erase" mode
    fogCtx.globalCompositeOperation = 'destination-out';

    // 3. For each journal entry, draw a "clearing" circle with a gradient
    journalEntries.forEach(entry => {
        const radius = Math.min(fogCanvas.width, fogCanvas.height) * 0.15;
        const gradient = fogCtx.createRadialGradient(entry.coords.x, entry.coords.y, radius * 0.25, entry.coords.x, entry.coords.y, radius);
        gradient.addColorStop(0, 'rgba(0,0,0,1)');
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
        fogCtx.fillStyle = gradient;
        fogCtx.beginPath();
        fogCtx.arc(entry.coords.x, entry.coords.y, radius, 0, Math.PI * 2);
        fogCtx.fill();
    });

    // 4. Reset the composite operation for future drawings
    fogCtx.globalCompositeOperation = 'source-over';
}
```

#### 2. The `FileReader` API for Local Images

To allow users to "attach a sketch," the application uses the `FileReader` API to read a user-selected image file. The file is converted into a Base64 Data URL, which can then be stored as a string in `localStorage` and easily rendered. This is handled asynchronously using Promises for clean `async/await` syntax.

#### 3. State-Driven, Interactive UI

The application is built around a "single source of truth" principle. The `journalEntries` array and an `activeEntryId` variable hold all the data. Any action—adding, selecting, editing, or deleting an entry—modifies this state, which then triggers a single `renderAll()` function. This function is responsible for redrawing everything, ensuring the entire UI is always in sync with the current state.

**Example: The event delegation for the journal list (`script.js`)**
```javascript
// A single listener on the parent container
journalEntriesEl.addEventListener('click', (e) => {
    // Find the specific entry that was clicked
    const targetEntry = e.target.closest('.journal-entry');
    if (targetEntry) {
        // Get the ID from the data attribute and update the central state
        activeEntryId = parseInt(targetEntry.dataset.entryId);
        // Re-render the entire application to reflect the change
        renderAll();
        // Find the full data and show the detail modal
        const entryData = journalEntries.find(entry => entry.id === activeEntryId);
        if (entryData) {
            showEntryDetailModal(entryData);
        }
    }
});
```

## How to Run

1.  Save the three files (`index.html`, `style.css`, `script.js`) in the same folder.
2.  **Important:** You must have an image named `fantasy-map.png` in the same folder for the application to work. You can find royalty-free fantasy maps on sites like Pexels, Unsplash, or generate one using an AI art tool.
3.  Open `index.html` in your web browser.
```