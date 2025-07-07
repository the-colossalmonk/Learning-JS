document.addEventListener('DOMContentLoaded', () => {

    // --- DOM Elements ---
    const canvas = document.getElementById('drawing-canvas');
    const ctx = canvas.getContext('2d');
    const colorPicker = document.getElementById('color-picker');
    const brushSizeInput = document.getElementById('brush-size');
    const undoBtn = document.getElementById('undo-btn');
    const clearBtn = document.getElementById('clear-btn');
    const usersList = document.getElementById('users-list');
    const userItemTemplate = document.getElementById('user-item-template');
    const canvasContainer = document.getElementById('canvas-container');
    
    // --- State ---
    const randomNames = ['Crimson', 'Azure', 'Jade', 'Ember', 'Cobalt', 'Onyx', 'Celeste', 'Rowan', 'Sierra', 'Orion'];
    let isDrawing = false;
    let history = []; // Stores all paths drawn
    let users = {}; // Stores info about connected users
    let currentPath = null;
    let drawingSettings = {
        color: '#ef4444',
        size: 5,
    };

    // --- Mock WebSocket Server ---
    const mockWebSocketServer = {
        clients: new Map(),
        connect(client) {
            const name = randomNames.length > 0 ? randomNames.splice(Math.floor(Math.random() * randomNames.length), 1)[0] : `User-${client.id.substring(0, 4)}`;
            const userData = { id: client.id, name, color: getRandomColor() };
            this.clients.set(client.id, { client, userData });
            this.broadcast({ type: 'USER_JOINED', user: userData }, client.id);
            client.onmessage({ data: JSON.stringify({ type: 'INITIAL_STATE', users: this.getUsersList(), history }) });
        },
        disconnect(client) {
            this.clients.delete(client.id);
            this.broadcast({ type: 'USER_LEFT', userId: client.id });
        },
        handleMessage(message, fromClientId) {
            this.broadcast(message, fromClientId);
        },
        broadcast(message, fromClientId) {
            for (const [id, { client }] of this.clients) {
                if (id !== fromClientId) {
                    client.onmessage({ data: JSON.stringify(message) });
                }
            }
        },
        getUsersList() {
            return Array.from(this.clients.values()).map(c => c.userData);
        }
    };

    // --- This User's Client ---
    const mainClient = {
        id: `client-${Math.random().toString(36).substr(2, 9)}`,
        send(data) {
            mockWebSocketServer.handleMessage(data, this.id);
        },
        onmessage(event) {
            const message = JSON.parse(event.data);
            handleServerMessage(message);
        }
    };
    
    // --- Drawing Logic ---
    function startDrawing(e) {
        isDrawing = true;
        const { x, y } = getMousePos(e);
        currentPath = {
            id: `path-${Date.now()}-${mainClient.id}`,
            ownerId: mainClient.id,
            color: drawingSettings.color,
            size: drawingSettings.size,
            points: [[x, y]],
        };
        drawPath(currentPath);
    }

    function draw(e) {
        if (!isDrawing) return;
        const { x, y } = getMousePos(e);
        currentPath.points.push([x, y]);
        redrawCanvas();
        mainClient.send({ type: 'DRAW_UPDATE', path: currentPath });
    }

    function stopDrawing() {
        if (!isDrawing) return;
        isDrawing = false;
        history.push(currentPath);
        mainClient.send({ type: 'DRAW_END', path: currentPath });
        currentPath = null;
    }

    function redrawCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        history.forEach(path => drawPath(path));
        if (isDrawing && currentPath) {
            drawPath(currentPath);
        }
    }

    function drawPath(path) {
        ctx.beginPath();
        ctx.strokeStyle = path.color;
        ctx.lineWidth = path.size;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        if (path.points.length > 0) {
            ctx.moveTo(path.points[0][0], path.points[0][1]);
            for (let i = 1; i < path.points.length; i++) {
                ctx.lineTo(path.points[i][0], path.points[i][1]);
            }
        }
        ctx.stroke();
    }

    // --- Network/Server Message Handling ---
    function handleServerMessage(message) {
        switch (message.type) {
            case 'INITIAL_STATE':
                history = message.history;
                redrawCanvas();
                message.users.forEach(user => updateUserInList(user));
                break;
            case 'USER_JOINED':
                updateUserInList(message.user);
                break;
            case 'USER_LEFT':
                removeUserFromList(message.userId);
                break;
            case 'DRAW_UPDATE':
                const tempHistory = [...history, message.path];
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                tempHistory.forEach(path => drawPath(path));
                break;
            case 'DRAW_END':
                // Check if path already exists to prevent duplicates
                if (!history.some(p => p.id === message.path.id)) {
                    history.push(message.path);
                }
                redrawCanvas();
                break;
            case 'CURSOR_UPDATE':
                updateUserCursor(message.cursor);
                break;
            case 'UNDO':
                history = history.filter(path => path.id !== message.pathId);
                redrawCanvas();
                break;
            case 'CLEAR':
                history = [];
                redrawCanvas();
                break;
        }
    }

    // --- UI and User Management ---
    function updateUserInList(user) {
        users[user.id] = user;
        const existingItem = document.getElementById(`user-${user.id}`);
        if (existingItem) {
            existingItem.querySelector('.user-color-dot').style.backgroundColor = user.color;
            existingItem.querySelector('.user-name').textContent = user.name;
        } else {
            const userItem = userItemTemplate.content.cloneNode(true).firstElementChild;
            userItem.id = `user-${user.id}`;
            userItem.querySelector('.user-color-dot').style.backgroundColor = user.color;
            userItem.querySelector('.user-name').textContent = user.name + (user.id === mainClient.id ? ' (You)' : '');
            usersList.appendChild(userItem);
        }
    }
    
    function removeUserFromList(userId) {
        delete users[userId];
        document.getElementById(`user-${userId}`)?.remove();
        document.getElementById(`cursor-${userId}`)?.remove();
    }
    
    function updateUserCursor({ id, name, x, y, color }) {
        if (id === mainClient.id) return;
        let cursorEl = document.getElementById(`cursor-${id}`);
        if (!cursorEl) {
            cursorEl = document.createElement('div');
            cursorEl.id = `cursor-${id}`;
            cursorEl.className = 'user-cursor';
            cursorEl.innerHTML = `<div class="cursor-label">${name}</div>`;
            canvasContainer.appendChild(cursorEl);
        }
        cursorEl.style.left = `${x}px`;
        cursorEl.style.top = `${y}px`;
        cursorEl.querySelector('.cursor-label').style.backgroundColor = color;
    }
    
    /**
     * Simulates a user drawing a random path on the canvas.
     * @param {object} simClient - The simulated client object.
     */
    function simulateUserBehavior(simClient) {
        const startX = Math.random() * canvas.width;
        const startY = Math.random() * canvas.height;
        const endX = startX + (Math.random() - 0.5) * 200;
        const endY = startY + (Math.random() - 0.5) * 200;
        
        const simPath = {
            id: `path-${Date.now()}-${simClient.id}`,
            ownerId: simClient.id,
            color: users[simClient.id]?.color || getRandomColor(),
            size: Math.random() * 15 + 2,
            points: [[startX, startY]],
        };

        let steps = 30;
        let currentStep = 0;
        const drawingInterval = setInterval(() => {
            if (currentStep >= steps) {
                clearInterval(drawingInterval);
                mockWebSocketServer.handleMessage({ type: 'DRAW_END', path: simPath }, simClient.id);
                return;
            }
            const t = currentStep / steps;
            const x = startX + (endX - startX) * t;
            const y = startY + (endY - startY) * t;
            simPath.points.push([x, y]);
            mockWebSocketServer.handleMessage({ type: 'DRAW_UPDATE', path: simPath }, simClient.id);
            currentStep++;
        }, 50);
    }

    /**
     * Starts a loop that makes a simulated client draw periodically.
     * @param {object} simClient - The simulated client object.
     */
    function startSimulatedClientActivity(simClient) {
        if (!mockWebSocketServer.clients.has(simClient.id)) {
            return; // Stop the loop if the client has disconnected
        }
        simulateUserBehavior(simClient);
        const nextDrawDelay = Math.random() * 2500 + 2500; // Wait 0.5-1.5 seconds
        setTimeout(() => startSimulatedClientActivity(simClient), nextDrawDelay);
    }

    // --- Event Listeners Setup ---
    function setupCanvas() {
        const resizeCanvas = () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            redrawCanvas();
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        
        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', stopDrawing);
        canvas.addEventListener('mouseout', stopDrawing);
        canvas.addEventListener('mousemove', e => {
            const { x, y } = getMousePos(e);
            mainClient.send({ type: 'CURSOR_UPDATE', cursor: { id: mainClient.id, name: users[mainClient.id]?.name, color: users[mainClient.id]?.color, x, y } });
        });
    }

    function setupToolbar() {
        colorPicker.addEventListener('input', (e) => drawingSettings.color = e.target.value);
        brushSizeInput.addEventListener('input', (e) => drawingSettings.size = e.target.value);
        undoBtn.addEventListener('click', () => {
            for (let i = history.length - 1; i >= 0; i--) {
                if (history[i].ownerId === mainClient.id) {
                    const pathToUndo = history.splice(i, 1)[0];
                    mainClient.send({ type: 'UNDO', pathId: pathToUndo.id });
                    redrawCanvas();
                    break;
                }
            }
        });
        clearBtn.addEventListener('click', () => {
            history = [];
            redrawCanvas();
            mainClient.send({ type: 'CLEAR' });
        });
    }

    // --- Utility ---
    function getMousePos(e) {
        const rect = canvas.getBoundingClientRect();
        return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }
    function getRandomColor() {
        return `hsl(${Math.random() * 360}, 70%, 60%)`;
    }

    // --- Initialization ---
    function init() {
        setupCanvas();
        setupToolbar();
        mockWebSocketServer.connect(mainClient);
        
        // Simulate other users joining and starting their drawing loops
        setTimeout(() => {
            const simClient1 = { id: 'client-sim1', onmessage: () => {} };
            mockWebSocketServer.connect(simClient1);
            startSimulatedClientActivity(simClient1);
        }, 1500);
        
        setTimeout(() => {
            const simClient2 = { id: 'client-sim2', onmessage: () => {} };
            mockWebSocketServer.connect(simClient2);
            startSimulatedClientActivity(simClient2);
        }, 3500);
    }
    
    init();
});