# Phase 4, Project 8: Particle Light Show

This is an interactive 2D physics sandbox and visual effects engine built entirely with vanilla JavaScript and the HTML Canvas API. It allows users to launch glowing particles onto a canvas where they interact with each other and with user-placed forces, generating beautiful, emergent light shows from their collisions.

The application serves as a comprehensive demonstration of Object-Oriented Programming (OOP) for simulations, a high-performance `requestAnimationFrame` loop for physics and VFX, and the implementation of several physics and visual effect algorithms.

## Live Demo

**(Link to your deployed project would go here)**

![Screenshot of the Particle Light Show in action.](placeholder.png)
*(**Note:** You should replace `placeholder.png` with a screenshot or animated GIF of your actual project for your portfolio.)*

## Features

-   **Interactive Physics Sandbox:** Click and drag to "fling" new particles onto the canvas with an initial velocity.
-   **Realistic Collisions:** Particles collide and bounce off each other and the screen boundaries with realistic momentum transfer.
-   **Dynamic Visual Effects:** Every particle collision generates a **procedural shockwave** and a burst of **sparks**. The size and intensity of these effects are directly determined by the force of the impact.
-   **"Color Zones":** The canvas is divided into invisible vertical zones. Collisions that occur in different zones produce different colored light effects, turning the canvas into a playable visual instrument.
-   **Physics Modifiers:** Users can place **Attractors** (which pull particles in) and **Repulsors** (which push them away) to create complex, swirling patterns and chaotic interactions.
-   **Real-Time Controls:** A dedicated panel allows the user to tweak physics parameters like global gravity and add beautiful "motion trail" effects on the fly.

## Technologies Used

-   **HTML5:** For the `<canvas>` element and the controls panel structure.
-   **CSS3:** For modern styling of the floating controls panel and cursor states.
-   **Vanilla JavaScript (ES6+):** For all application logic, including the physics engine, rendering loop, and Object-Oriented structure.

## Core JavaScript Concepts Showcased

This project is a deep dive into creating a real-time, object-oriented simulation from scratch.

#### 1. `requestAnimationFrame` for a Physics & VFX Loop

The core of the application is a perpetual "game loop" powered by `requestAnimationFrame`. This ensures that physics calculations and canvas rendering happen in a smooth, performant, and efficient manner, synchronized with the browser's display refresh rate.

**Example: The main animation loop (`script.js`)**

```javascript
function animate() {
    // Clear the canvas with a trail effect
    ctx.fillStyle = `rgba(17, 24, 39, ${settings.trailAmount})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Update and draw every object in the simulation
    particles.forEach((p, i) => { p.update(i); p.draw(); });
    forcePoints.forEach(fp => fp.draw());
    vfx.forEach((v, i) => { v.update(); v.draw(); });
    
    // Remove effects that have finished their animation (Garbage Collection)
    vfx = vfx.filter(v => v.life > 0);
    
    requestAnimationFrame(animate);
}
```

#### 2. Object-Oriented Programming (OOP) for Simulation

The application is built around a system of classes, each representing a different type of object in the simulation. This OOP approach makes the complex simulation manageable and scalable.
-   `Particle`: Manages the state (position, velocity, mass) and physics of the main bouncing balls.
-   `ForcePoint`: Represents the static Attractor and Repulsor objects.
-   `Shockwave` & `Spark`: Lightweight classes for the visual effects. Each instance is a "fire-and-forget" effect with a limited lifespan.

#### 3. Physics-Driven Visual Effects

A key feature is the direct link between the physics engine and the VFX engine. When a collision is resolved, the *force of that impact* is calculated and then used to determine the visual properties of the resulting light burst.

**Example: Connecting physics to visuals (`script.js`)**

```javascript
function resolveCollision(p1, p2) {
    // ... calculate momentum transfer ...
    
    // Calculate the magnitude of the collision force
    const impactForce = Math.sqrt(kx*kx + ky*ky); 
    
    // The size of the shockwave is proportional to the impact force
    const shockwaveSize = impactForce * 2;
    // The color is determined by the collision's location
    const color = getCollisionColor(p1.x);

    // Create a new visual effect object
    vfx.push(new Shockwave(p1.x, p1.y, shockwaveSize, color));
    
    // Create extra sparks for very high-force impacts
    if(impactForce > 15) {
        for(let i=0; i < 10; i++) vfx.push(new Spark(p1.x, p1.y, color));
    }
}
```

#### 4. State Management with Multiple Object Pools

The application manages multiple independent arrays of objects (`particles`, `forcePoints`, `vfx`). The main animation loop is responsible for iterating over each of these pools, calling their respective `update` and `draw` methods, and handling the "garbage collection" of temporary effects once their lifespan is over.

## How to Run

1.  Save the three files (`index.html`, `style.css`, `script.js`) in the same folder.
2.  Open `index.html` in your web browser.
3.  Click and drag on the canvas to launch particles. Use the control panel to experiment with different tools and physics settings.
```