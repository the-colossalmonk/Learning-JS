# Phase 1, Project 7: Emoji Crossword Generator

This is a fun and challenging web application that algorithmically generates a unique crossword puzzle where the clues are emojis and the answers are words. It's a modern, visual twist on the classic puzzle, designed to test your knowledge in a delightful way.

### Key Features

-   **Algorithmic Generation:** Every puzzle is unique. A new crossword is generated procedurally every time you click "New Puzzle."
-   **Emoji-First Concept:** The clues are emojis (e.g., 🍎), and you solve the puzzle by typing the corresponding word ("APPLE").
-   **Multiple Difficulty Levels:** Choose from Easy, Medium, or Hard to generate smaller, simpler puzzles or larger, more complex ones.
-   **Interactive Highlighting:** Clicking on a clue in the list highlights the corresponding word's cells in the grid, and vice-versa, making navigation easy.
-   **Smart Input Navigation:** When you type a letter in a cell, the focus automatically moves to the next cell in that word (horizontally or vertically).
-   **Check & Reveal:** Users can check their answers to see which are correct/incorrect, or reveal the entire puzzle if they get stuck.
-   **Clean & Responsive UI:** Built with CSS Grid, the interface is clean, intuitive, and works well on different screen sizes.

---

### Core JavaScript Concepts Covered

This is a heavily logic-driven project, providing excellent practice in algorithms, data structures, and dynamic DOM manipulation.

#### 1. Algorithmic Thinking & Procedural Generation

The heart of this application is the crossword generation algorithm. It's a multi-step process that involves:
1.  Sorting a word list by length.
2.  Placing the longest word first.
3.  Iteratively finding valid intersection points with already-placed words.
4.  Using a helper function (`canPlaceWord`) to check for boundary and collision conflicts before placing a new word.

This is a fantastic exercise in breaking a large, complex problem into smaller, manageable functions.

**Example: The main generation loop (`script.js`)**

```javascript
// A simplified view of the generation loop
function generateCrossword() {
    // ... setup grid and words ...
    placeFirstWord();
    
    // Loop until enough words are placed or we've tried too many times
    while (placedWords.length < maxWords && attempts < maxAttempts) {
        const wordToPlace = //... get a random word ...
        let placed = false;
        
        // Find an intersection with an existing word
        for (const placedWord of placedWords) {
            // ... logic to find a matching letter ...
            
            // If a potential intersection is found...
            if (canPlaceWord(wordToPlace, newRow, newCol, newDirection)) {
                placeWord(wordToPlace, ...);
                placed = true;
                break;
            }
        }
        attempts++;
    }
}
```

#### 2. 2D Arrays as a Data Structure

A 2D array (an array of arrays) is the perfect data structure to represent the crossword grid in memory before it's rendered to the screen. All placement logic involves reading from and writing to this "virtual grid."

**Example: Creating and writing to the grid (`script.js`)**

```javascript
// Initialize a 10x10 grid filled with nulls
let grid = Array(10).fill(null).map(() => Array(10).fill(null));

// Placing the word "APPLE" horizontally at row 5, col 2
const word = "APPLE";
const row = 5;
const col = 2;
for (let i = 0; i < word.length; i++) {
    // grid[row][col + i] is how we access and write to a specific cell
    grid[row][col + i] = { char: word[i], clueNumber: /*...*/ };
}
```

#### 3. Dynamic DOM Generation from Data

The entire puzzle grid and clue list are built dynamically *after* the generation algorithm finishes. The code iterates through the `grid` and `placedWords` arrays and uses `document.createElement` to construct the necessary HTML, including the grid cells, input fields, and clue items. This separates the logic (generation) from the presentation (rendering).

#### 4. Complex Event Handling for UX

To create a smooth user experience, this project uses several event listeners:
-   **`focusin` on the grid:** To detect which word the user is currently focused on.
-   **`input` on the cells:** To automatically move focus to the next cell in the word.
-   **`click` on the clue list:** To highlight the corresponding word in the grid and move focus there.

### How to Run

1.  Save the three files (`index.html`, `style.css`, `script.js`) in the same folder.
2.  Open `index.html` in your web browser.