# Phase 2, Project 4: Accessible Tab Interface Component

This project is a dynamic and fully accessible character profile viewer, built as a robust, reusable tabbed interface component. It demonstrates how to build a WAI-ARIA compliant tab system that is navigable via both mouse and keyboard, wrapped in a clean, modern, and professional design.

### Key Features

-   **Fully Accessible Tab Interface:** The core of the project is a WAI-ARIA compliant tab system. Character portraits act as `role="tab"` buttons controlling their corresponding profile sheets (`role="tabpanel"`).
-   **Full Keyboard Navigation:** Users can navigate the character selection list using `ArrowLeft`/`ArrowRight` (or `ArrowUp`/`ArrowDown` in vertical mode), as well as `Home` and `End` keys for efficiency.
-   **Data-Driven Content:** All character data is stored in a JavaScript array of objects, and the UI is rendered dynamically, making it easy to add or modify content without changing the HTML.
-   **Dynamic Layouts:** A toggle switch allows the user to change between a horizontal and a vertical layout for the tab list, with keyboard navigation intelligently adapting to the orientation.
-   **Deep Linking with URL Hash:** The page URL updates with a hash (e.g., `#aurora`) when a character is selected, allowing for direct linking to a specific character's profile. The `history.pushState()` API is used to prevent page reloads.
-   **Accessible Modal Windows:** Clicking a character's special ability opens a modal window that follows accessibility best practices: it traps focus and can be closed with the `Escape` key.
-   **Clean, Professional UI:** A minimalist, pastel-themed design with smooth, subtle animations for a polished user experience.

---

### Core JavaScript Concepts Covered

This project focuses on combining accessibility best practices with modern JavaScript techniques to create a professional-grade UI component.

#### 1. WAI-ARIA for Accessibility

The foundation of the project is a deep commitment to accessibility. This is achieved by correctly implementing ARIA (Accessible Rich Internet Applications) roles and properties to give semantic meaning to our custom components, making them understandable to screen readers.

-   `role="tablist"`, `role="tab"`, `role="tabpanel"` define the component structure.
-   `aria-selected="true"` indicates the currently active tab.
-   `aria-controls` links a tab to the panel it controls.
-   `aria-labelledby` links a panel back to its controlling tab.
-   The `hidden` attribute is used to programmatically hide inactive panels, which is the modern and recommended approach for visibility.

#### 2. Advanced Keyboard Event Handling

To ensure the component is fully navigable without a mouse, a `keydown` event listener on the tablist manages all relevant key presses. The logic handles focus management, selection changes, and wrapping around at the beginning/end of the list, adapting automatically to the layout's orientation (horizontal or vertical).

**Example: Handling Arrow Key navigation (`script.js`)**

```javascript
characterSelect.addEventListener('keydown', (e) => {
    const currentTab = document.activeElement;
    let currentIndex = tabs.indexOf(currentTab);
    if(currentIndex === -1) return; // Exit if focus is not on a tab

    let nextIndex = currentIndex;
    const isVertical = appContainer.classList.contains('vertical-layout');
    
    // Check for right/down arrow, wrapping around at the end
    if ((isVertical && e.key === 'ArrowDown') || (!isVertical && e.key === 'ArrowRight')) {
        nextIndex = (currentIndex + 1) % tabs.length;
    } 
    // Check for left/up arrow, wrapping around at the beginning
    else if ((isVertical && e.key === 'ArrowUp') || (!isVertical && e.key === 'ArrowLeft')) {
        nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    }
    // ... logic for Home and End keys ...

    e.preventDefault(); // Prevent default browser action (like scrolling)
    tabs[nextIndex].focus(); // Move focus
    activateTab(tabs[nextIndex]); // Activate the newly focused tab
});
```

#### 3. Managing UI State and Dynamic Rendering

The application's state (e.g., which character is active, which layout is selected) is managed entirely in JavaScript. A central `activateTab` function is responsible for all the necessary steps to update the UI, ensuring that the DOM is always a reflection of the current state.

#### 4. Building Accessible Modals

The "Special Ability" showcase demonstrates how to create a modal window that follows accessibility best practices. This includes:
-   Using `role="dialog"` and `aria-modal="true"`.
-   Programmatically moving focus to an element inside the modal when it opens (e.g., the close button).
-   Closing the modal when the `Escape` key is pressed or when clicking the overlay.

### How to Run

1.  Save the three files (`index.html`, `style.css`, `script.js`) in the same folder.
2.  Open `index.html` in your web browser.