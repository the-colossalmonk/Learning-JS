# Interactive Resume Project

This project transforms a standard, static resume into a dynamic, engaging, and interactive single-page application. It's designed to showcase professional skills and experience in a modern, memorable way by incorporating several advanced DOM manipulation and event handling techniques.

This resume is not just a document; it's a demonstration of frontend development capabilities.

## Live Demo

**(Link to your deployed project would go here)**

## Features

-   **Data-Driven Content:** All resume content (skills, projects, experience) is loaded from structured JavaScript objects, making it incredibly easy to update and maintain without touching the HTML.
-   **Interactive Project Filtering:** Users can filter the project portfolio by technology tags (e.g., "JS", "React"), with smooth CSS transitions for showing and hiding portfolio cards.
-   **Expandable Sections:** Work experience details are neatly tucked away and can be revealed with a smooth accordion-style animation on click, keeping the UI clean.
-   **"Secret" Command-Line Terminal:** A fun, interactive terminal allows users to type commands like `help`, `contact`, and `skills --all` to discover information in a developer-friendly way.
-   **Animated Skill Bars:** Skill proficiency bars dynamically animate into view only when they are scrolled into the viewport, implemented efficiently with the modern `Intersection Observer API`.
-   **Light/Dark Mode Theme Switcher:** A sleek toggle allows users to switch between a light and dark theme. The user's preference is saved to `localStorage` and remembered on their next visit.
-   **Print-Friendly Version:** The application is styled with `@media print` to automatically format into a clean, traditional, paper-friendly layout when printed, hiding all interactive UI elements.

## Technologies Used

-   **HTML5:** For semantic structure.
-   **CSS3:** For modern styling, including:
    -   CSS Variables for easy theming (Light/Dark mode).
    -   Flexbox and CSS Grid for layout.
    -   Transitions and Keyframe Animations for a smooth user experience.
    -   `@media print` for a print-optimized stylesheet.
-   **Vanilla JavaScript (ES6+):** For all interactivity and logic, including:
    -   Advanced DOM Manipulation.
    -   Event Delegation.
    -   The `Intersection Observer API`.
    -   `localStorage` for state persistence.

## Core JavaScript Concepts Showcased

This project is a comprehensive exercise in creating a data-driven, single-page application and demonstrates proficiency in several key JavaScript concepts.

#### 1. Data-Driven DOM Generation

The entire resume is built dynamically from JavaScript arrays of objects. Functions like `renderProjects()` loop through this data and use template literals to generate the necessary HTML. This "separation of concerns" is a fundamental principle of modern web development and showcases the ability to work with data structures.

**Example: Rendering project cards from a data array (`script.js`)**

```javascript
const projectsData = [
    { title: 'Interactive Canvas', tags: ['JS', 'CSS'] /* ... */ },
    { title: 'Live Tweet Wall', tags: ['JS'] /* ... */ }
];

function renderProjects(filter = 'All') {
    const filteredProjects = projectsData.filter(p => filter === 'All' || p.tags.includes(filter));
    projectGrid.innerHTML = filteredProjects.map(project => `
        <div class="project-card" data-tags="${project.tags.join(',')}">
            <h3>${project.title}</h3>
            <!-- ... more HTML from project data ... -->
        </div>
    `).join('');
}
```

#### 2. Event Delegation for Efficient Filtering

To handle the project filtering, a single `click` listener is attached to the parent `filters` container. When a button is clicked, the event "bubbles up" to the container. The handler then inspects `event.target` to determine which filter was clicked. This is a highly performant and scalable pattern compared to adding a separate listener to every single button.

**Example: The delegated filter handler (`script.js`)**

```javascript
projectFilters.addEventListener('click', (e) => {
    // Check if the clicked element is actually a filter button
    if (e.target.classList.contains('filter-btn')) {
        const filter = e.target.dataset.filter;
        renderProjects(filter);
    }
});
```

#### 3. The Intersection Observer API

This modern browser API provides an efficient way to detect when an element enters the screen (the "viewport"). It's used here to trigger the skill bar animations only when the user scrolls down to the skills section, which is much more performant than using traditional, resource-intensive scroll event listeners.

**Example: Observing the skill bars (`script.js`)**

```javascript
// 1. Create the observer with a callback function
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        // 2. If the element is now intersecting the viewport...
        if (entry.isIntersecting) {
            const skillLevel = entry.target;
            // 3. Trigger the animation and then stop observing it to prevent re-animation
            skillLevel.style.width = `${skillLevel.dataset.level}%`;
            observer.unobserve(skillLevel);
        }
    });
}, { threshold: 0.5 }); // Trigger when 50% of the element is visible

// 4. Tell the observer which elements to watch
document.querySelectorAll('.skill-level').forEach(bar => {
    observer.observe(bar);
});
```

#### 4. Keyboard Events & State Persistence

The terminal demonstrates handling `keydown` events to capture user input and execute commands. The theme switcher showcases using `localStorage` to save a user's preference (`'light'` or `'dark'`), so it's remembered the next time they visit the page, demonstrating an understanding of client-side storage.

## How to Run Locally

1.  Clone this repository:
    ```bash
    git clone https://your-repo-url.com/interactive-resume.git
    ```
2.  Navigate to the project directory:
    ```bash
    cd interactive-resume
    ```
3.  Open the `index.html` file in your favorite web browser.

No special build tools or dependencies are required.

## Future Improvements

-   **Add more terminal commands:** Include fun Easter eggs or more detailed project descriptions.
-   **Refactor to a Framework:** Rebuild the project using a modern framework like React or Vue to compare the vanilla JS approach to a component-based one.
-   **Load data from a JSON file:** Use `fetch()` to load the resume data from an external JSON file instead of having it hardcoded in the script.