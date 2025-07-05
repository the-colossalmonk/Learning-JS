# Phase 2, Project 2: Live Tweet Wall

This is a dynamic and visually engaging web application that simulates a live feed of tweets for a fictional event. New "tweets" dynamically appear at the top of a multi-column wall with a smooth animation, creating the feel of a real-time social media display.

### Key Features

-   **Live Feed Simulation:** New tweets are added to the top of the feed automatically every few seconds using `setInterval`.
-   **Masonry Layout:** A modern, multi-column CSS layout (`column-count`) creates a visually appealing "wall" where tweets flow naturally.
-   **Smooth Animations:** Newly added tweets fade and slide into view gracefully using CSS keyframe animations.
-   **Interactive Tweet Cards:** Users can "Like" and "Retweet" individual posts, with visual feedback and counter updates.
-   **Live Filtering:** A search bar allows users to filter the entire wall in real-time by keyword.
-   **Pause/Play Control:** A dedicated button lets the user pause and resume the live feed.

---

### Core JavaScript Concepts Covered

This project is an excellent exercise in managing timed events, dynamically creating content, and handling user interactions on that content.

#### 1. Timing Functions (`setInterval` and `clearInterval`)

The core of the "live" simulation is `setInterval`. This function repeatedly calls a function to add a new tweet to the wall. The state of this interval (whether it's running or not) is managed to implement the pause/play functionality.

**Example: Managing the feed interval (`script.js`)**

```javascript
let tweetInterval; // Stores the interval ID
let isPaused = false;

function startFeed() {
    // Only start a new interval if one isn't already running
    if (!tweetInterval) {
        tweetInterval = setInterval(addNewTweet, 3000);
    }
}

function stopFeed() {
    clearInterval(tweetInterval);
    tweetInterval = null; // Clear the ID
}

pausePlayBtn.addEventListener('click', () => {
    isPaused = !isPaused;
    if (isPaused) {
        stopFeed();
        pausePlayBtn.textContent = 'Play';
    } else {
        startFeed();
        pausePlayBtn.textContent = 'Pause';
    }
});
```

#### 2. Dynamic DOM Manipulation (`createElement`, `prepend`)

Instead of being hardcoded in HTML, every tweet card is created dynamically in JavaScript from a mock data object. This separates data from presentation. The `element.prepend()` method is used to add new tweets to the beginning of the feed container, which is the expected behavior for a live feed.

**Example: The `createTweetElement` function (`script.js`)**

```javascript
function createTweetElement(tweetData) {
    // 1. Create the main container
    const tweetCard = document.createElement('div');
    tweetCard.className = 'tweet-card new-tweet';
    
    // 2. Populate its content using a template literal
    tweetCard.innerHTML = `
        <div class="tweet-header">
            <img src="${tweetData.avatar}" alt="avatar" class="avatar">
            <div class="user-info">
                <span class="user-name">${tweetData.user}</span>
                <span class="user-handle">${tweetData.handle}</span>
            </div>
        </div>
        // ... more HTML ...
    `;

    // 3. Return the fully formed element
    return tweetCard;
}

// Later, this element is added to the DOM
tweetWall.prepend(tweetElement);
```

#### 3. Event Delegation

Because tweets are created dynamically, we can't add event listeners to their "Like" buttons directly when the page loads. Instead, we add a single `click` listener to the parent `tweetWall` container. When a click occurs, we check if the `event.target` was a like or retweet button and then perform the action. This is a highly efficient pattern for handling events on dynamic content.

**Example: The delegated event listener (`script.js`)**

```javascript
tweetWall.addEventListener('click', (e) => {
    // Check if the clicked element (or its parent) is a like button
    const likeBtn = e.target.closest('.like-btn');
    if (likeBtn) {
        // ... handle the like action ...
    }
});
```

### How to Run

1.  Save the three files (`index.html`, `style.css`, `script.js`) in the same folder.
2.  Open `index.html` in your web browser.