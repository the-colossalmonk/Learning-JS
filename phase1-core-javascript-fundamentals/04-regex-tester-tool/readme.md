# Phase 1, Project 4: Regex Tester Tool

This is a user-friendly, real-time regular expression testing tool built with vanilla JavaScript. It allows users to select from a list of common patterns, write their own, and immediately see highlighted matches and detailed match information within a test string.

### Key Features

-   **Real-Time Feedback:** Matches are highlighted instantly as you type your pattern or test string.
-   **Regex Presets:** A dropdown menu provides ~10 common, pre-written regex patterns (Email, URL, etc.) for quick testing.
-   **Custom Pattern Input:** An option to write and test your own custom regular expressions with support for flags (g, i, m, etc.).
-   **Robust Error Handling:** The UI gracefully handles invalid regex syntax, displaying a clear error message without crashing the application.
-   **Detailed Match Information:** A dedicated panel lists every match found, including the full matched text, its index, and all captured groups.
-   **Comprehensive Cheat Sheet:** A toggleable side panel contains over 30 common regex tokens and patterns, categorized for easy reference. Clicking a token adds it to the custom input.
-   **Clean, Modern UI:** A multi-panel layout built with CSS Grid and styled with a minimalist, pastel theme for a pleasant user experience.

---

### Core JavaScript Concepts Covered

This project provides a deep dive into JavaScript's powerful text-processing capabilities.

#### 1. The `RegExp` Object and Error Handling

The core of the tool is the dynamic creation of `RegExp` objects from user input. Because user input can be invalid (e.g., an unclosed `[`), it's critical to wrap this operation in a `try...catch` block to handle errors gracefully and provide user feedback.

**Example: Safely creating a RegExp object (`script.js`)**

```javascript
function runRegexTest() {
    // ... get pattern and flags from inputs ...
    
    try {
        // Attempt to create the RegExp object. This will throw an error if syntax is invalid.
        const regex = new RegExp(pattern, flags);
        
        // ... proceed with matching if successful ...
        regexError.textContent = ''; // Clear any old errors

    } catch (e) {
        // If an error is caught, display it to the user.
        regexError.textContent = e.message;
    }
}
```

#### 2. Advanced String Methods (`replace` and `exec`)

This project uses two key string/regex methods for different purposes:
-   **`string.replace()` with a Regex:** This is used for highlighting. We find every match and replace it with the same text, but wrapped in a styled `<span>`.
-   **`regex.exec()` in a Loop:** This is used to get detailed information. Unlike `.match()`, `.exec()` provides the index and capture groups for each match. We run it in a `while` loop to iterate over all matches in the string.

**Example: Using `exec()` to find all match details (`script.js`)**

```javascript
const matches = [];
let match;
// Re-create the regex to reset its lastIndex property for the loop
const execRegex = new RegExp(pattern, flags); 

// The loop continues as long as .exec() finds a new match
while ((match = execRegex.exec(testString)) !== null) {
    matches.push(match); // `match` is an array-like object with details
}

// Now we can loop through the 'matches' array to display detailed info
// including match[0] (full match), match[1] (group 1), etc.
```

#### 3. Data-Driven UI Generation

The regex presets and the entire cheat sheet are not hardcoded in HTML. Instead, they are stored in JavaScript as arrays of objects. On page load, functions loop through this data to dynamically create and append the necessary DOM elements (`<option>`, `<li>`, etc.). This makes the content much easier to manage and update.

**Example: Storing data and populating the UI (`script.js`)**

```javascript
// Data is stored cleanly in an object
const cheatSheetData = {
    "Anchors": [
        { token: "^", desc: "Start of string" },
        { token: "$", desc: "End of string" },
    ]
};

// A function loops through this data to build the HTML
function populateCheatSheet() {
    for (const category in cheatSheetData) {
        // ... create category title (h3) ...
        cheatSheetData[category].forEach(item => {
            const listItem = document.createElement('li');
            // ... populate li with item.token and item.desc ...
        });
    }
}
```

### How to Run

1.  Save the three files (`index.html`, `style.css`, `script.js`) in the same folder.
2.  Open `index.html` in your web browser.