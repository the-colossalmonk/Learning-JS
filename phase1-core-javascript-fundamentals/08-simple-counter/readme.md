# Phase 1, Project 8: Simple Counter

This is a beautifully designed, minimalist counter application built with vanilla JavaScript. While simple in concept, this project focuses on creating a high-quality user experience with clean aesthetics, smooth animations, and satisfying visual feedback for every interaction.

### Key Features

-   **Core Counter Functionality:** Increment, decrement, and reset a numerical value.
-   **Dynamic Color Change:** The number's color changes based on its value: green for positive, orange for negative, and a neutral color for zero.
-   **Animated Feedback:** The number "pops" with a subtle animation every time its value changes, providing satisfying visual feedback.
-   **Customizable Step:** Users can change the increment/decrement step value from the default of 1 to any other number.
-   **Manual Set Value:** A dedicated input allows the user to set the counter to a specific number instantly.
-   **Persistent State:** The current count is saved to the browser's `localStorage`, so the value is remembered even after the page is reloaded.
-   **Polished UI/UX:** A clean, modern design with attention to detail in spacing, font choice, and micro-interactions.

---

### Core JavaScript Concepts Covered

This project serves as a great summary of Phase 1, reinforcing fundamental concepts on a clean canvas.

#### 1. State Management

The entire application is driven by a single piece of state: the `count` variable. Every user interaction modifies this variable, and a central function (`updateDisplay`) is then called to ensure the UI reflects the new state. This is a fundamental pattern in web development.

**Example: The state and the update function (`script.js`)**

```javascript
let count = 0;

function updateDisplay() {
    // 1. Update the text content
    counterDisplay.textContent = count;
    
    // 2. Update the visual style based on state
    if (count > 0) {
        counterDisplay.style.color = 'var(--positive-color)';
    } else if (count < 0) {
        // ...
    }
    
    // 3. Persist the state
    localStorage.setItem('counterValue', count);
}

// Any action button just modifies the state and calls the update function
incrementBtn.addEventListener('click', () => {
    count += 1;
    updateDisplay();
});
```

#### 2. DOM Manipulation for UI Feedback

Beyond just changing text, this project uses JavaScript to manipulate the DOM for a richer user experience. This includes changing CSS styles directly (`element.style`) and adding/removing CSS classes (`element.classList`) to trigger animations.

**Example: Triggering the pop animation (`script.js`)**

```javascript
// Inside updateDisplay()
function updateDisplay() {
    // ...
    
    // Add the 'pop' class to start the animation
    counterDisplay.classList.add('pop');
    
    // Use setTimeout to remove the class after the animation is done.
    // This allows the animation to be re-triggered on the next click.
    setTimeout(() => {
        counterDisplay.classList.remove('pop');
    }, 300); // 300ms matches the CSS animation duration
}
```

#### 3. Data Persistence with `localStorage`

To make the application more useful, the counter's state is saved to `localStorage`. This is a simple but powerful way to persist data on the client-side. The application checks for a saved value on load and updates storage on every change.

**Example: Loading and saving (`script.js`)**

```javascript
// On page load
function loadInitialCount() {
    const savedCount = localStorage.getItem('counterValue');
    if (savedCount !== null) {
        count = parseInt(savedCount, 10);
    }
    updateDisplay();
}

// Inside updateDisplay()
function updateDisplay() {
    // ...
    localStorage.setItem('counterValue', count);
}
```

### How to Run

1.  Save the three files (`index.html`, `style.css`, `script.js`) in the same folder.
2.  Open `index.html` in your web browser.