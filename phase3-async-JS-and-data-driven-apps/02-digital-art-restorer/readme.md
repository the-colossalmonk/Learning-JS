# Phase 3, Project 2: The Digital Art Restorer

An elegant and resilient art gallery application that demonstrates robust asynchronous JavaScript patterns. The user acts as a digital art restorer, initiating the "restoration" of a gallery of faded artworks. The application simulates a real-world scenario where network requests can fail, and handles these issues gracefully with user-controlled retries, cancellation, and a concurrent request manager.

### Key Features

-   **Individual & Global Controls:** Users can restore artworks one by one, or reset and restore the entire gallery at once with a master button.
-   **Full Lifecycle:** Successfully restored artworks can be "re-restored," resetting them to their initial state for repeated demonstrations.
-   **Concurrent Downloads:** The application uses a "worker pool" to limit the number of images being restored simultaneously (e.g., 3 at a time), preventing the browser from being overloaded.
-   **Promise-Based Logic:** The core image loader is wrapped in a `Promise`, converting the classic event-based `Image` object into a modern, `async/await`-friendly component.
-   **Resilience & Retry Logic:** Failed image loads don't break the application. Instead, the UI updates to a "failed" state, allowing the user to manually trigger a retry.
-   **Exponential Backoff:** The delay between internal retries increases exponentially (e.g., 1s, 2s, 4s), a standard industry practice for handling temporary server issues.
-   **Cancellation:** In-progress restorations can be cancelled by the user at any time, immediately freeing up a worker slot for the next image in the queue.
-   **Elegant UI & Animations:** The application features a clean, professional UI with distinct visual states for each image: pending, restoring, success, and failed.

---

### Core JavaScript Concepts Covered

This project is a deep dive into building resilient asynchronous systems, a critical skill for modern web development.

#### 1. The `Promise` Constructor & Async Simulation

The foundation of the project is a custom `loadImage` function that manually creates a `new Promise`. This wraps the `Image` object's `onload` and `onerror` events. Crucially, it also includes a `Math.random()` check to **simulate network failures** and a long, variable delay, allowing for reliable testing of the retry and cancellation logic.

**Example: The Promise-based image loader (`script.js`)**

```javascript
function loadImage(url, signal) {
    return new Promise((resolve, reject) => {
        // ... promise logic with onload, onerror, and abort handlers ...
        
        // Simulate a long and random network delay before starting the load
        const delay = Math.random() * 3000 + 1000;
        setTimeout(() => {
            if (signal.aborted) return;
            if (Math.random() < FAILURE_CHANCE) img.onerror();
            else img.src = url;
        }, delay);
    });
}
```

#### 2. Async/Await with `try...catch` for Retry Logic

The retry mechanism is built inside an `async` function using a `for` loop and a `try...catch` block. This modern syntax makes the complex flow of "try, catch, wait, repeat" clean and readable.

**Example: The `loadImageWithRetry` function (`script.js`)**

```javascript
async function loadImageWithRetry(imageState) {
    let delay = 1000;
    for (let i = 0; i <= MAX_RETRIES; i++) {
        try {
            const img = await loadImage(imageState.url, imageState.abortController.signal);
            // ... handle success ...
            return;
        } catch (error) {
            if (error.name === 'AbortError') return; // Exit if cancelled
            // On failure, wait for the calculated delay (exponential backoff)
            await wait(delay);
            delay *= 2;
        }
    }
    // ... handle final failure ...
}
```

#### 3. Managing Concurrency (The Worker Pool Pattern)

A `LoadManager` class is implemented to manage a queue of jobs and ensure that only a limited number of `async` operations are running concurrently. When a "worker" finishes, it automatically picks up the next job from the queue. This is a fundamental pattern for building high-performance applications.

**Example: The `LoadManager` logic (`script.js`)**

```javascript
class LoadManager {
    constructor(limit) { /* ... */ }
    addJob(job) { /* ... */ }
    tryStartNext() {
        while (this.activeCount < this.limit && this.queue.length > 0) {
            this.activeCount++;
            const job = this.queue.shift();
            loadImageWithRetry(job).finally(() => {
                this.activeCount--;
                this.tryStartNext();
            });
        }
    }
}
```

### How to Run

1.  Save the three files (`index.html`, `style.css`, `script.js`) in the same folder.
2.  Open `index.html` in your web browser.
3.  Click the "Restore" button on any artwork card, or use the "Reset & Restore All" button to start the simulation for all images.
```