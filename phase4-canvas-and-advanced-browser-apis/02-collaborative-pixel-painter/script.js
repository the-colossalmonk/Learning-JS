document.addEventListener('DOMContentLoaded', () => {

    // --- DOM Elements ---
    const drawingCanvas = document.getElementById('drawing-canvas');
    const gridCanvas = document.getElementById('grid-canvas');
    const panner = document.getElementById('canvas-panner');
    const canvasWrapper = document.getElementById('canvas-wrapper');
    const cursorsContainer = document.getElementById('cursors-container');
    const palette = document.getElementById('color-palette');
    const gridToggle = document.getElementById('grid-toggle');
    const exportGifBtn = document.getElementById('export-gif-btn');
    const exportStatus = document.getElementById('export-status');
    const usersList = document.getElementById('users-list');
    const userItemTemplate = document.getElementById('user-item-template');

    // --- Canvas & Grid Config ---
    const ctx = drawingCanvas.getContext('2d');
    const gridCtx = gridCanvas.getContext('2d');
    const GRID_SIZE = 64;
    const PIXEL_SIZE = 16;
    const COLORS = ['#ffffff', '#000000', '#c0c0c0', '#ff0000', '#ffa500', '#ffff00', '#008000', '#0000ff', '#4b0082', '#ee82ee', '#e97451', '#7fffd4'];

    // --- State ---
    let gridState = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(COLORS[0]));
    let history = [];
    let users = {};
    let selectedColor = COLORS[1];
    let transform = { x: 0, y: 0, scale: 1 };
    let isPanning = false;
    let panStart = { x: 0, y: 0 };
    
    // --- Mock WebSocket Server & Client ---
    const randomNames = ['Crimson', 'Azure', 'Jade', 'Ember', 'Cobalt', 'Onyx', 'Celeste', 'Rowan'];
    const mockWebSocketServer = {
        clients: new Map(),
        connect(client) {
            const name = randomNames.length > 0 ? randomNames.splice(Math.floor(Math.random() * randomNames.length), 1)[0] : `User-${client.id.substring(0, 4)}`;
            const userData = { id: client.id, name, color: `hsl(${Math.random() * 360}, 80%, 60%)` };
            this.clients.set(client.id, { client, userData });
            this.broadcast({ type: 'USER_JOINED', user: userData }, client.id);
            client.onmessage({ data: JSON.stringify({ type: 'INITIAL_STATE', users: this.getUsersList(), grid: gridState, history }) });
        },
        disconnect(clientId) {
            this.clients.delete(clientId);
            this.broadcast({ type: 'USER_LEFT', userId: clientId });
        },
        handleMessage(message, fromClientId) { this.broadcast(message, fromClientId); },
        broadcast(message, fromClientId) {
            for (const [id, { client }] of this.clients) {
                if (id !== fromClientId) client.onmessage({ data: JSON.stringify(message) });
            }
        },
        getUsersList() { return Array.from(this.clients.values()).map(c => c.userData); }
    };

    const mainClient = {
        id: `client-${Math.random().toString(36).substr(2, 9)}`,
        send(data) { mockWebSocketServer.handleMessage(data, this.id); },
        onmessage(event) {
            const message = JSON.parse(event.data);
            handleServerMessage(message);
        }
    };
    
    // --- Canvas Rendering ---
    function resizeCanvases() {
        // Make canvases fill the visible area
        const width = canvasWrapper.clientWidth;
        const height = canvasWrapper.clientHeight;
        drawingCanvas.width = gridCanvas.width = width;
        drawingCanvas.height = gridCanvas.height = height;
        ctx.imageSmoothingEnabled = gridCtx.imageSmoothingEnabled = false;
        renderAll();
    }

    function renderAll() {
        renderGrid();
        renderGridOverlay();
    }

    function renderGrid() {
        ctx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
        // Draw only the gridState area, but fill the visible canvas
        for (let y = 0; y < GRID_SIZE; y++) {
            for (let x = 0; x < GRID_SIZE; x++) {
                ctx.fillStyle = gridState[y][x];
                ctx.fillRect(x * PIXEL_SIZE, y * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
            }
        }
    }

    function renderGridOverlay() {
        gridCtx.clearRect(0, 0, gridCanvas.width, gridCanvas.height);
        if (gridToggle.checked) {
            gridCtx.strokeStyle = 'rgba(0,0,0,0.1)';
            gridCtx.lineWidth = 1;
            // Draw grid lines for the entire visible canvas
            const cols = Math.ceil(gridCanvas.width / PIXEL_SIZE);
            const rows = Math.ceil(gridCanvas.height / PIXEL_SIZE);
            for (let i = 0; i <= cols; i++) {
                gridCtx.beginPath();
                gridCtx.moveTo(i * PIXEL_SIZE, 0);
                gridCtx.lineTo(i * PIXEL_SIZE, gridCanvas.height);
                gridCtx.stroke();
            }
            for (let i = 0; i <= rows; i++) {
                gridCtx.beginPath();
                gridCtx.moveTo(0, i * PIXEL_SIZE);
                gridCtx.lineTo(gridCanvas.width, i * PIXEL_SIZE);
                gridCtx.stroke();
            }
        }
    }

    // --- User Interaction & Painting ---
    function paintPixel(canvasX, canvasY) {
        const { col, row } = screenToGridCoords(canvasX, canvasY);
        const wrappedRow = (row % GRID_SIZE + GRID_SIZE) % GRID_SIZE;
        const wrappedCol = (col % GRID_SIZE + GRID_SIZE) % GRID_SIZE;
        
        if (gridState[wrappedRow][wrappedCol] === selectedColor) return;
        
        const action = { row: wrappedRow, col: wrappedCol, color: selectedColor, userId: mainClient.id, timestamp: Date.now() };
        applyAction(action);
        mainClient.send({ type: 'PAINT_PIXEL', payload: action });
    }
    
    function applyAction(action) {
        gridState[action.row][action.col] = action.color;
        history.push(action);
        renderGrid();
    }

    // --- Pan & Zoom ---
    function handleMouseDown(e) {
        if (e.buttons === 1 && (e.shiftKey || e.ctrlKey || e.metaKey)) {
            isPanning = true;
            panStart.x = e.clientX - transform.x;
            panStart.y = e.clientY - transform.y;
            canvasWrapper.classList.add('panning');
        } else if (e.buttons === 1) {
            paintPixel(e.clientX, e.clientY);
            canvasWrapper.addEventListener('mousemove', handlePaintMove);
        }
    }
    function handleMouseMove(e) {
        if (isPanning) {
            transform.x = e.clientX - panStart.x;
            transform.y = e.clientY - panStart.y;
            panner.style.transform = `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`;
        }
        mainClient.send({ type: 'CURSOR_UPDATE', cursor: { id: mainClient.id, ...screenToGridCoords(e.clientX, e.clientY) } });
    }
    function handleMouseUp() {
        isPanning = false;
        canvasWrapper.classList.remove('panning');
        canvasWrapper.removeEventListener('mousemove', handlePaintMove);
    }
    function handlePaintMove(e) { if(e.buttons === 1) paintPixel(e.clientX, e.clientY); }
    function handleZoom(e) {
        e.preventDefault();
        const scaleAmount = 1.1;
        const mouseX = e.clientX - canvasWrapper.getBoundingClientRect().left;
        const mouseY = e.clientY - canvasWrapper.getBoundingClientRect().top;
        const oldScale = transform.scale;
        
        transform.scale *= e.deltaY > 0 ? 1 / scaleAmount : scaleAmount;
        transform.scale = Math.max(0.5, Math.min(transform.scale, 8));
        transform.x = mouseX - (mouseX - transform.x) * (transform.scale / oldScale);
        transform.y = mouseY - (mouseY - transform.y) * (transform.scale / oldScale);

        panner.style.transform = `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`;
    }
    function screenToGridCoords(screenX, screenY) {
        const rect = canvasWrapper.getBoundingClientRect();
        const x = (screenX - rect.left - transform.x) / transform.scale;
        const y = (screenY - rect.top - transform.y) / transform.scale;
        return { col: Math.floor(x / PIXEL_SIZE), row: Math.floor(y / PIXEL_SIZE) };
    }

    // --- GIF Export ---
    function exportToGif() {
        if (history.length === 0) {
            alert('Nothing to export! Paint something first.');
            return;
        }
        exportGifBtn.disabled = true;
        exportStatus.textContent = 'Generating GIF...';
        exportStatus.classList.remove('hidden');

        const gif = new GIF({ workers: 2, quality: 10, width: GRID_SIZE * 10, height: GRID_SIZE * 10 });
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = GRID_SIZE * 10;
        tempCanvas.height = GRID_SIZE * 10;
        tempCtx.imageSmoothingEnabled = false;

        const tempGrid = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(COLORS[0]));
        const pixelDrawSize = 10;

        const step = Math.max(1, Math.floor(history.length / 100)); // Max 100 frames
        for (let i = 0; i < history.length; i++) {
            const action = history[i];
            tempGrid[action.row][action.col] = action.color;
            if (i % step === 0 || i === history.length - 1) {
                for (let y = 0; y < GRID_SIZE; y++) {
                    for (let x = 0; x < GRID_SIZE; x++) {
                        tempCtx.fillStyle = tempGrid[y][x];
                        tempCtx.fillRect(x * pixelDrawSize, y * pixelDrawSize, pixelDrawSize, pixelDrawSize);
                    }
                }
                gif.addFrame(tempCtx, { copy: true, delay: 50 });
            }
        }

        gif.on('finished', function(blob) {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'pixel-art-timelapse.gif';
            link.click();
            URL.revokeObjectURL(url);
            exportStatus.textContent = 'Export complete!';
            setTimeout(() => {
                exportStatus.classList.add('hidden');
                exportGifBtn.disabled = false;
            }, 3000);
        });
        gif.render();
    }

    // --- Server & User Management ---
    function handleServerMessage(message) {
        switch (message.type) {
            case 'INITIAL_STATE':
                gridState = message.grid;
                history = message.history;
                renderGrid();
                message.users.forEach(user => updateUserInList(user));
                break;
            case 'USER_JOINED': updateUserInList(message.user); break;
            case 'USER_LEFT': removeUserFromList(message.userId); break;
            case 'PAINT_PIXEL': applyAction(message.payload); break;
            case 'CURSOR_UPDATE': updateUserCursor(message.cursor); break;
        }
    }
    function updateUserInList(user) {
        users[user.id] = user;
        const userItem = userItemTemplate.content.cloneNode(true).firstElementChild;
        userItem.id = `user-${user.id}`;
        userItem.querySelector('.user-color-dot').style.backgroundColor = user.color;
        userItem.querySelector('.user-name').textContent = user.name + (user.id === mainClient.id ? ' (You)' : '');
        usersList.appendChild(userItem);
    }
    function removeUserFromList(userId) {
        delete users[userId];
        document.getElementById(`user-${userId}`)?.remove();
        document.getElementById(`cursor-${userId}`)?.remove();
    }
    function updateUserCursor({ id, col, row }) {
        if (id === mainClient.id || !users[id]) return;
        let cursorEl = document.getElementById(`cursor-${id}`);
        if (!cursorEl) {
            cursorEl = document.createElement('div');
            cursorEl.id = `cursor-${id}`;
            cursorEl.className = 'user-cursor';
            cursorEl.innerHTML = `<div class="cursor-label">${users[id].name}</div>`;
            cursorsContainer.appendChild(cursorEl);
        }
        cursorEl.style.left = `${col * PIXEL_SIZE}px`;
        cursorEl.style.top = `${row * PIXEL_SIZE}px`;
        cursorEl.style.borderColor = users[id].color;
        cursorEl.querySelector('.cursor-label').style.backgroundColor = users[id].color;
    }
    
    // --- Initial Setup ---
    function init() {
        resizeCanvases();
        palette.addEventListener('click', (e) => {
            if (e.target.classList.contains('color-swatch')) {
                document.querySelector('.color-swatch.active')?.classList.remove('active');
                e.target.classList.add('active');
                selectedColor = e.target.dataset.color;
            }
        });
        canvasWrapper.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        window.addEventListener('mouseleave', handleMouseUp); // Listen on window for mouseup
        canvasWrapper.addEventListener('wheel', handleZoom);
        gridToggle.addEventListener('change', renderGridOverlay);
        exportGifBtn.addEventListener('click', exportToGif);
        
        COLORS.forEach(color => {
            const swatch = document.createElement('div');
            swatch.className = 'color-swatch';
            swatch.style.backgroundColor = color;
            swatch.dataset.color = color;
            if (color === selectedColor) swatch.classList.add('active');
            palette.appendChild(swatch);
        });

        mockWebSocketServer.connect(mainClient);

        // Simulate another user joining
        setTimeout(() => {
            mockWebSocketServer.connect({ id: 'client-sim1', onmessage: () => {} });
        }, 1500);
    }
    
    init();
});