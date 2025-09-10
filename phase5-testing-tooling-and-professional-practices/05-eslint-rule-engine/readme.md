# Phase 5, Project 5: Interactive AST Explorer & Linter

This project is an interactive, in-browser tool that simulates a custom ESLint environment and visualizes the underlying structure of JavaScript code. Users can write code, select from a set of linting rules, create their own custom rules, and instantly see their code analyzed for style violations and potential bugs.

The application's core feature is a three-way interactive binding between the code editor, a live Abstract Syntax Tree (AST) explorer, and a list of linter errors, providing a powerful educational experience for understanding how static code analysis works.

### Key Features

-   **Live Code Editor:** A professional in-browser code editor powered by **CodeMirror**, with JavaScript syntax highlighting and line numbers.
-   **Interactive AST Explorer:** A real-time, visual representation of the code's Abstract Syntax Tree. Hovering over a node in the tree highlights the corresponding code in the editor, and placing the cursor in the code highlights the relevant node in the tree.
-   **Custom Linting Engine:** A simplified ESLint-style rule engine that traverses the AST and applies a set of active rules.
-   **Built-in & Custom Rules:** The linter comes with several pre-built rules (e.g., `no-var`, `no-console-log`). Users can also create their own rules on the fly using a dedicated form.
-   **"Autofix" Functionality:** For applicable rules (like `no-var`), the linter provides a button to automatically fix the violation in the code.
-   **Three-Way Highlighting:** Clicking an error in the error list instantly highlights both the problematic code in the editor and the corresponding node in the AST that triggered the error, making it easy to understand *why* an error occurred.

## Technologies Used

-   **HTML5 & CSS3:** For the three-panel layout and a modern, dark "developer tool" theme.
-   **Vanilla JavaScript (ES6+):** For all application logic, structured into ES6 modules.
-   **CodeMirror.js:** A third-party library for the in-browser code editor.
-   **Acorn.js:** A powerful, industry-standard JavaScript parser used to generate the Abstract Syntax Tree.

## Core JavaScript Concepts Showcased

This project is a deep dive into the tools and concepts that power the modern JavaScript ecosystem.

#### 1. Abstract Syntax Trees (ASTs) & Static Analysis

The core of the project is parsing JavaScript code into an AST and analyzing that structure.
-   The `Acorn.js` library is used to parse a string of code into a standardized AST object.
-   A recursive `renderAstTree` function demonstrates how to traverse this nested object to build a visual representation.
-   This showcases a fundamental understanding of how code is processed by compilers, linters, and bundlers.

#### 2. The Visitor Pattern for AST Traversal

The linter doesn't use fragile regular expressions. Instead, it uses the **Visitor Pattern**, a computer science concept for executing operations on nodes in a tree. Each linting rule defines "visitors" for specific AST node types (e.g., `VariableDeclaration`, `CallExpression`). The linter traverses the tree and invokes these visitors when it encounters a matching node.

**Example: A simplified `no-var` rule (`rules.js`)**
```javascript
'no-var': {
    meta: { description: 'Require `let` or `const` instead of `var`' },
    // The create function returns the visitor object
    create: function(context) {
        return {
            // This function is the "visitor" for VariableDeclaration nodes
            VariableDeclaration(node) {
                if (node.kind === 'var') {
                    context.report({ node, message: 'Use `let` or `const` instead of `var`.' });
                }
            }
        };
    }
}
```

#### 3. Modular & Extensible Architecture

The application is broken down into three clean modules:
-   `rules.js`: Defines the linting rules. It is completely self-contained.
-   `linter.js`: Contains the core engine for parsing and traversing the AST. It knows nothing about the DOM.
-   `script.js`: Acts as the main controller, handling all UI, state, and the orchestration between the other modules.

This separation of concerns makes the application robust, maintainable, and easy to extend with new rules or features.

#### 4. Dynamic Function Creation (`new Function`)

The "Custom Rule Creator" is an advanced feature that allows a user to write rule logic as a string. This string is then safely converted into a real JavaScript function using the `new Function(...)` constructor, demonstrating a powerful metaprogramming concept.

## How to Run

1.  Save all the project files (`index.html`, `style.css`, `script.js`, `linter.js`, and `rules.js`) in the same folder.
2.  **Important:** Because this project uses ES6 Modules (`import`/`export`), you must serve the files from a local web server. You cannot just open `index.html` directly from your file system. A simple way to do this is with the "Live Server" extension in VS Code.
3.  Once served, open the local server address (e.g., `http://127.0.0.1:5500`) in your web browser.
```