# Phase 1, Project 6: Language Flashcard Quizzer

This is a simple and elegant flashcard application to help users master new vocabulary. The app features a deck of cards that can be flipped with a smooth 3D animation, self-assessment tools, and a "review mode" for focused practice.

### Key Features

-   **3D Flip Animation:** Cards flip over with a visually satisfying 3D effect powered by CSS transforms and perspective.
-   **Self-Assessment:** After revealing a card's answer, users can mark it as "I Knew It" or "Needs Review."
-   **Review Mode:** A dedicated mode allows users to cycle exclusively through cards they've marked for review, enabling targeted learning.
-   **Full Deck Navigation:** Easily move forward and backward through the deck of cards.
-   **Keyboard Controls:** Use the Left and Right arrow keys to navigate and the Spacebar to flip the card for a fast, keyboard-driven experience.
-   **Clean, Responsive UI:** A minimalist, modern design that is easy to use and focuses on the learning content.

---

### Core JavaScript Concepts Covered

This project is an excellent exercise in combining data management with CSS-driven animations and user state.

#### 1. Triggering CSS Animations with JavaScript

The core interactive feature—the card flip—is a perfect example of JavaScript and CSS working together. JavaScript's only job is to toggle a class on the card element. CSS handles the entire animation, which is more performant and separates concerns cleanly.

**Example: The JavaScript logic (`script.js`)**

```javascript
// A single event listener on the card element
card.addEventListener('click', flipCard);

function flipCard() {
    // Toggling the class is all the JS needs to do
    card.classList.toggle('is-flipped');
}
```

**Example: The corresponding CSS (`style.css`)**
```css
.card-container {
  perspective: 1000px; /* Creates the 3D space */
}
.card {
  transform-style: preserve-3d; /* Allows children to be transformed in 3D */
  transition: transform 0.6s;
}
.card.is-flipped {
  transform: rotateY(180deg); /* The animation itself */
}
```

#### 2. Managing State within Data

This project introduces the idea of storing user-specific state *within* the data objects themselves. Each card object doesn't just hold content (`front`, `back`), but also a `status` property (`'new'`, `'known'`, or `'review'`). This makes features like "Review Mode" possible.

**Example: The data structure (`script.js`)**
```javascript
const fullDeck = [
    { front: 'Hello', back: 'Hola', status: 'new' },
    { front: 'Goodbye', back: 'Adiós', status: 'new' },
    // ... more cards
];
```

#### 3. Filtering Data for Different Views (Review Mode)

"Review Mode" is implemented by using the `Array.prototype.filter()` method. When the mode is activated, we create a new `currentDeck` array containing only the cards that match the review criteria. This is a fundamental pattern for creating different "views" from a single source of data.

**Example: The `filterDeck` function (`script.js`)**

```javascript
let isReviewMode = false;
let currentDeck = [];

function filterDeck() {
    if (isReviewMode) {
        // Create a new array with only the review cards
        currentDeck = fullDeck.filter(card => card.status === 'review');
    } else {
        // Use the full deck
        currentDeck = [...fullDeck];
    }
    currentCardIndex = 0; // Reset index for the new deck
}
```

#### 4. Keyboard Event Handling

To improve usability, a `keydown` event listener is attached to the `document`. This allows the application to respond to global key presses, like the arrow keys and spacebar, making the experience feel more like a native application.

### How to Run

1.  Save the three files (`index.html`, `style.css`, `script.js`) in the same folder.
2.  Open `index.html` in your web browser.