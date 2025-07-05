# Phase 2, Project 7: Class & Skill Tree Architect

This is a visually engaging application for designing and simulating role-based skill trees, inspired by modern RPGs. Users can create character "classes," define their inheritance from one another in a clear hierarchy, and visually unlock skills on a sprawling tree to see how permissions and abilities flow down to child classes in real-time.

This project serves as a comprehensive demonstration of managing complex state, handling advanced user interactions, and dynamically rendering a UI based on a hierarchical data model.

## Live Demo

**(Link to your deployed project would go here)**

## Features

-   **Visual Class Hierarchy:** Create distinct character classes (roles) and use **drag-and-drop** to set up parent-child inheritance relationships. The hierarchy is visually represented with connecting lines.
-   **Interactive Skill Tree:** A large, interactive canvas displays all available skills as a graph. The visual state of each skill (locked, unlockable, directly unlocked, inherited) updates in real-time based on the selected class.
-   **Live Simulation:** A "Character Sheet" panel instantly updates to show all available actions based on the selected class's total skills—both its own and those inherited from its parents.
-   **Skill Point System:** Each class has a limited pool of "skill points," and each skill has a cost. This adds a layer of resource management, preventing users from unlocking skills if they lack the required points.
-   **Data-Driven UI:** The entire application is rendered dynamically from JavaScript objects representing the classes and skills, making the system easy to configure and extend.
-   **Clean, Thematic UI:** A polished, game-inspired dark theme makes the application fun and intuitive to use.

## Technologies Used

-   **HTML5:** Structured with semantic elements and `<template>` tags for efficient DOM cloning.
-   **CSS3:** For styling and layout, including:
    -   CSS Grid for the main three-panel layout.
    -   CSS Variables for easy theming.
    -   Transitions and visual states for interactive feedback.
-   **Vanilla JavaScript (ES6+):** For all application logic, including:
    -   Advanced DOM Manipulation.
    -   The HTML Drag and Drop API.
    -   Dynamic SVG generation for connector lines.
    -   Managing complex, hierarchical state.

## Core JavaScript Concepts Showcased

This project is a capstone for understanding data relationships and UI reactivity, demonstrating several key concepts.

#### 1. Hierarchical State Management

The application is built around a "single source of truth" data model in JavaScript. All user interactions modify this central state (`classes` and `skills` objects), and then a main `renderAll()` function is called to redraw the UI, ensuring consistency across all panels.

**Example: The data structure for classes with inheritance (`script.js`)**

```javascript
let classes = {
    'Warrior': { 
        unlockedSkills: ['slash'], 
        inherits: null, // Top-level class
        skillPoints: 10,
        position: {x: 50, y: 50} 
    },
    'Knight': {
        unlockedSkills: ['heavy-armor'],
        inherits: 'Warrior', // This class inherits all of the Warrior's skills
        skillPoints: 10,
        position: {x: 50, y: 150}
    }
};
```

#### 2. Algorithmic Logic for Inheritance

The most critical logic is the `getTotalSkills(className)` function. It demonstrates a common algorithmic pattern: traversing a hierarchical data structure. To find all skills for a class, it starts with the class's own skills and then "walks up" the `inherits` chain, collecting skills from each parent until it reaches the top. This shows a practical application of graph traversal logic.

**Example: The logic for calculating total inherited skills (`script.js`)**

```javascript
function getTotalSkills(className) {
    if (!classes[className]) return new Set();
    
    // Start with the class's own skills
    let allSkills = new Set(classes[className].unlockedSkills);
    
    // Walk up the inheritance chain
    let currentClass = className;
    while (classes[currentClass] && classes[currentClass].inherits) {
        currentClass = classes[currentClass].inherits;
        // Add the parent's skills to the set
        classes[currentClass].unlockedSkills.forEach(skill => allSkills.add(skill));
    }
    return allSkills;
}
```

#### 3. Dynamic SVG and DOM Rendering

This project renders two different types of graphics in concert:
-   **DOM Elements:** The class and skill "nodes" are HTML `<div>` elements cloned from `<template>` tags for performance. Their positions are managed with CSS.
-   **SVG Elements:** The connector lines are SVG `<line>` elements that are created and have their `x1, y1, x2, y2` attributes updated dynamically based on the positions of the DOM nodes they connect. This demonstrates how to combine and manage both rendering technologies to build a complex UI.

#### 4. The Drag and Drop API

The HTML Drag and Drop API provides an intuitive way for users to define the class hierarchy. By making the class nodes `draggable`, the application can listen for `dragstart` and `drop` events to update the `inherits` property in the central data model, which then triggers a re-render of the entire UI.

## How to Run Locally

1.  Clone this repository:
    ```bash
    git clone https://your-repo-url.com/skill-tree-architect.git
    ```
2.  Navigate to the project directory:
    ```bash
    cd skill-tree-architect
    ```
3.  Open the `index.html` file in your favorite web browser.

No special build tools or dependencies are required.