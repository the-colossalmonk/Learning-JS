# Phase 3, Project 3: Async Story Generator

An imaginative web application that dynamically generates short story prompts by fetching different story components from various asynchronous sources. The app weaves together a random character, a genre-specific setting, and a unique plot twist to create a surprising story starter.

This project is a practical exercise in handling multiple concurrent API calls and managing asynchronous data to create a cohesive user experience.

### Key Features

-   **Concurrent Data Fetching:** Uses `Promise.all()` to efficiently fetch a random character (from a live API), a setting, and a plot twist all at the same time.
-   **Genre Selection:** Users can choose from different genres (Fantasy, Sci-Fi, Mystery), which then provides settings and plot points appropriate to that theme.
-   **Simulated & Real APIs:** Demonstrates a real-world development scenario by consuming data from both a live external API (`randomuser.me`) and mock async functions that simulate network delay with `setTimeout`.
-   **Typewriter Effect:** Generated stories are revealed with a classic typewriter animation, rendering the text character by character.
-   **Save & View Stories:** Users can save their favorite generated stories, which are persisted in `localStorage`. A library view allows users to revisit or delete their saved tales.
-   **Engaging UI:** A "two-page book" layout provides a clean and immersive interface for generating and reading stories.

---

### Core JavaScript Concepts Covered

This project focuses on the patterns used to manage and orchestrate multiple asynchronous operations.

#### 1. `Promise.all()` for Concurrent Operations

This is the core concept of the project. Instead of waiting for each piece of data to arrive sequentially (a "waterfall"), `Promise.all()` allows us to initiate all three network requests at the same time and wait for all of them to complete. This is significantly more performant.

**Example: The main story generation logic (`script.js`)**

```javascript
async function generateStory() {
    try {
        // Start all three async functions concurrently
        const [character, setting, plot] = await Promise.all([
            fetchCharacter(),
            fetchSetting(selectedGenre),
            fetchPlot(selectedGenre)
        ]);
        
        // This code only runs after all three have successfully resolved
        const storyText = `In a world of swirling chaos, ${character.name} ${setting}, where they ${plot}.`;
        
        displayStory(storyText);
        
    } catch(error) {
        // A single catch block handles an error from any of the promises
        console.error("Error generating story:", error);
    }
}
```

#### 2. Creating Mock Async Functions with `new Promise`

To simulate a real-world environment where you might be waiting for multiple different APIs, this project creates its own promise-based functions using the `new Promise` constructor combined with `setTimeout`. This is a crucial skill for testing and for converting older callback-based functions into modern async/await compatible ones.

**Example: The `fetchSetting` function (`script.js`)**

```javascript
async function fetchSetting(genre) {
    // Wrap the async logic in a new Promise
    return new Promise(resolve => {
        // Simulate a random network delay between 200ms and 700ms
        const delay = Math.random() * 500 + 200;
        
        setTimeout(() => {
            const settings = storyData[genre].settings;
            const randomSetting = settings[Math.floor(Math.random() * settings.length)];
            // When the "work" is done, resolve the promise with the result
            resolve(randomSetting);
        }, delay);
    });
}
```

#### 3. State Management & `localStorage`

The application manages the `currentStory` being displayed and maintains an array of `savedStories`. This entire array is saved to `localStorage` whenever a change is made (saving or deleting a story) and loaded when the page starts, demonstrating state persistence.

#### 4. DOM Manipulation for Dynamic UI

The entire UI is dynamic. A central `switchState` function manages which view is visible (initial, loading, or story display). The typewriter effect is a great example of timed DOM manipulation, using a recursive `setTimeout` loop to append one character at a time to the display element.

### How to Run

1.  Save the three files (`index.html`, `style.css`, `script.js`) in the same folder.
2.  Open `index.html` in your web browser.
3.  Choose a genre and click the "Weave a New Tale" button.