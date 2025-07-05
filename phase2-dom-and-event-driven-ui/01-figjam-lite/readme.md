# Phase 2, Project 1: Interactive Canvas (FigJam Lite)

This is an ambitious and highly interactive web application inspired by vector design tools like Figma's FigJam. It provides a digital canvas where users can drag-and-drop elements, move, resize, rotate, and layer them to brainstorm and visualize ideas. The project also includes a basic pen tool for freeform drawing.

### Key Features

-   **Toolbar & Palette:** A top toolbar allows users to switch between a "Select" tool and a "Pen" tool. A palette provides various draggable elements.
-   **Drag-and-Drop Creation:** Drag shapes, colored notes, and stickers (emojis) from the palette and drop them anywhere on the canvas to create new elements.
-   **Direct Manipulation:** Once on the canvas, elements can be freely moved around by clicking and dragging.
-   **Transformation Gizmo:** Selecting an element reveals a transformation box with handles to intuitively resize and rotate the object.
-   **Custom Context Menu:** Right-clicking a selected element opens a custom menu with options to change its layer order ("Bring to Front" / "Send to Back") or delete it.
-   **Pen Tool:** A basic freeform drawing tool. Each stroke creates a separate, independent object that can be selected, moved, and deleted just like any other element.
-   **Stateful UI:** The application correctly manages different states (e.g., dragging, resizing, drawing) to ensure interactions are smooth and predictable.

---

### Core JavaScript Concepts Covered

This project is a deep dive into the kind of complex, event-driven logic required for modern interactive web applications.

#### 1. Advanced Event Handling (`mousedown`, `mousemove`, `mouseup`)

The core of all direct manipulation (moving, resizing, rotating) is built on the `mousedown` -> `mousemove` -> `mouseup` event flow. This pattern allows for continuous updates while the user is interacting with an element.

**Example: The logic for dragging an element (`script.js`)**

```javascript
// State object to track the current action
let actionState = { isDragging: false, startX: 0, startY: 0, ... };

// 1. On mousedown, capture the initial state
canvas.addEventListener('mousedown', (e) => {
    if (/* target is a draggable element */) {
        actionState.isDragging = true;
        actionState.startX = e.clientX;
        actionState.startY = e.clientY;
        // ... store initial element position ...
    }
});

// 2. On mousemove, if dragging, calculate the change and update the element's style
window.addEventListener('mousemove', (e) => {
    if (actionState.isDragging) {
        const dx = e.clientX - actionState.startX;
        const dy = e.clientY - actionState.startY;
        selectedElement.style.left = `${actionState.startLeft + dx}px`;
        selectedElement.style.top = `${actionState.startTop + dy}px`;
    }
});

// 3. On mouseup, reset the state
window.addEventListener('mouseup', () => {
    actionState.isDragging = false;
});
```

#### 2. Dynamic DOM Manipulation & State Management

The application's UI is almost entirely dynamic. Elements like the selection box, transformation handles, and context menu are created and destroyed on the fly based on user actions. JavaScript variables are used to keep track of the `activeTool`, the `selectedElement`, and the current action (`isDragging`, `isResizing`, etc.).

#### 3. Coordinate & Geometry Calculations

To implement resizing and especially rotation, you must perform geometric calculations in JavaScript. This involves getting an element's position and size (`element.getBoundingClientRect()`) and using `Math` functions to determine angles and new dimensions.

**Example: Calculating rotation angle (`script.js`)**

```javascript
// Inside the mousemove handler, when rotating
function handleMouseMove(e) {
    if (actionState.isRotating) {
        // Calculate the angle between the element's center and the current mouse position
        const angle = Math.atan2(e.clientY - actionState.elementCenterY, e.clientX - actionState.elementCenterX) * 180 / Math.PI;
        // Apply the rotation via CSS transform, adding 90 degrees for correct orientation
        selectedElement.style.transform = `rotate(${angle + 90}deg)`;
    }
}
```

#### 4. The Canvas API for Drawing

The pen tool introduces a different rendering paradigm. Instead of creating DOM elements, it uses the HTML `<canvas>` API to draw pixels. Each stroke is captured on its own individual canvas element, allowing it to be treated as a selectable object in the DOM.

**Example: The core drawing logic (`script.js`)**

```javascript
function draw(e) {
    // ...
    const ctx = currentDrawingElement.ctx;
    // ... calculate bounding box of the path ...
    
    // Resize the dedicated canvas for this stroke
    currentDrawingElement.canvas.width = width;
    currentDrawingElement.canvas.height = height;
    
    // Draw the recorded path onto the canvas
    ctx.beginPath();
    ctx.moveTo(path[0][0] - minX, path[0][1] - minY);
    for (const point of path) {
        ctx.lineTo(point[0] - minX, point[1] - minY);
    }
    ctx.stroke();
}
```

### How to Run

1.  Save the three files (`index.html`, `style.css`, `script.js`) in the same folder.
2.  Open `index.html` in your web browser.

---

# Phase 2, Project 1: Interactive Canvas (FigJam Lite)

This is an ambitious and highly interactive web application inspired by vector design tools like Figma's FigJam. It provides a digital canvas where users can add elements, move, resize, rotate, and layer them to brainstorm and visualize ideas.

### Current Status: In-Progress (with known issues)

This project served as a deep dive into advanced DOM manipulation and event handling. While many core features are functional, some known bugs prevent it from being fully operational.

#### What's Working:

-   **Tool Selection:** Users can switch between the "Select" and "Pen" tools in the toolbar.
-   **Element Creation:** Dragging shapes and colored notes from the main palette onto the canvas works correctly.
-   **Direct Manipulation:** Selected elements on the canvas can be freely moved by clicking and dragging.
-   **Basic Transformation:** Selected elements can be resized and rotated using the transformation handles.
-   **Context Menu & Layering:** Right-clicking an element brings up a custom context menu to change its z-index (Bring to Front/Send to Back) or delete it.
-   **Keyboard Deletion:** The "Delete" and "Backspace" keys correctly remove the selected element.
-   **Pen Tool:** The basic functionality of drawing a freeform line, which becomes a selectable object, is implemented.

#### Known Issues / To-Do:

-   **Sticker Drag-and-Drop:** The primary bug is that stickers cannot be dragged from the dynamically generated popover panel onto the canvas. The event listeners are not being correctly applied.
-   **Note Colors:** The specific background colors for the different note types are not being applied upon creation.
-   **Rotated Resizing:** Resizing an element that has been rotated does not work as expected and results in skewed dimensions. This requires more complex trigonometric calculations to fix.

### Core JavaScript Concepts Explored

Despite its issues, this project was a valuable exercise in several advanced concepts:

-   **Advanced Event Handling (`mousedown`, `mousemove`, `mouseup`):** The core pattern for all direct manipulation (moving, resizing, rotating) was successfully implemented.
-   **Dynamic DOM Manipulation:** The application creates, deletes, and updates numerous elements on the fly, including selection handles and context menus.
-   **State Management:** JavaScript variables are used to track the `activeTool`, the `selectedElement`, and the current user action (`isDragging`, `isResizing`, etc.).
-   **The Canvas API:** The pen tool provided an introduction to using the HTML `<canvas>` API for pixel-based drawing.
-   **Coordinate & Geometry Calculations:** Basic calculations using `getBoundingClientRect()` and `Math.atan2` were used to implement transformations.

---