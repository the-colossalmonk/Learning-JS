# Phase 4, Project 6: Maze Generator & Solver

This is an interactive visualization tool that algorithmically generates and solves mazes using a variety of famous algorithms. The application is built entirely with vanilla JavaScript and uses the HTML Canvas API to render the maze and animate the algorithms in real-time, providing a visual demonstration of how they work.

## Live Demo

**(Link to your deployed project would go here)**

## Features

-   **Multiple Generation Algorithms:** Users can choose between three classic maze generation algorithms, each producing a maze with a distinct structure and aesthetic:
    -   **Randomized Depth-First Search:** Creates long, winding paths with few branches.
    -   **Prim's Algorithm:** Grows the maze like a tree, resulting in many short dead ends.
    -   **Kruskal's Algorithm:** Creates a uniform maze by randomly connecting cell sets, often resulting in many short paths.
-   **Multiple Solving Algorithms:** Users can select different algorithms to find the path from the start to the finish:
    -   **Breadth-First Search (BFS):** Finds the absolute shortest path. Visualized with a "heatmap" effect.
    -   **A* (A-Star) Search:** A famous "informed" search algorithm that uses heuristics (Manhattan distance) to intelligently find the shortest path, often exploring fewer cells than BFS.
    -   **Depth-First Search (DFS):** Finds *a* path, but not necessarily the shortest one.
-   **Step-by-Step Animation:** Watch the algorithms work in real-time. The generation and solving processes are animated, with a slider to control the speed.
-   **Interactive Player Mode:** After a maze is generated, the user can try to solve it themselves using the arrow keys. The application tracks their move count and detects when they reach the goal.
-   **Customizable Grid:** A slider allows the user to change the size of the maze grid, generating new mazes on the fly.

## Technologies Used

-   **HTML5:** For the `<canvas>` element and the controls panel structure.
-   **CSS3:** For modern styling of the interface.
-   **Vanilla JavaScript (ES6+):** For all application logic, including the algorithms, rendering engine, and state management.

## Core JavaScript Concepts Showcased

This project is a deep dive into implementing classic computer science algorithms and visualizing their state.

#### 1. Graph Traversal Algorithms from Scratch

The core of the project is the from-scratch implementation of famous graph traversal and spanning tree algorithms, using a 2D grid as the graph.
-   **Depth-First Search (DFS):** Implemented using a **Stack** data structure.
-   **Breadth-First Search (BFS):** Implemented using a **Queue** data structure.
-   **Prim's & Kruskal's Algorithms:** Implementations of Minimum Spanning Tree algorithms, adapted for maze generation. Kruskal's involves the concept of disjoint sets.
-   **A* Search:** An advanced pathfinding algorithm that uses a **heuristic** (Manhattan distance) to guide its search, making it more efficient than "blind" searches like BFS.

#### 2. `async/await` for Algorithm Animation

To animate the algorithms, each step of the process needs to pause briefly. This is achieved elegantly using `async` functions and `await new Promise(resolve => setTimeout(resolve, speed))`. This makes the step-by-step logic of the algorithms extremely clear and easy to read, without the complexity of callback chains or a manual `requestAnimationFrame` loop.

**Example: The main loop of the DFS generator (`script.js`)**

```javascript
async function dfs_generate() {
    let stack = [];
    let current = grid;
    current.visited = true;

    // The main loop of the algorithm
    while (true) {
        // 1. Draw the current state of the maze
        drawGrid();
        // 2. Highlight the active cell
        ctx.fillStyle = 'rgba(79, 70, 229, 0.5)';
        ctx.fillRect(current.x * cellSize, current.y * cellSize, cellSize, cellSize);
        // 3. Pause execution to create the animation effect
        await new Promise(r => setTimeout(r, speedSlider.value));

        // 4. Perform the next step of the algorithm
        // ...
    }
}
```

#### 3. Object-Oriented Programming for the Grid

The maze is represented by a 2D array of `Cell` objects. Using a `Cell` class is a clean, object-oriented approach that encapsulates the state of each individual cell (its walls, whether it's been visited) and its behavior (how to draw itself).

#### 4. HTML Canvas API for Rendering

The entire visual representation of the maze, the animated algorithm paths, and the interactive player are drawn using the Canvas API.
-   `moveTo()` and `lineTo()` are used to draw the walls for each cell.
-   `fillRect()` is used to color cells, providing visual feedback for the algorithms' progress and the player's position.

## How to Run

1.  Save the three files (`index.html`, `style.css`, `script.js`) in the same folder.
2.  Open `index.html` in your web browser. The application will automatically generate a maze on load.
```