# Phase 3, Project 6: Visual Feed Curator

This is a personalized and visually-driven news dashboard that allows users to curate and arrange their favorite RSS feeds. Each feed is rendered as a distinct column of image-centric story cards, and the application is built with a resilient fetching mechanism to handle network errors gracefully.

### Key Features

-   **Responsive Grid Dashboard:** Instead of horizontal scrolling, the dashboard uses a responsive CSS Grid layout. Columns automatically wrap to fit the user's screen, ensuring all content is visible.
-   **Resilient Data Fetching:** The application will **automatically retry** fetching a feed up to 3 times with an increasing delay if an error occurs. This makes the app more robust against temporary network issues.
-   **Visual-First Design:** The application parses each article's content to find and display a lead image, creating a "Pinterest-style" visual experience.
-   **Drag-and-Drop Reordering:** Users can physically drag and drop the feed columns to rearrange their dashboard layout to their preference.
-   **Persistent State:** The user's list of feeds and their custom order is saved to `localStorage`.
-   **CORS Handling:** Uses a public CORS proxy to reliably fetch feed data from any server.
-   **XML Parsing:** Uses the browser's native `DOMParser` to process RSS/Atom feeds.
-   **Light/Dark Mode:** A theme switcher allows users to toggle between a light and dark theme, with their choice saved locally.

---

### Core JavaScript Concepts Covered

This project is a comprehensive exercise in fetching, parsing, and displaying data from third-party sources, with a focus on resilience and modern UI patterns.

#### 1. Asynchronous Fetching with Retry Logic

To handle real-world network instability, the `fetchAndParseFeed` function includes a retry loop. If a `fetch` call fails, it doesn't give up immediately. It waits for a moment and tries again, providing a much more robust user experience.

**Example: The retry logic (`script.js`)**

```javascript
async function fetchAndParseFeed(feedUrl, maxRetries = 3) {
    // Loop up to the max number of retries
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const response = await fetch(`${CORS_PROXY}${encodeURIComponent(feedUrl)}`);
            if (!response.ok) throw new Error(`HTTP error!`);
            
            // ... parsing logic ...

            return { feedTitle, items }; // Success! Exit the loop.
        } catch (error) {
            console.error(`Attempt ${attempt} failed for ${feedUrl}`);
            if (attempt === maxRetries) {
                // If this was the last attempt, throw the error to be handled by the UI
                throw error; 
            }
            // Wait for 1s, 2s, etc., before the next attempt
            await new Promise(res => setTimeout(res, attempt * 1000));
        }
    }
}
```

#### 2. XML Parsing with `DOMParser`

Instead of JSON, RSS feeds use XML. This project uses the browser's native `DOMParser` to convert the raw XML string into a DOM-like document that can be queried with standard methods like `querySelector` and `querySelectorAll`.

**Example: Parsing the XML string (`script.js`)**

```javascript
const text = await response.text();
const parser = new DOMParser();
const doc = parser.parseFromString(text, "application/xml");

// Now we can query the 'doc' like a normal HTML document
const feedTitle = doc.querySelector('channel > title')?.textContent;
const items = Array.from(doc.querySelectorAll('item'));
```

#### 3. Dynamic Image Extraction

To create the visual layout, the application parses the HTML content within each article's `<description>` tag to find the first `<img>` element and extract its `src`. This demonstrates practical string parsing and DOM manipulation on fragmented HTML content.

#### 4. The HTML Drag and Drop API

The API is used to make the feed columns themselves re-orderable. The application listens for `dragstart`, `dragover`, and `dragend` events to manage the state of the dragged column and update the underlying `feeds` array to match the new order in the DOM, which is then saved.

### How to Run

1.  Save the three files (`index.html`, `style.css`, `script.js`) in the same folder.
2.  Open `index.html` in your web browser. The application will load with a default set of feeds.