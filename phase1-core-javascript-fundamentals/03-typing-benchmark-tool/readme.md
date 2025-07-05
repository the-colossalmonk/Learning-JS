# Phase 1, Project 3: Typing Benchmark Tool (Infinity Trainer)

This is a dynamic, real-time typing trainer application designed to measure and improve a user's typing speed (WPM) and accuracy. It features an "infinity mode" that provides a continuous stream of text, multiple difficulty levels, and a clean, modern interface that changes color based on the selected mode.



### Key Features

-   **"Infinity" Timed Mode:** Instead of stopping, the test seamlessly loads new quotes as you type, creating an uninterrupted practice session for the chosen duration.
-   **Multiple Difficulty Levels:** Choose from 30s (Hard), 60s (Medium), 90s, and 120s (Easy) modes.
-   **Difficulty-Based Themes:** The app's color scheme changes based on the selected time, providing visual cues for difficulty: Hard (Orange), Medium (Indigo), and Easy (Green/Teal).
-   **Live Statistics:** Words Per Minute (WPM) and Accuracy are calculated and updated live every second.
-   **Social Sharing:** After a test is complete, you can share your final WPM and accuracy score directly to Twitter.
-   **Real-Time Validation:** Characters are validated instantly, with correct characters colored green and incorrect ones highlighted in red.
-   **Clean & Focused UI:** A minimalist design with a subtle highlight cursor and prominent restart button helps you focus on typing. The test is ready to go immediately on page load.
-   **API Integration:** Fetches random quotes from the `quotable.io` API to ensure a different test every time, with a built-in fallback for reliability.

---

### Core JavaScript Concepts Covered

This project evolved to cover several important JavaScript concepts, from fundamental event handling to more advanced asynchronous patterns and state management.

#### 1. Advanced Asynchronous Logic (Infinity Mode)

The most complex feature is the "infinity mode," which requires fetching new data *while the user is still interacting with existing data*. This is a common challenge in modern web apps. We solve it using `async/await` combined with a state flag (`isFetchingNextQuote`) to prevent multiple simultaneous requests.

**Example: Triggering the next fetch and appending the quote (`script.js`)**

```javascript
// Inside the 'input' event handler, we check if we're near the end and not already fetching.
function handleInput() {
    // ... validation logic ...

    const quoteChars = quoteDisplayElement.querySelectorAll('span');
    const typedChars = quoteInputElement.value.split('');
    
    // Check if we're over 70% through the current text
    if (!isFetchingNextQuote && (typedChars.length / quoteChars.length > 0.7)) {
        appendNewQuote();
    }
}

// The async function that handles fetching and appending
async function appendNewQuote() {
    isFetchingNextQuote = true; // Set flag to prevent re-fetching
    const quote = await getRandomQuote();
    
    // Add a space between the old and new text
    const spaceSpan = document.createElement('span');
    spaceSpan.innerText = ' ';
    quoteDisplayElement.appendChild(spaceSpan);

    // Create and append new <span> elements for the new quote
    quote.split('').forEach(character => {
        const characterSpan = document.createElement('span');
        characterSpan.innerText = character;
        quoteDisplayElement.appendChild(characterSpan);
    });

    isFetchingNextQuote = false; // Reset flag after completion
}
```

#### 2. Dynamic Theming with CSS Variables and JavaScript

The application's theme is controlled by adding a class to a parent container (`#container`). CSS variables are then used to propagate the color changes throughout the application. This is a powerful and modern technique for creating dynamic and maintainable themes.

**Example: Using CSS variables for themes (`style.css`)**

```css
:root {
    /* Define the color palette */
    --easy-color: #68D391;
    --medium-color: #818CF8;
    --hard-color: #F6AD55;
    
    /* Set a default accent color */
    --accent-color: var(--medium-color);
}

/* Use JS to add one of these classes to the main container */
.mode-easy { --accent-color: var(--easy-color); }
.mode-medium { --accent-color: var(--medium-color); }
.mode-hard { --accent-color: var(--hard-color); }

/* Any element can now use the dynamic accent color */
.btn-main-restart {
    background-color: var(--accent-color);
}
.container {
    border-top: 5px solid var(--accent-color);
}
```

#### 3. Robust State Management

To function correctly, the application must manage multiple state variables (`isTimerStarted`, `testDuration`, `isFetchingNextQuote`, `mistakes`). A central `resetTest()` function is crucial for keeping the application predictable and bug-free, as it ensures all key variables are returned to their default state before a new test begins.

**Example: The `resetTest` function (`script.js`)**

```javascript
async function resetTest() {
    // Stop any existing timers
    clearInterval(timer);

    // Reset all state flags and counters
    isTimerStarted = false;
    isFetchingNextQuote = false;
    mistakes = 0;
    
    // Reset UI elements
    quoteInputElement.value = '';
    quoteInputElement.disabled = false;
    shareBtn.disabled = true; // Disable share button on reset
    wpmElement.innerText = '0';
    accuracyElement.innerText = '100%';
    timerElement.innerText = `${testDuration}s`;
    
    // ... logic to load the first quote ...
    
    // Ensure the app is ready for immediate input
    quoteInputElement.focus();
}
```

#### 4. Event Handling for a Fluid UX

The application uses multiple event listeners (`input`, `click`) to create a seamless user experience. A key detail is adding a `click` listener to the quote display area itself to re-focus the invisible text input, so the user can never "lose focus" of the test.

**Example: The focus-fixing event listener (`script.js`)**
```javascript
// Get the container element for the quote text
const quoteDisplayContainer = document.getElementById('quote-display-container');

// If the user clicks anywhere on the quote, it will focus the input field
quoteDisplayContainer.addEventListener('click', () => quoteInputElement.focus());
```

### How to Run

1.  Create a folder for the project.
2.  Save the three files (`index.html`, `style.css`, `script.js`) inside that folder.
3.  Open the `index.html` file in your web browser.