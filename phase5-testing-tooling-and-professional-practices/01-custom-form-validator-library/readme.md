# Phase 5, Project 1: Custom Form-Validator Library Showcase

This project is a demonstration of a lightweight, reusable, and dependency-free JavaScript library for client-side form validation. The project is presented as an **interactive showcase**, featuring a side-by-side view of a form and an "Inspector Panel." This panel provides real-time feedback, explaining exactly which validation rules are being applied to a field as the user interacts with it.

This project focuses on professional practices like modularity (ES6 modules), API design, and creating code that is not only functional but also educational and easy to understand.

## Features

-   **Modular Library:** The entire validation logic is encapsulated in a `validator.js` module, which can be easily imported and used in any project.
-   **Interactive Inspector:** A unique educational panel that:
    -   Shows which form field is currently in focus.
    -   Lists all validation rules applied to that field.
    -   Updates the status of each rule in real-time (pending, checking, pass, fail) as the user types.
-   **Declarative Rules:** The library is initialized with a simple configuration object that maps input names to a list of validation rules.
-   **Rich Set of Rules:** Includes common validation rules like `isRequired`, `isEmail`, `minLength`, and `match`.
-   **Asynchronous Validation:** Demonstrates support for async rules (e.g., checking if a username is available on a server) with visual "checking..." feedback.
-   **Customizable & Testable:** The core validation functions are pure and can be easily unit-tested. The library is designed to be extended with new custom rules.
-   **Professional UI/UX:** The entire showcase is built with a clean, modern, and responsive interface that provides clear and immediate feedback to the user.

## Core JavaScript Concepts Showcased

#### 1. ES6 Modules (`import`/`export`)

This project is structured as a modern JavaScript application. The core logic is in `validator.js` and is made available using `export default`. The main script for the page, `script.js`, then imports this module to use it. This is a fundamental pattern for writing maintainable and reusable code.

**`validator.js` (The Library):**
```javascript
class Validator {
    // ... all the logic ...
}
export default Validator;
```

**`script.js` (The Implementation):**
```javascript
import Validator from './validator.js';

const form = document.getElementById('signup-form');
new Validator(form, { /* ... rules ... */ });
```

#### 2. API Design & Class-Based Structure

The library is designed to be easy for a developer to use. It's instantiated as a `class` and configured with a simple object, abstracting away the complex event handling and DOM manipulation. This demonstrates thinking about the "developer experience" (DX).

#### 3. Asynchronous Validation with `async/await`

The library supports rules that need to perform asynchronous actions, such as making a `fetch` call to a server. The validation engine is built with `async/await` to handle these rules seamlessly, updating the UI to show a "checking" state while waiting for the response.

**Example: An async rule in `validator.js`**
```javascript
const rules = {
    // This function simulates a network request
    isUsernameAvailable: async (value) => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const takenUsernames = ['admin', 'test'];
        return !takenUsernames.includes(value.toLowerCase());
    }
}
```

#### 4. Dynamic UI Feedback

The Inspector Panel is a key feature that is updated entirely through DOM manipulation. JavaScript listens for `focus` events on the form fields. When a field is focused, the Inspector's `innerHTML` is updated to display the relevant rules. Callbacks are used to update the status icons of each rule as the validator runs, providing a clear, step-by-step view of the validation process.

## How to Run

1.  Save all the project files (`index.html`, `style.css`, `script.js`, and `validator.js`) in the same folder.
2.  **Important:** Because this project uses ES6 Modules (`import`/`export`), you must serve the files from a local web server. You cannot just open `index.html` directly from your file system. A simple way to do this is with the "Live Server" extension in VS Code.
3.  Once served, open the local server address (e.g., `http://127.0.0.1:5500`) in your web browser.
```