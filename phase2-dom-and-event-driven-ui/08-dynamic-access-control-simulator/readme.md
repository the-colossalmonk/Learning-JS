# Phase 2, Project 7: Dynamic Access Control Simulator

This is a complete visual simulator for a Role-Based Access Control (RBAC) system. The application allows users to dynamically define roles and their permissions on a dashboard, and then immediately test the effects of those rules in a "Secure File Vault" simulation by adding, deleting, and moving files.

### Key Features

-   **Dynamic RBAC Dashboard:** A dedicated panel to create, delete, and manage user roles (e.g., "Admin", "Editor").
-   **Granular Permissions:** Assign specific permissions (e.g., `MOVE_TO_VAULT_1`, `DELETE_FILES`) to each role using a clear and interactive checkbox interface.
-   **Live Simulation:** A visual "File Vault" area where users can "log in" as different roles to see which actions are available to them in real-time.
-   **Full File Management:** Users with the correct permissions can dynamically **add new files** to the simulation and **delete existing ones**.
-   **Drag-and-Drop Interaction:** The core simulation involves physically dragging files between an "Unsecured Desk" and secure "Vaults."
-   **Instant Visual Feedback:** The system provides immediate feedback. Accessible vaults are highlighted, and attempting an unauthorized action triggers a visual "Access Denied" animation.
-   **Live Activity Log:** A running log records every significant action—user logins, file creation/deletion, successful file transfers, and denied access attempts—with timestamps and color-coded status.
-   **Persistent State:** The entire RBAC configuration (roles and files) is saved to `localStorage`, so your custom setup is remembered across browser sessions.
-   **Clean & Professional UI:** A minimalist, pastel-themed design that is easy on the eyes and provides a clear, intuitive user experience with scrollable panels to prevent overflow.

## Technologies Used

-   **HTML5:** For semantic structure and layout, including the use of `<template>` for efficient DOM creation.
-   **CSS3:** For styling and visual feedback, including CSS Grid for the layout and keyframe animations for user feedback.
-   **Vanilla JavaScript (ES6+):** For all application logic.

## Core JavaScript Concepts Showcased

This project serves as a capstone for Phase 2, integrating state management, complex event handling, and a data-driven UI into a single, cohesive system.

#### 1. A Single Source of Truth for State

The entire application is driven by a central `state` object in JavaScript. This object holds all the roles and file locations. Every user interaction modifies this state, and a single `renderAll()` function is called to update the entire UI. This pattern is fundamental to modern web applications and ensures data consistency.

**Example: The core data model (`script.js`)**

```javascript
let state = {
    roles: {
        'Admin': { permissions: ['all'] },
        'Editor': { permissions: ['MOVE_TO_VAULT_1', 'CREATE_FILES'] }
    },
    files: [
        { id: 1, name: 'Project-Alpha.docx', location: 'unsecured-files' }
    ],
    currentLoginRole: 'Admin',
    // ... more state properties ...
};
```

#### 2. Logic-Driven UI Updates

The UI is a direct reflection of the application's logical rules. The core permission check happens during the `drop` event, as well as during file creation and deletion. The application calculates the logged-in role's permissions and compares them against the permission required for the attempted action.

**Example: The permission check on drop (`script.js`)**

```javascript
area.addEventListener('drop', e => {
    // 1. Get the current role's permissions
    const permissions = getRolePermissions(state.currentLoginRole);
    // 2. Get the permission required by the drop target
    const requiredPermission = area.dataset.permissionRequired;

    // 3. The core logic check
    if(permissions.has(requiredPermission)) {
        // ALLOW: Update state, log success, and re-render the UI
    } else {
        // DENY: Trigger visual feedback and log the failure
    }
});
```

#### 3. Data-Driven Dynamic Rendering

No part of the UI is static. The roles list, permissions checkboxes, and files are all generated dynamically from the `state` object. This is achieved by looping through the data and creating HTML elements, often using the efficient `<template>` tag for cloning. This approach makes the application highly maintainable and scalable.

## How to Run Locally

1.  Save the `index.html`, `style.css`, and `script.js` files to a single folder.
2.  Open the `index.html` file in your favorite web browser.