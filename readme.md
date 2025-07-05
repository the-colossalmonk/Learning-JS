# Phase 1: Core JavaScript Fundamentals

**Goal:** Master the language essentials—syntax, data structures, control flow, functions, scope, ES6+ features.

- **Topics Covered:**
    - Variables & data types (primitive vs. reference)
    - Operators, conditionals, loops
    - Functions, arrow functions, rest/spread, default parameters
    - Scope & closures
    - Arrays & objects (destructuring, methods)
    - Modules (import/export)
    - Classes & prototypal inheritance
- **Learning Outcomes:** Write modular, idiomatic ES6+ code; understand execution context and closures; organize code into reusable units.

## Projects

1. **Habit Loop Visualizer**
    - **Brief:** Build an interactive UI that maps “cue → routine → reward” sequences from user input, visualizing each step in real time.
    - **Covers:** Data types, arrays & objects, form handling, dynamic DOM updates.
2. **Dynamic Personality Quiz**
    - **Brief:** Create a branching quiz where each answer choice shapes subsequent questions, with results calculated at the end.
    - **Covers:** Conditionals, functions, event listeners, DOM rendering.
3. **Real-Time Typing Benchmark Tool**
    - **Brief:** Measure and display typing speed & accuracy live as the user types a sample text.
    - **Covers:** String manipulation, `Date` or `performance.now()`, timers (`setInterval`), DOM updates.
4. **Regex Tester Tool**
    - **Brief:** Let users enter regex patterns and test them against sample text, highlighting matches dynamically.
    - **Covers:** `RegExp` API, input handling, real-time feedback via DOM.
5. **CLI Habit Tracker**
    - **Brief:** A Node.js command-line app to log daily habits into JSON files and display streak statistics.
    - **Covers:** File I/O (`fs`), modules (`require`/`import`), JSON parsing, CLI arguments.
6. **Language Flashcard Quizzer**
    - **Brief:** Browser app that randomly quizzes vocabulary from a JSON word list, with spaced-repetition hints.
    - **Covers:** Closures for state, array methods, `setTimeout`/`setInterval`, localStorage persistence.
7. **Emoji Crossword Generator**
    - **Brief:** Build a CLI or browser tool that takes a word list and auto-generates a crossword grid, rendering it in the console or on a `<canvas>`.
    - **Covers:** Shows mastery of arrays, objects, recursion (for fitting words), arrow functions, and modules.

---

# Phase 2: DOM & Event-Driven UI

**Goal:** Manipulate the page, handle events, and create dynamic interfaces without frameworks.

- **Topics Covered:**
    - DOM traversal & manipulation (querySelector, createElement)
    - Event handling & delegation
    - Forms & validation
    - CSSOM & dynamic styling
    - Accessibility basics (ARIA attributes)
    - Drag-and-drop API
- **Learning Outcomes:** Create rich, interactive pages; manage state; build accessible controls.

## Projects

1. **Drag-and-Drop Mood Board**
    - **Brief:** Users import images/text snippets onto a canvas, then drag/resize/rotate items and save layouts.
    - **Covers:** Drag-and-drop API, element creation, CSS transforms, `localStorage`.
2. **Live Tweet Wall**
    - **Brief:** Poll a hashtag via Twitter’s API, display incoming tweets in a rotating grid, allow pinning/favoriting.
    - **Covers:** Fetch + polling, dynamic element creation, state management, event handlers.
3. **Interactive Resume**
    - **Brief:** Build a one-page CV where clicking skills opens detail panels, and scroll-triggered animations reveal sections.
    - **Covers:** Scroll events, CSS animations via JS, ARIA attributes for accessibility.
4. **Accessible Tab Interface**
    - **Brief:** Create a keyboard-navigable tabs component meeting WAI-ARIA guidelines, toggling panels.
    - **Covers:** ARIA roles/states, keyboard event handling, semantic HTML.
5. **Custom Stopwatch w/ Lap Logger**
    - **Brief:** A browser stopwatch that logs lap times in a list, allowing resets and lap comparisons.
    - **Covers:** Closures for encapsulated state, `setInterval`/`clearInterval`, list rendering.
6. **Function Composer Playground**
    - **Brief:** UI to compose simple functions (e.g., `f → g → h`) and see the combined result on sample inputs.
    - **Covers:** Higher-order functions, currying, arrow functions, module imports.
7. **Dynamic Access Control Simulator**
    - **Brief:** Simulate role-based permissions (read/write/delete) with toggleable user roles and resource actions.
    - **Covers:** Factory functions, closures for encapsulating privileges, conditionals, object prototypes.

---

# Phase 3: Asynchronous JS & Data-Driven Apps

**Goal:** Fetch, process, and display data; master promises, async/await, and error handling.

- **Topics Covered:**
    - XMLHttpRequest vs. Fetch API
    - Promises & async/await
    - Error handling patterns
    - JSON parsing
    - RESTful API design basics
    - WebSockets introduction
- **Learning Outcomes:** Build client apps that talk to servers; handle real-time data.

## Projects

1. **Weather Timeline Visualizer**
    - **Brief:** Fetch a 7-day forecast from a weather API and plot highs/lows on a simple canvas line chart.
    - **Covers:** Fetch API, `async`/`await`, JSON parsing, Canvas basics.
2. **Image Loader w/ Retry Logic**
    - **Brief:** Load images with automatic retries on failure, showing “loading”, “error”, or “success” states.
    - **Covers:** Promises, error handling patterns, DOM feedback, exponential backoff logic.
3. **Async Story Generator**
    - **Brief:** Pull random prompts from multiple public APIs (e.g., nouns, verbs, adjectives) and assemble a creative story.
    - **Covers:** Promise.all, fetch chaining, template strings, DOM insertion.
4. **Custom Polling Dashboard**
    - **Brief:** Poll a live data endpoint (crypto prices, stock tickers) every X seconds, updating a table or chart.
    - **Covers:** `setInterval`, clear logic, DOM updates, simple charting on Canvas.
5. **Crypto Price Dashboard**
    - **Brief:** Display real-time cryptocurrency sparklines on Canvas, with interactive hover details.
    - **Covers:** Canvas drawing, periodic fetch, mouse events, data smoothing.
6. **RSS Feed Reader**
    - **Brief:** Input any RSS URL, fetch via a CORS proxy, parse XML to JSON, and display clickable headlines.
    - **Covers:** XML parsing (`DOMParser`), CORS considerations, fetch error handling.
7. **Collaborative Code-Sketch Canvas**
    - **Brief:** A `<canvas>`based doodle board where multiple users draw in real time via WebSockets (e.g., using a simple Node.js server).
    - **Covers:** Covers networking, event broadcasting, JSON protocols.

---

# Phase 4: Canvas & Advanced Browser APIs

**Goal:** Tap into graphics, multimedia, and offline capabilities.

- **Topics Covered:**
    - 2D Canvas API (paths, shapes, images, animations)
    - Audio API (playback, analysis)
    - Geolocation & Maps API
    - Web Storage & IndexedDB
    - Service Workers & PWA basics
- **Learning Outcomes:** Create games, visualizers, and offline-first apps.

## Projects

1. **Collaborative Pixel Painter**
    - **Brief:** Real-time multi-user pixel art on a grid; sync updates via WebSocket or peer connection.
    - **Covers:** 2D Canvas grid drawing, WebSockets, JSON protocols, concurrency handling.
2. **Animated Bar Chart from JSON**
    - **Brief:** Fetch tabular data and animate bars growing to their values on a Canvas chart.
    - **Covers:** Canvas shapes, animation loops (`requestAnimationFrame`), JSON parsing.
3. **Gravity Sandbox**
    - **Brief:** Simulate particles under gravity; allow users to add/move objects with mouse interactions.
    - **Covers:** Physics equations, vector math, Canvas rendering, mouse events.
4. **Maze Generator & Solver**
    - **Brief:** Procedurally generate a maze (e.g., DFS), animate a pathfinder solving it in real time.
    - **Covers:** Recursion, backtracking algorithms, Canvas animation.
5. **Photo Filter Studio**
    - **Brief:** Apply real-time filters (grayscale, sepia, blur) by manipulating Canvas pixel data.
    - **Covers:** `getImageData`/`putImageData`, pixel loops, UI controls.
6. **Geo-Journal**
    - **Brief:** Tag locations with notes on a map (Leaflet/Google Maps), store entries in IndexedDB, work offline via Service Worker.
    - **Covers:** Geolocation API, map integration, IndexedDB, PWA caching.
7. **Particle Orchestra**
    - A visual and audio-reactive particle system: music input drives particle behavior on `<canvas>`, with offline caching via Service Worker so it works even when offline.
    - Demonstrates Canvas animations, AudioContext, PWA.

---

# Phase 5: Testing, Tooling & Professional Practices

**Goal:** Adopt industry standards—testing, bundling, CI/CD, performance tuning.

- **Topics Covered:**
    - Unit testing with Jest / Mocha (no framework code)
    - Linting (ESLint) & formatting (Prettier)
    - Bundling with Rollup or webpack (ESM, code-splitting)
    - Module patterns & lazy loading
    - Performance profiling & optimization (DevTools)
    - Security basics (CSP, XSS prevention)
- **Learning Outcomes:** Ship production-grade JS; ensure quality and performance.

## Projects

1. **Custom Form-Validator Library**
    - **Brief:** Build and publish an npm package for form validation with pluggable rules and full Jest test coverage.
    - **Covers:** Unit testing, semantic versioning, npm publishing, documentation.
2. **CLI File Organizer**
    - **Brief:** Sort files into folders by extension or date via a Node.js CLI, with unit tests for each rule.
    - **Covers:** Node.js CLI (`process.argv`), `fs` operations, Jest/Mocha tests.
3. **Performance Audit Report Generator**
    - **Brief:** Run Lighthouse CLI on a list of URLs and compile scores into a Markdown summary report.
    - **Covers:** Child processes, JSON parsing, file writing, CI integration (GitHub Actions).
4. **Project Template Generator CLI**
    - **Brief:** Scaffold new project boilerplates (HTML/CSS/JS) from custom templates via a command-line tool.
    - **Covers:** File system templating, CLI UX, npm scripts.
5. **Custom ESLint Rule Engine**
    - **Brief:** Write and test your own ESLint rules by parsing ASTs, then publish as a plugin.
    - **Covers:** ESLint plugin API, AST understanding, rule testing frameworks.

---

# Phase 6: Expert Level—Architecture & Patterns

**Goal:** Design large-scale apps, apply advanced JS patterns, integrate with architecture.

- **Topics Covered:**
    - MV* and observer patterns in plain JS
    - State management without frameworks (pub/sub, Flux)
    - Web Components & Custom Elements
    - Worker threads (Web Workers)
    - Security deep-dive (OAuth, JWT handling in front-end)
- **Learning Outcomes:** Architect complex SPAs; encapsulate components; secure advanced flows.

## Projects

1. **Plugin-Driven Dashboard**
    - **Brief:** Create a dashboard that dynamically imports widget modules from a folder and renders them.
    - **Covers:** ES module dynamic `import()`, Web Components, state coordination.
2. **Web Component Blog**
    - **Brief:** Each `<post-card>` is a custom element fetching its own content; supports attributes for styling.
    - **Covers:** Shadow DOM, custom elements API, attribute/property reflection.
3. **Undo/Redo Engine**
    - **Brief:** Implement history state using the Command pattern, allowing actions to be undone/redone.
    - **Covers:** Command pattern, state stack, event dispatching.
4. **Factory & Singleton Explorer**
    - **Brief:** Interactive demo of creating objects via factories and ensuring singletons where needed.
    - **Covers:** Creational patterns, prototypes, module encapsulation.
5. **Multiplayer Trivia Game**
    - **Brief:** Host/join trivia rooms via WebSockets; real-time score updates and lobby chat with secure tokens.
    - **Covers:** Pub/Sub, token authentication, real-time events.

---

# Phase 7: Major Integration & Capstone Projects

## Major Integration Projects

1. **Workflow Automation Tool (Zapier Lite)**
    - **Brief:** Visual flow builder linking triggers (e.g., form submit) to actions (e.g., email send), with node-based UI.
    - **Covers:** Canvas/drag-drop, async workflows, state machines, modular code.
2. **MindMap Builder**
    - **Brief:** Node-based diagram editor for idea mapping; support adding/removing nodes and saving structure.
    - **Covers:** Recursion, Canvas drag interactions, JSON import/export.
3. **Browser-Based Markdown Editor**
    - **Brief:** Split-view editor rendering markdown to HTML live, with localStorage autosave and custom plugins.
    - **Covers:** Regex parsing, DOM diffing, localStorage, modular UI.
4. **Personal Kanban Board**
    - **Brief:** Create columns and cards via drag-and-drop, persist board state in IndexedDB for offline use.
    - **Covers:** Drag-and-drop API, IndexedDB, state sync, PWA caching.
5. **Static Site Generator CLI**
    - **Brief:** Convert markdown files into a static website with templating and asset bundling.
    - **Covers:** Node.js file I/O, templating engines, configuration parsing.
6. **Game Level Editor**
    - **Brief:** Visual tool to layout game tiles/objects on a grid and export JSON level data.
    - **Covers:** Canvas grid snapping, JSON serialization, UI tool panels.

## Capstone Projects

1. **Custom SPA Framework**
    - **Brief:** Build a mini front-end framework with URL routing, templating, and reactive state updates.
    - **Covers:** History API, virtual DOM diffing, pub/sub patterns.
2. **Online Code Execution Playground**
    - **Brief:** Browser IDE to write, run, and display JS code safely in a sandboxed iframe environment.
    - **Covers:** Safe `eval`, iframe communication, module isolation, UI embedding.
3. **Minimalist RTS Game**
    - **Brief:** Control units on a Canvas grid with simple AI pathfinding, resource gathering, and build commands.
    - **Covers:** Game loop, Canvas drawing, basic AI, event handling.
4. **Real-Time Collaborative Whiteboard**
    - **Brief:** Multi-user drawing board syncing strokes via WebSockets, with offline buffering via Service Worker.
    - **Covers:** Canvas APIs, WebSockets, PWA offline sync.
5. **Voice-Controlled App**
    - **Brief:** Execute UI actions (e.g., navigate, form fill) using Web Speech API voice commands and visual feedback.
    - **Covers:** Web Speech API, command parsing, state management.
6. **WebGL 3D Model Viewer**
    - **Brief:** Load and display 3D models (GLTF/OBJ), allow rotate/zoom controls and basic shader effects.
    - **Covers:** WebGL context, buffer shaders, user interaction, 3D math.

---

## Table List

|------|---------|------------------------------|------------------------------------|
| S/No |  Phase  |         Concept Area         |            Project Name            |
|------|---------|------------------------------|------------------------------------|
|  01  | Phase 1 | Fundamentals & Core Syntax   | Habit Loop Visualizer              |
|  02  | Phase 1 | Fundamentals & Core Syntax   | Dynamic Personality Quiz           | 
|  03  | Phase 1 | Fundamentals & Core Syntax   | Real-Time Typing Benchmark Tool    |
|  04  | Phase 1 | Fundamentals & Core Syntax   | Regex Tester Tool                  |
|  05  | Phase 1 | Fundamentals & Core Syntax   | CLI Habit Tracker                  |
|  06  | Phase 1 | Fundamentals & Core Syntax   | Language Flashcard Quizzer         |
|  08  | Phase 2 | DOM & Event-Driven UIs       | Live Tweet Wall                    |
|  07  | Phase 2 | DOM & Event-Driven UIs       | Drag-and-Drop Mood Board           |
|  09  | Phase 2 | DOM & Event-Driven UIs       | Interactive Resume                 |
|  10  | Phase 2 | DOM & Event-Driven UIs       | Accessible Tab Interface           |
|  11  | Phase 2 | DOM & Event-Driven UIs       | Custom Stopwatch w/ Lap Logger     |
|  12  | Phase 2 | DOM & Event-Driven UIs       | Function Composer Playground       |
|  13  | Phase 2 | DOM & Event-Driven UIs       | Dynamic Access Control Simulator   |
|  14  | Phase 3 | Async JS & Networking        | Weather Timeline Visualizer        |
|  15  | Phase 3 | Async JS & Networking        | Image Loader w/ Retry Logic        |
|  16  | Phase 3 | Async JS & Networking        | Async Story Generator              |
|  17  | Phase 3 | Async JS & Networking        | Custom Polling Dashboard           |
|  18  | Phase 3 | Async JS & Networking        | Crypto Price Dashboard             |
|  19  | Phase 3 | Async JS & Networking        | RSS Feed Reader                    |
|  20  | Phase 4 | Canvas & Advanced APIs       | Collaborative Pixel Painter        |
|  21  | Phase 4 | Canvas & Advanced APIs       | Animated Bar Chart                 |
|  22  | Phase 4 | Canvas & Advanced APIs       | Gravity Sandbox                    |
|  23  | Phase 4 | Canvas & Advanced APIs       | Maze Generator & Solver            |
|  24  | Phase 4 | Canvas & Advanced APIs       | Photo Filter Studio                |
|  25  | Phase 4 | Canvas & Advanced APIs       | Geo-Journal                        |
|  26  | Phase 5 | Tooling, Testing & Packaging | Custom Form-Validator Library      |
|  27  | Phase 5 | Tooling, Testing & Packaging | CLI File Organizer                 |
|  28  | Phase 5 | Tooling, Testing & Packaging | Performance Audit Report Generator |
|  29  | Phase 5 | Tooling, Testing & Packaging | Project Template Generator CLI     |
|  30  | Phase 5 | Tooling, Testing & Packaging | Custom ESLint Rule Engine          |
|  31  | Phase 6 | Architecture & Patterns      | Plugin-Driven Dashboard            |
|  32  | Phase 6 | Architecture & Patterns      | Web Component Blog                 |
|  33  | Phase 6 | Architecture & Patterns      | Undo/Redo Engine                   |
|  34  | Phase 6 | Architecture & Patterns      | Factory & Singleton Explorer       |
|  35  | Phase 6 | Architecture & Patterns      | Multiplayer Trivia Game            |
|  36  | Phase 7 | Major Integration Projects   | Workflow Automation Tool           |
|  37  | Phase 7 | Major Integration Projects   | MindMap Builder                    |
|  38  | Phase 7 | Major Integration Projects   | Browser-Based Markdown Editor      |
|  39  | Phase 7 | Major Integration Projects   | Personal Kanban Board              |
|  40  | Phase 7 | Major Integration Projects   | Static Site Generator CLI          |
|  41  | Phase 7 | Major Integration Projects   | Game Level Editor                  |
|  42  | Phase 7 | Capstone Projects            | Custom SPA Framework               |
|  43  | Phase 7 | Capstone Projects            | Online Code Execution Playground   |
|  44  | Phase 7 | Capstone Projects            | Minimalist RTS Game                |
|  45  | Phase 7 | Capstone Projects            | Real-Time Collaborative Whiteboard |
|  46  | Phase 7 | Capstone Projects            | Voice-Controlled App               |
|  47  | Phase 7 | Capstone Projects            | WebGL 3D Model Viewer              |
|------|---------|------------------------------|------------------------------------|