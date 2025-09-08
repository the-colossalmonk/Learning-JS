document.addEventListener('DOMContentLoaded', () => {

    // --- DOM Elements ---
    const canvas = document.getElementById('maze-canvas');
    const ctx = canvas.getContext('2d');
    const gridSizeSlider = document.getElementById('grid-size-slider');
    const gridSizeLabel = document.getElementById('grid-size-label');
    const speedSlider = document.getElementById('speed-slider');
    const generatorSelect = document.getElementById('generator-select');
    const solverSelect = document.getElementById('solver-select');
    const generateBtn = document.getElementById('generate-btn');
    const solveBtn = document.getElementById('solve-btn');
    const playerModeInfo = document.getElementById('player-mode-info');
    const playerStatus = document.getElementById('player-status');

    // --- State & Config ---
    let gridSize = 20;
    let cellSize;
    let grid = [];
    let isGenerating = false;
    let isSolving = false;
    let player = { x: 0, y: 0, moves: 0 };

    // --- Cell Class ---
    class Cell {
        constructor(x, y) {
            this.x = x; this.y = y;
            this.walls = { top: true, right: true, bottom: true, left: true };
            this.visited = false;
        }

        draw() {
            const x = this.x * cellSize;
            const y = this.y * cellSize;
            ctx.strokeStyle = '#1f2937';
            ctx.lineWidth = 2;
            if (this.walls.top) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + cellSize, y); ctx.stroke(); }
            if (this.walls.right) { ctx.beginPath(); ctx.moveTo(x + cellSize, y); ctx.lineTo(x + cellSize, y + cellSize); ctx.stroke(); }
            if (this.walls.bottom) { ctx.beginPath(); ctx.moveTo(x + cellSize, y + cellSize); ctx.lineTo(x, y + cellSize); ctx.stroke(); }
            if (this.walls.left) { ctx.beginPath(); ctx.moveTo(x, y + cellSize); ctx.lineTo(x, y); ctx.stroke(); }
        }
    }

    // --- Setup ---
    function setupGrid() {
        grid = [];
        for (let y = 0; y < gridSize; y++) {
            const row = [];
            for (let x = 0; x < gridSize; x++) {
                row.push(new Cell(x, y));
            }
            grid.push(row);
        }
    }

    function drawGrid() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let y = 0; y < gridSize; y++) {
            for (let x = 0; x < gridSize; x++) {
                grid[y][x].draw();
            }
        }
    }
    
    // --- Maze Generation Algorithms ---
    const generators = {
        dfs: async () => {
            let stack = [];
            let current = grid[0][0];
            current.visited = true;

            while (true) {
                drawGrid();
                ctx.fillStyle = 'rgba(79, 70, 229, 0.5)';
                ctx.fillRect(current.x * cellSize, current.y * cellSize, cellSize, cellSize);
                await new Promise(r => setTimeout(r, speedSlider.value));

                let neighbors = [];
                let { x, y } = current;
                if (y > 0 && !grid[y - 1][x].visited) neighbors.push(grid[y - 1][x]);
                if (x < gridSize - 1 && !grid[y][x + 1].visited) neighbors.push(grid[y][x + 1]);
                if (y < gridSize - 1 && !grid[y + 1][x].visited) neighbors.push(grid[y + 1][x]);
                if (x > 0 && !grid[y][x - 1].visited) neighbors.push(grid[y][x - 1]);

                if (neighbors.length > 0) {
                    stack.push(current);
                    let next = neighbors[Math.floor(Math.random() * neighbors.length)];
                    if (next.y < current.y) { current.walls.top = false; next.walls.bottom = false; }
                    if (next.x > current.x) { current.walls.right = false; next.walls.left = false; }
                    if (next.y > current.y) { current.walls.bottom = false; next.walls.top = false; }
                    if (next.x < current.x) { current.walls.left = false; next.walls.right = false; }
                    current = next;
                    current.visited = true;
                } else if (stack.length > 0) {
                    current = stack.pop();
                } else {
                    break;
                }
            }
        },
        prims: async () => {
            const frontiers = [];
            grid.flat().forEach(cell => cell.visited = false);
            const startX = Math.floor(Math.random() * gridSize);
            const startY = Math.floor(Math.random() * gridSize);
            grid[startY][startX].visited = true;

            const startNeighbors = [[startY-1, startX], [startY+1, startX], [startX-1, startY], [startX+1, startY]];
            startNeighbors.forEach(([y, x]) => {
                if(x >= 0 && x < gridSize && y >= 0 && y < gridSize) {
                    frontiers.push({x, y, from: {x: startX, y: startY}});
                }
            });

            while(frontiers.length > 0) {
                const randIndex = Math.floor(Math.random() * frontiers.length);
                const {x, y, from} = frontiers.splice(randIndex, 1)[0];
                if(grid[y][x].visited) continue;
                
                const fromCell = grid[from.y][from.x];
                const toCell = grid[y][x];
                if (toCell.y < fromCell.y) { fromCell.walls.top = false; toCell.walls.bottom = false; }
                if (toCell.x > fromCell.x) { fromCell.walls.right = false; toCell.walls.left = false; }
                if (toCell.y > fromCell.y) { fromCell.walls.bottom = false; toCell.walls.top = false; }
                if (toCell.x < fromCell.x) { fromCell.walls.left = false; toCell.walls.right = false; }
                toCell.visited = true;

                const newNeighbors = [[y-1, x], [y+1, x], [x-1, y], [x+1, y]];
                newNeighbors.forEach(([ny, nx]) => {
                    if(nx >= 0 && nx < gridSize && ny >= 0 && ny < gridSize && !grid[ny][nx].visited) {
                        frontiers.push({x: nx, y: ny, from: {x, y}});
                    }
                });
                
                drawGrid();
                ctx.fillStyle = 'rgba(79, 70, 229, 0.5)';
                ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
                await new Promise(r => setTimeout(r, speedSlider.value));
            }
        },
        kruskals: async () => {
            const walls = [];
            const sets = new Map();
            grid.flat().forEach((cell, i) => {
                sets.set(i, new Set([i]));
                if (cell.y > 0) walls.push({ x: cell.x, y: cell.y, dir: 'top' });
                if (cell.x > 0) walls.push({ x: cell.x, y: cell.y, dir: 'left' });
            });

            for (let i = walls.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [walls[i], walls[j]] = [walls[j], walls[i]];
            }

            while (walls.length > 0) {
                const { x, y, dir } = walls.pop();
                const cell1 = grid[y][x];
                const cell2 = (dir === 'top') ? grid[y - 1][x] : grid[y][x - 1];
                const id1 = cell1.y * gridSize + cell1.x;
                const id2 = cell2.y * gridSize + cell2.x;
                const set1 = sets.get(id1);
                const set2 = sets.get(id2);

                if (set1 !== set2) {
                    if (dir === 'top') { cell1.walls.top = false; cell2.walls.bottom = false; }
                    else { cell1.walls.left = false; cell2.walls.right = false; }
                    
                    set2.forEach(id => set1.add(id));
                    set1.forEach(id => sets.set(id, set1));

                    drawGrid();
                    await new Promise(r => setTimeout(r, speedSlider.value));
                }
            }
        },
    };
    
    // --- Maze Solving Algorithms ---
    const solvers = {
        bfs: async () => {
            const queue = [[grid[0][0]]];
            const visited = new Set([grid[0][0]]);
            const maxDist = gridSize * 1.5;

            while (queue.length > 0) {
                const path = queue.shift();
                const current = path[path.length - 1];
                if (current.x === gridSize - 1 && current.y === gridSize - 1) {
                    path.forEach(cell => {
                        ctx.fillStyle = '#16a34a';
                        ctx.fillRect(cell.x * cellSize + cellSize/4, cell.y * cellSize + cellSize/4, cellSize/2, cellSize/2);
                    });
                    return;
                }
                const { x, y } = current;
                const neighbors = [];
                if (!current.walls.top && y > 0 && !visited.has(grid[y - 1][x])) neighbors.push(grid[y - 1][x]);
                if (!current.walls.right && x < gridSize - 1 && !visited.has(grid[y][x + 1])) neighbors.push(grid[y][x + 1]);
                if (!current.walls.bottom && y < gridSize - 1 && !visited.has(grid[y + 1][x])) neighbors.push(grid[y + 1][x]);
                if (!current.walls.left && x > 0 && !visited.has(grid[y][x - 1])) neighbors.push(grid[y][x - 1]);

                for (const neighbor of neighbors) {
                    visited.add(neighbor);
                    const newPath = [...path, neighbor];
                    queue.push(newPath);
                    const dist = newPath.length;
                    const hue = 240 - (dist / maxDist) * 240;
                    ctx.fillStyle = `hsl(${hue}, 90%, 60%)`;
                    ctx.fillRect(neighbor.x * cellSize, neighbor.y * cellSize, cellSize, cellSize);
                }
                await new Promise(r => setTimeout(r, speedSlider.value));
            }
        },
        dfs_solve: async () => {
            const stack = [grid[0][0]];
            const visited = new Set();
            const path = {};
            let current = grid[0][0];

            while(current.x !== gridSize-1 || current.y !== gridSize-1) {
                visited.add(current);
                const {x, y} = current;
                const neighbors = [];
                if (!current.walls.top && y > 0 && !visited.has(grid[y - 1][x])) neighbors.push(grid[y - 1][x]);
                if (!current.walls.right && x < gridSize - 1 && !visited.has(grid[y][x + 1])) neighbors.push(grid[y][x + 1]);
                if (!current.walls.bottom && y < gridSize - 1 && !visited.has(grid[y + 1][x])) neighbors.push(grid[y + 1][x]);
                if (!current.walls.left && x > 0 && !visited.has(grid[y][x - 1])) neighbors.push(grid[y][x - 1]);

                if(neighbors.length > 0) {
                    const next = neighbors[0];
                    path[next.x + "-" + next.y] = current;
                    stack.push(next);
                    current = next;
                } else {
                    current = stack.pop();
                }

                drawGrid();
                ctx.fillStyle = 'rgba(239, 68, 68, 0.5)';
                stack.forEach(cell => ctx.fillRect(cell.x * cellSize, cell.y * cellSize, cellSize, cellSize));
                await new Promise(r => setTimeout(r, speedSlider.value));
            }
            
            let step = grid[gridSize-1][gridSize-1];
            while(step) {
                ctx.fillStyle = '#16a34a';
                ctx.fillRect(step.x * cellSize + cellSize/4, step.y * cellSize + cellSize/4, cellSize/2, cellSize/2);
                step = path[step.x + "-" + step.y];
            }
        },
        a_star: async () => {
            const heuristic = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
            const startNode = grid[0][0];
            const endNode = grid[gridSize - 1][gridSize - 1];
            let openSet = [startNode];
            const cameFrom = new Map();
            const gScore = new Map(grid.flat().map(c => [c, Infinity]));
            gScore.set(startNode, 0);
            const fScore = new Map(grid.flat().map(c => [c, Infinity]));
            fScore.set(startNode, heuristic(startNode, endNode));

            while(openSet.length > 0) {
                openSet.sort((a, b) => fScore.get(a) - fScore.get(b));
                let current = openSet.shift();
                if(current === endNode) {
                    let path = [];
                    while(current) {
                        path.push(current);
                        current = cameFrom.get(current);
                    }
                    path.reverse().forEach(cell => {
                        ctx.fillStyle = '#16a34a';
                        ctx.fillRect(cell.x * cellSize + cellSize/4, cell.y * cellSize + cellSize/4, cellSize/2, cellSize/2);
                    });
                    return;
                }
                
                const hue = 240 - (gScore.get(current) / (gridSize * 1.5)) * 240;
                ctx.fillStyle = `hsl(${hue}, 90%, 60%)`;
                ctx.fillRect(current.x * cellSize, current.y * cellSize, cellSize, cellSize);
                
                const { x, y } = current;
                const neighbors = [];
                if (!current.walls.top && y > 0) neighbors.push(grid[y - 1][x]);
                if (!current.walls.right && x < gridSize - 1) neighbors.push(grid[y][x + 1]);
                if (!current.walls.bottom && y < gridSize - 1) neighbors.push(grid[y + 1][x]);
                if (!current.walls.left && x > 0) neighbors.push(grid[y][x - 1]);
                
                for(const neighbor of neighbors) {
                    const tentativeGScore = gScore.get(current) + 1;
                    if(tentativeGScore < gScore.get(neighbor)) {
                        cameFrom.set(neighbor, current);
                        gScore.set(neighbor, tentativeGScore);
                        fScore.set(neighbor, tentativeGScore + heuristic(neighbor, endNode));
                        if(!openSet.includes(neighbor)) {
                            openSet.push(neighbor);
                        }
                    }
                }
                await new Promise(r => setTimeout(r, speedSlider.value));
            }
        },
    };
    
    // --- Player Mode ---
    function startPlayerMode() {
        player = { x: 0, y: 0, moves: 0 };
        playerModeInfo.classList.remove('hidden');
        playerStatus.textContent = 'Moves: 0';
        canvas.setAttribute('tabindex', '0');
        canvas.focus();
        drawPlayer();
    }
    
    function drawPlayer() {
        drawGrid();
        ctx.fillStyle = '#ef4444'; // Player color
        ctx.beginPath();
        ctx.arc(player.x * cellSize + cellSize / 2, player.y * cellSize + cellSize / 2, cellSize / 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#16a34a'; // Goal color
        ctx.beginPath();
        ctx.arc((gridSize - 1) * cellSize + cellSize / 2, (gridSize - 1) * cellSize + cellSize / 2, cellSize / 3, 0, Math.PI * 2);
        ctx.fill();
    }
    
    function handlePlayerMove(e) {
        if(isGenerating || isSolving || (player.x === gridSize - 1 && player.y === gridSize - 1)) return;
        const currentCell = grid[player.y][player.x];
        let moved = false;
        
        if (e.key === 'ArrowUp' && !currentCell.walls.top) { player.y--; moved = true; }
        else if (e.key === 'ArrowDown' && !currentCell.walls.bottom) { player.y++; moved = true; }
        else if (e.key === 'ArrowLeft' && !currentCell.walls.left) { player.x--; moved = true; }
        else if (e.key === 'ArrowRight' && !currentCell.walls.right) { player.x++; moved = true; }
        
        if(moved) {
            e.preventDefault();
            player.moves++;
            playerStatus.textContent = `Moves: ${player.moves}`;
            drawPlayer();
            if (player.x === gridSize - 1 && player.y === gridSize - 1) {
                playerStatus.textContent = `Solved in ${player.moves} moves!`;
                canvas.blur();
            }
        }
    }

    // --- UI & Event Handlers ---
    async function handleGenerate() {
        isGenerating = true;
        setButtonsState(false);
        playerModeInfo.classList.add('hidden');
        setupGrid();
        drawGrid();
        const generator = generators[generatorSelect.value];
        await generator();
        isGenerating = false;
        setButtonsState(true);
        startPlayerMode();
    }
    
    async function handleSolve() {
        isSolving = true;
        setButtonsState(false);
        drawGrid();
        const solver = solvers[solverSelect.value];
        await solver();
        isSolving = false;
        setButtonsState(true);
    }
    
    function setButtonsState(enabled) {
        generateBtn.disabled = !enabled;
        solveBtn.disabled = !enabled;
        gridSizeSlider.disabled = !enabled;
        generatorSelect.disabled = !enabled;
        solverSelect.disabled = !enabled;
    }
    
    // --- Initialization ---
    function init() {
        const size = Math.min(canvas.parentElement.clientWidth, canvas.parentElement.clientHeight) * 0.9;
        canvas.width = canvas.height = size;
        cellSize = canvas.width / gridSize;
        
        gridSizeSlider.addEventListener('input', (e) => {
            gridSize = parseInt(e.target.value);
            gridSizeLabel.textContent = `${gridSize} x ${gridSize}`;
            cellSize = canvas.width / gridSize;
        });
        
        generateBtn.addEventListener('click', handleGenerate);
        solveBtn.addEventListener('click', handleSolve);
        canvas.addEventListener('keydown', handlePlayerMove);

        handleGenerate();
    }

    init();
});