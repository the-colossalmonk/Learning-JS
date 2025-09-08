# Phase 4, Project 5: Gravity Sandbox

This is an interactive 2D physics sandbox built entirely with vanilla JavaScript and the HTML Canvas API. It allows users to create and play with particles in a simulated environment, with real-time controls to manipulate physical properties like gravity, bounciness, and mass.

The application serves as a powerful demonstration of Object-Oriented Programming (OOP) principles, the `requestAnimationFrame` loop, and the implementation of complex physics algorithms for collision detection and gravitational attraction.

## Live Demo

**(Link to your deployed project would go here)**

![Screenshot of the Gravity Sandbox in action.](placeholder.png)
*(**Note:** You should replace `placeholder.png` with a screenshot or animated GIF of your actual project for your portfolio.)*

## Features

-   **Dynamic Particle Creation:** Click on the canvas to spawn new particles with random initial velocities.
-   **Realistic Physics Engine:**
    -   Particles accelerate due to a constant global gravitational force.
    -   They bounce realistically off the boundaries of the canvas, losing energy over time according to a "bounciness" factor.
-   **Advanced Physics Simulations (Toggleable):**
    -   **Mutual Gravitation:** Enable N-body simulation where every particle attracts every other particle based on their mass, leading to beautiful orbital mechanics.
    -   **Particle-Particle Collisions:** Enable collisions between particles, with momentum transfer calculated to produce realistic and energetic bounces.
-   **Real-Time Controls:** A dedicated panel allows the user to tweak physics parameters like gravity strength, bounciness, and the mass of new particles on the fly.
-   **Special Tools:** Switch to "Black Hole" mode to spawn massive, stationary particles that exert a powerful gravitational pull on all other objects in the sandbox.

## Technologies Used

-   **HTML5:** For the `<canvas>` element and the controls panel structure.
-   **CSS3:** For modern styling of the floating controls panel.
-   **Vanilla JavaScript (ES6+):** For all application logic, including the physics engine, rendering loop, and Object-Oriented structure.

## Core JavaScript Concepts Showcased

This project is a deep dive into creating a real-time simulation from scratch, focusing on performance and algorithmic logic.

#### 1. `requestAnimationFrame` for a Physics Loop

The core of the application is a perpetual "game loop" powered by `requestAnimationFrame`. This ensures that physics calculations and canvas rendering happen in a smooth, performant, and efficient manner, synchronized with the browser's display refresh rate.

**Example: The main animation loop (`script.js`)**

```javascript
function animate() {
    // 1. Clear the canvas for the new frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 2. Loop through all particles
    particles.forEach((particle, index) => {
        // 3. Update each particle's position based on physics rules
        particle.update(index);
        // 4. Draw the particle in its new position
        particle.draw();
    });
    
    // 5. Request the next frame to continue the loop
    requestAnimationFrame(animate);
}
```

#### 2. Object-Oriented Programming (OOP) with Classes

The simulation is managed using a `Particle` class. This is a fundamental OOP concept where each particle on the screen is an *instance* of this class. Each instance manages its own state (position, velocity, mass, etc.) and contains the methods (`.update()`, `.draw()`) that define its behavior. This makes the code clean, scalable, and easy to manage.

**Example: The `Particle` class structure (`script.js`)**

```javascript
class Particle {
    constructor(x, y, radius, mass, vx, vy) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.mass = mass;
        this.vx = vx;
        this.vy = vy;
    }

    draw() {
        // ... canvas logic to draw a circle at (this.x, this.y) ...
    }

    update(index) {
        // ... all physics calculations to update this.x, this.y, this.vx, this.vy ...
    }
}
```

#### 3. Implementing Physics Algorithms

This project demonstrates how to translate physics formulas into functional code.
-   **Mutual Gravitation:** The N-body simulation requires a nested loop that, for each particle, calculates the gravitational force exerted on it by every other particle. This involves trigonometry (`Math.atan2`, `cos`, `sin`) to resolve the force vector into its X and Y components.
-   **Collision Resolution:** Particle-particle collisions are handled by a function that calculates the conservation of momentum between two colliding objects to determine their new velocities, resulting in realistic and dynamic interactions.

## How to Run Locally

1.  Save the three files (`index.html`, `style.css`, `script.js`) in the same folder.
2.  Open `index.html` in your favorite web browser.
3.  Click on the canvas to start adding particles. Use the control panel to experiment with different physical constants and tools.