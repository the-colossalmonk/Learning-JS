# Phase 1, Project 5: Habit Tracker

This is a clean and motivational web application for tracking daily habits. It allows users to add custom habits, assign a color to each, and mark their daily progress on a visually satisfying, calendar-style grid. The application persists all data in the browser's `localStorage`.

### Key Features

-   **Dynamic Monthly Grid:** The tracker displays a grid for the currently selected month, automatically adjusting the number of days.
-   **Habit CRUD:** Users can easily add new habits, assign them a unique color, and delete them.
-   **Click to Complete:** Simply click a cell in the grid to mark a habit as complete for that day. The cell fills with the habit's assigned color.
-   **Streak Calculation:** The application automatically calculates and displays the current streak (consecutive days completed) for each habit, providing a powerful motivational boost.
-   **Month Navigation:** Easily navigate between months to view past progress or plan for the future.
-   **Persistent Storage:** All habits and their completion data are saved in the browser's `localStorage`, so your progress is never lost.
-   **Clean, Responsive UI:** A modern, minimalist interface built with CSS Grid that is easy to use and visually appealing.

---

### Core JavaScript Concepts Covered

This project is a significant step up, introducing date manipulation alongside robust data management.

#### 1. The `Date` Object

This is the central concept of the project. We use the `Date` object to determine the current month and year, calculate the number of days in that month, and handle month-to-month navigation. Dates are stored as standardized strings (`YYYY-MM-DD`) for easy comparison.

**Example: Generating the grid based on the current month (`script.js`)**

```javascript
function render() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Gets the number of days in the current month.
    // Setting day to 0 in the next month gives us the last day of the current month.
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Loop from 1 to daysInMonth to create a grid cell for each day
    for (let day = 1; day <= daysInMonth; day++) {
        // Create a standardized date string for data attributes and storage
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        // ... create a cell and add a data-date attribute with dateStr ...
    }
}
```

#### 2. Data-Driven UI with CRUD

The entire UI is generated dynamically from the `habits` array. A single `render()` function is responsible for drawing the entire grid. Any change to the `habits` data (adding, deleting, or updating a habit) is followed by a call to `render()`, ensuring the UI is always in sync with the data.

**Example: The core data structure (`script.js`)**

```javascript
let habits = [
    {
        id: 1678886400000,
        name: "Read for 15 mins",
        color: "#818cf8",
        datesCompleted: ["2023-10-26", "2023-10-27"]
    },
    {
        id: 1678886400001,
        name: "Morning walk",
        color: "#68d391",
        datesCompleted: ["2023-10-27"]
    }
];
```

#### 3. Algorithmic Logic (Streak Calculation)

Calculating the streak is a small but interesting algorithmic challenge. It involves mapping the date strings to `Date` objects, sorting them in descending order, and then iterating through them to check for consecutive days relative to today.

**Example: The `calculateStreak` function logic (`script.js`)**

```javascript
function calculateStreak(datesCompleted) {
    if (datesCompleted.length === 0) return 0;
    
    let streak = 0;
    // 1. Convert strings to Date objects and sort them newest to oldest
    const sortedDates = datesCompleted.map(d => new Date(d)).sort((a, b) => b - a);
    
    // 2. Normalize today's date and check if the streak is broken
    const today = new Date();
    // ... logic to check if last completion was more than 1 day ago ...

    // 3. Loop through sorted dates, decrementing a checker date
    // and incrementing the streak for each consecutive day found.
    let currentDateToCheck = new Date(today);
    for (const date of sortedDates) {
        if (date.getTime() === currentDateToCheck.getTime()) {
            streak++;
            currentDateToCheck.setDate(currentDateToCheck.getDate() - 1);
        } else if (date < currentDateToCheck) {
            break; // A gap was found, end the loop
        }
    }
    return streak;
}
```

#### 4. Event Delegation

Instead of adding hundreds of event listeners (one for each cell), we add a single listener to the main grid container (`#habit-tracker`). When a click occurs, we inspect `event.target` to see if it was a completion cell or a delete button and get its `data-*` attributes to identify the specific habit and date. This is far more efficient.

### How to Run

1.  Save the three files (`index.html`, `style.css`, `script.js`) in the same folder.
2.  Open `index.html` in your web browser.