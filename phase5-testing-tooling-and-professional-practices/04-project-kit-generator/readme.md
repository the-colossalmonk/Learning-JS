# Phase 5, Project 4: Web Project Scaffolding Tool

This is an advanced, browser-based scaffolding tool that generates a downloadable `.zip` file for a variety of modern frontend projects. Users can interactively select a base framework, choose between JavaScript/TypeScript, and layer in features like Tailwind CSS to create a complex, custom-tailored starter kit.

The application demonstrates a professional, modular architecture for building configurable systems and showcases how to handle complex file generation entirely on the client-side.

## Live Demo

**(Link to your deployed project would go here)**

## Key Features

-   **Multiple Templates:** Choose from different starter templates, including **Vanilla JS**, **React**, and **Three.js**.
-   **Combinatorial Options:** Select a language (**JavaScript/JSX** or **TypeScript/TSX**) and add-on features like **Tailwind CSS** or **Prettier**. The UI intelligently enables/disables options based on framework choice.
-   **Live File Preview:** A side panel displays a real-time preview of the project's file and folder structure as you change the configuration.
-   **Client-Side Zip Generation:** The entire `.zip` archive is created in the browser using the `JSZip` library. No server is required.
-   **Shareable Configurations:** A "Copy Share Link" button generates a unique URL with your chosen settings encoded as query parameters, allowing you to share a specific starter kit configuration with others.
-   **Installation Simulation:** A polished "fake terminal" modal simulates the `npm install` process after generation, enhancing the user experience and providing a professional feel.
-   **Configuration Presets:** One-click buttons to instantly load common configurations like "React + TS + Tailwind", streamlining the setup process.

## Technologies Used

-   **HTML5 & CSS3:** For the structure and a clean, responsive, multi-panel layout.
-   **Vanilla JavaScript (ES6+):** For all application logic, including the modular generation engine, state management, and DOM manipulation.
-   **JSZip:** A third-party library for creating `.zip` files entirely on the client-side.

## Core JavaScript Concepts Showcased

This project demonstrates a professional, modular architecture for building complex, configurable applications.

#### 1. Modular Generation Engine

Instead of relying on a few large, static templates, the application uses a modular engine to build projects piece by piece. A central `generateZip` function orchestrates calls to smaller, specialized functions (`addReactFiles`, `addTailwindConfig`, etc.) based on the user's live configuration. This is a highly scalable and maintainable pattern for handling combinatorial complexity.

#### 2. Dynamic Dependency Management

The `package.json` file for each generated project is created dynamically. The script maintains a map of dependencies for each feature (React, Tailwind, TypeScript, etc.) and programmatically merges them together based on the user's choices. This demonstrates a deep understanding of how modern frontend projects are structured and managed.

**Example: Generating the `package.json` (`script.js`)**
```javascript
function getDependencies(config) {
    let deps = {}, devDeps = {};
    
    // Base dev dependency
    Object.assign(devDeps, dependencies.vite);
    
    // Conditionally add dependencies based on config
    if (config.framework === 'react') {
        Object.assign(deps, dependencies.react);
        Object.assign(devDeps, dependencies.reactDev);
    }
    if (config.features.has('tailwind')) {
        Object.assign(devDeps, dependencies.tailwind);
    }
    if (config.language === 'ts') {
        Object.assign(devDeps, dependencies.typescript);
    }
    return { dependencies: deps, devDependencies: devDeps };
}

function generatePackageJson(config) {
    const { dependencies, devDependencies } = getDependencies(config);
    const packageJson = {
        name: config.projectName,
        // ... scripts, etc.
        dependencies,
        devDependencies,
    };
    return JSON.stringify(packageJson, null, 2);
}
```

#### 3. State Management with URL Parameters

The "Share" feature is a great example of storing application state in the URL. The user's entire configuration is serialized into URL query parameters. The application can then read these parameters on page load to reconstruct the same configuration, demonstrating a powerful and stateless way to share application state.

**Example: Generating the share link (`script.js`)**
```javascript
shareBtn.addEventListener('click', () => {
    const config = getFormConfig();
    const params = new URLSearchParams();
    params.set('projectName', config.projectName);
    params.set('framework', config.framework);
    // ... add language and features
    
    const shareUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    navigator.clipboard.writeText(shareUrl);
});
```

#### 4. Client-Side File Handling (`JSZip`, Blobs)

After `JSZip` generates the archive, it's represented as a `Blob` (Binary Large Object) in JavaScript. To make this downloadable, we use `URL.createObjectURL(blob)`. This creates a temporary, local URL for the binary data, which we can then assign to an invisible `<a>` tag and programmatically click to trigger a browser download, all without server interaction.

## How to Run

1.  Save the three files (`index.html`, `style.css`, `script.js`) in the same folder.
2.  Open `index.html` in your web browser. No local server is required for this project.
```