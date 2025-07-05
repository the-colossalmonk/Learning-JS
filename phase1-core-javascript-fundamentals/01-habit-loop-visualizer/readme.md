# Phase 1, Project 1: Habit Loop Visualizer

This is an interactive web application designed to help users define, manage, and visualize their habits based on the four-stage habit loop model: **Cue, Craving, Response, and Reward**. It's a fully-featured single-page application that uses `localStorage` for data persistence, allowing users to create, update, and delete their habits.

### Features

-   **Full CRUD Functionality:** Create, Read, Update, and Delete habits.
-   **Persistent Storage:** All habits are saved to the browser's `localStorage`, so your data is there when you return.
-   **Dynamic Visualizer:** Select any habit from your list to see it beautifully displayed in the four-stage loop with smooth animations.
-   **Live Search:** Instantly filter your list of habits as you type.
-   **Informative Tooltips:** Hover over the "info" icons in the visualizer to get tips on how to build good habits or break bad ones.
-   **Modern & Responsive UI:** A clean, dark-themed interface that works well on different screen sizes.

---

### Core JavaScript Concepts Covered

This project is a great exercise in foundational JavaScript, especially data management and DOM interaction.

#### 1. DOM Manipulation

We extensively manipulate the DOM to create a dynamic user experience. This includes creating elements from scratch, updating their content, and managing their classes.

**Example: Rendering the habit list (`script.js`)**
We dynamically create a `<div>` for each habit object in our `habits` array and inject it into the main list container.

```javascript
// From the renderHabits function
filteredHabits.forEach(habit => {
    // 1. Create a new div element
    const habitItem = document.createElement('div');
    habitItem.className = 'habit-item';
    
    // 2. Set a 'data-id' attribute to easily identify it later
    habitItem.dataset.id = habit.id;

    // 3. Set its inner HTML using template literals for readability
    habitItem.innerHTML = `
        <span class="habit-item-name">${habit.response}</span>
        <div class="habit-item-actions">
            <button class="edit-btn">Edit</button>
            <button class="delete-btn">Delete</button>
        </div>
    `;
    
    // 4. Append the new element to the DOM
    habitList.appendChild(habitItem);
});
```

#### 2. Event Handling & Event Delegation

We listen for user actions like clicks and keyboard input. We use **event delegation** on the habits list, which is more efficient than adding an event listener to every single button. We attach one listener to the parent list and determine which button was clicked from the event object.

**Example: Handling clicks on the habit list (`script.js`)**

```javascript
// A single event listener on the parent list
habitList.addEventListener('click', (event) => {
    const target = event.target;
    // Find the closest parent with the 'habit-item' class
    const habitItem = target.closest('.habit-item');
    if (!habitItem) return; // Exit if the click was not inside a habit item

    const habitId = habitItem.dataset.id;

    // Check if the delete button was clicked
    if (target.classList.contains('delete-btn')) {
        // ... delete logic here ...
    } else if (target.classList.contains('edit-btn')) {
        // ... edit logic here ...
    } else {
        // ... visualization logic here ...
    }
});
```

#### 3. Data Structures: Array of Objects

The core of our application's data is an array of objects. This is a fundamental structure for managing lists of items in JavaScript. Each object represents a single habit with its own properties.

**Example: A sample `habits` array**

```javascript
let habits = [
    {
        id: "1678886400000",
        cue: "Waking up",
        craving: "To feel alert",
        response: "Brew a cup of coffee",
        reward: "Taste and energy boost"
    },
    {
        id: "1678886400001",
        cue: "Feeling stressed at work",
        craving: "A moment of distraction",
        response: "Check social media",
        reward: "Quick dopamine hit"
    }
];
```

#### 4. Array Methods (`forEach`, `filter`, `find`, `findIndex`)

We use modern array methods to manipulate our `habits` array cleanly and efficiently, avoiding complex `for` loops.

-   `filter()`: Used for deleting a habit and for the search functionality.
-   `find()`: Used to locate a specific habit for editing or visualizing.
-   `findIndex()`: Used to find the index of a habit for updating it in the array.

**Example: Deleting a habit using `.filter()` (`script.js`)**

```javascript
// .filter() creates a NEW array containing only the elements that pass the test.
// This is an immutable approach, which is safer than splicing the original array.
habits = habits.filter(h => h.id !== habitId);
```

#### 5. Browser Storage API (`localStorage`)

To make the app useful, we persist the user's data. `localStorage` allows us to save the `habits` array in the user's browser. Since `localStorage` can only store strings, we use `JSON.stringify()` to save and `JSON.parse()` to retrieve the data.

**Example: Saving and Loading (`script.js`)**

```javascript
// Function to save the entire habits array to localStorage
const saveToLocalStorage = () => {
    // Convert the array of objects into a JSON string
    localStorage.setItem('habits', JSON.stringify(habits));
};

// Function to load and parse data when the app starts
const loadFromLocalStorage = () => {
    const storedHabits = localStorage.getItem('habits');
    if (storedHabits) {
        // Convert the JSON string back into a JavaScript array/object
        habits = JSON.parse(storedHabits);
    }
};
```

### How to Run

1.  Save the three files (`index.html`, `style.css`, `script.js`) in the same folder.
2.  Open the `index.html` file in your web browser.

That's it! You can now start adding and managing your habits.