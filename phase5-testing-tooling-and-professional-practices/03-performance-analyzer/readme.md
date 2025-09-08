# Phase 5, Project 3: Real Frontend Performance Analyzer

This is a browser-based tool that analyzes any public website's frontend performance characteristics. The application fetches a site's raw HTML, analyzes its structure for common performance and accessibility issues, and generates a beautiful, professional report with scores, simulated Core Web Vitals, and actionable advice.

This project serves as a comprehensive demonstration of professional JavaScript practices, including a multi-file modular architecture, asynchronous programming, and data-driven UI generation.

## Live Demo

**(Link to your deployed project would go here)**

## Features

-   **Real HTML Analysis:** Analyzes any publicly accessible URL by fetching its HTML using a CORS proxy.
-   **Comprehensive Diagnostics:** The analyzer checks for common frontend best-practice violations, such as:
    -   Images missing `width`, `height`, or `alt` attributes.
    -   Render-blocking `<script>` tags without `async` or `defer`.
    -   Missing `<meta name="viewport">` tags.
-   **Dynamic Report Generation:** The entire report is generated dynamically based on the results of the analysis.
-   **Canvas Score Gauges:** Performance and Accessibility scores are visualized with custom, animated circular gauges drawn on the HTML `<canvas>`. The gauges are color-coded based on the score.
-   **Historical Comparison:** The application uses `localStorage` to save the results of previous audits. When you re-analyze a URL, the report shows the new score alongside the old one, with a clear indicator of improvement or regression.
-   **Printable Reports:** A "Export as PDF" button uses the `window.print()` method and a custom print stylesheet (`@media print`) to generate a clean, professional, paper-friendly version of the report.
-   **Modular Architecture:** The codebase is cleanly separated into three distinct modules:
    -   `analyzer.js`: Handles all data fetching and analysis logic.
    -   `reporter.js`: Handles all presentation logic and HTML generation.
    -   `script.js`: Acts as the main controller, orchestrating the other modules.

## Technologies Used

-   **HTML5 & CSS3:** For the structure and a professional, responsive "tech-dashboard" design.
-   **Vanilla JavaScript (ES6+):** For all application logic, demonstrating:
    -   ES6 Modules (`import`/`export`).
    -   `async/await` for asynchronous operations.
    -   The `DOMParser` API for analyzing HTML.
    -   The HTML Canvas API for data visualization.
    -   `localStorage` for state persistence.

## Core JavaScript Concepts Showcased

This project highlights how to structure a professional, maintainable JavaScript application and how to solve real-world frontend challenges.

#### 1. Modular Architecture with ES6 Modules

The application is broken down into logical, single-responsibility modules. This is a fundamental professional practice that makes code easier to read, maintain, and test.
-   `analyzer.js` is only concerned with the "business logic" of fetching and analyzing data. It knows nothing about the DOM.
-   `reporter.js` is only concerned with presentation. It takes a data object and transforms it into HTML.
-   `script.js` acts as the orchestrator, connecting user events to the other modules.

**Example: The main orchestration flow (`script.js`)**
```javascript
import { analyzeUrl } from './analyzer.js';
import { generateReportHTML, drawGauges } from './reporter.js';

async function runAudit(e) {
    // ...
    try {
        // 1. Get data from the analyzer module
        const auditData = await analyzeUrl(url);
        
        // 2. Pass data to the reporter module to get HTML
        const reportHTML = generateReportHTML(auditData);

        // 3. Update the DOM
        reportContainer.innerHTML = reportHTML;
        
        // 4. Trigger canvas drawing now that elements are in the DOM
        drawGauges();
        
    } catch (error) {
        // ...
    }
}
```

#### 2. Solving CORS with a Proxy

To analyze a third-party website, the application must fetch its HTML. This is typically blocked by the browser's Cross-Origin Resource Sharing (CORS) policy. This project demonstrates the standard industry solution: using a CORS proxy. The application prepends the target URL to a proxy service's URL, which fetches the data on its server and forwards it with the correct headers.

#### 3. DOM Parsing with `DOMParser`

After fetching the raw HTML as a string, the application uses the browser's built-in `DOMParser` to turn that string into a full, queryable DOM document. This allows the use of standard methods like `querySelectorAll` to find and analyze elements, a powerful technique for web scraping and analysis.

**Example: Analyzing images (`analyzer.js`)**
```javascript
// htmlString contains the full HTML of the target site
const doc = new DOMParser().parseFromString(htmlString, 'text/html');

// Now we can use standard DOM methods on the parsed document
const images = Array.from(doc.querySelectorAll('img'));
const missingAlt = images.filter(img => !img.alt).length;
```

#### 4. Dynamic Canvas Rendering for Data Visualization

The score gauges are not static images; they are `<canvas>` elements drawn dynamically with JavaScript. A `drawGauge` function takes a score and uses the Canvas 2D API to draw arcs and text, providing a rich, animated data visualization that is more engaging than a simple number.

## How to Run

1.  Save the four files (`index.html`, `style.css`, `script.js`, `analyzer.js`, and `reporter.js`) in the same folder.
2.  **Important:** Because this project uses ES6 Modules, you must serve the files from a local web server. You cannot just open `index.html` directly from your file system. A simple way to do this is with the "Live Server" extension in VS Code.
3.  Once served, open the local server address (e.g., `http://127.0.0.1:5500`) in your web browser.
4.  Enter a public URL (e.g., `https://www.google.com`) and click "Analyze."
```