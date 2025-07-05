document.addEventListener('DOMContentLoaded', () => {

    // --- DOM Elements ---
    const canvas = document.getElementById('canvas');
    const contextMenu = document.getElementById('context-menu');
    const toolbar = document.querySelector('.toolbar');
    const palette = document.querySelector('.palette');
    const stickerBtn = document.getElementById('sticker-btn');
    const stickerPanel = document.getElementById('sticker-panel');
    const stickerGrid = document.getElementById('sticker-grid');
    const closeStickerPanelBtn = document.getElementById('close-sticker-panel');

    // --- Data ---
    const stickers = ['😀', '😂', '😍', '🤔', '👍', '👎', '🔥', '💡', '❤️', '🚀', '⭐', '🎉', '💯', '🙏', '👀', '👋', '🧠', '🤯', '🥳', '🙌'];

    // --- Application State ---
    let activeTool = 'select';
    let selectedElement = null;
    let actionState = { isActing: false }; // a single state object
    let zIndexCounter = 1;

    // --- Initialization ---
    function initializeStickerPanel() {
        stickers.forEach(sticker => {
            const stickerEl = document.createElement('div');
            stickerEl.className = 'sticker-grid-item draggable';
            stickerEl.textContent = sticker;
            stickerEl.draggable = true;
            stickerEl.dataset.type = `sticker-${sticker}`;
            stickerGrid.appendChild(stickerEl);
        });
    }

    // --- Tool & Palette Logic ---
    toolbar.addEventListener('click', (e) => {
        const toolButton = e.target.closest('.tool');
        if (toolButton) {
            document.querySelector('.tool.active').classList.remove('active');
            toolButton.classList.add('active');
            activeTool = toolButton.dataset.tool;
            canvas.className = `canvas ${activeTool}-tool-active`;
        }
    });

    stickerBtn.addEventListener('click', () => stickerPanel.classList.toggle('hidden'));
    closeStickerPanelBtn.addEventListener('click', () => stickerPanel.classList.add('hidden'));

    // CORRECTED: Using Event Delegation for Dragging
    function handleDragStart(e) {
        const target = e.target.closest('.draggable');
        if (!target) return;
        const type = target.dataset.type;
        const content = type.startsWith('sticker-') ? target.textContent : '';
        e.dataTransfer.setData('application/json', JSON.stringify({ type, content }));
        // stickerPanel.classList.add('hidden'); // Do not hide here
    }

    palette.addEventListener('dragstart', handleDragStart);
    stickerGrid.addEventListener('dragstart', handleDragStart);
    
    // --- Element Creation ---
    canvas.addEventListener('dragover', (e) => e.preventDefault());
    canvas.addEventListener('drop', (e) => {
        e.preventDefault();
        const data = JSON.parse(e.dataTransfer.getData('application/json'));
        const { x, y } = getCanvasCoordinates(e);
        createElement(data.type, x, y, data.content);
        stickerPanel.classList.add('hidden'); // Hide after drop
    });

    function createElement(type, x, y, content = '') {
        const id = Date.now();
        const wrapper = document.createElement('div');
        wrapper.className = 'element-wrapper';
        wrapper.dataset.id = id;
        wrapper.style.position = 'absolute'; // Ensure absolute positioning
        wrapper.style.left = `${x}px`;
        wrapper.style.top = `${y}px`;
        wrapper.style.zIndex = zIndexCounter++;

        let element;

        if (type.startsWith('note-')) {
            wrapper.classList.add(type.split('-')[1]); // adds 'yellow', 'blue', etc.
            element = document.createElement('div');
            element.className = 'canvas-element text-note';
            element.contentEditable = true;
            element.textContent = 'Type something...';
            wrapper.style.width = '150px';
            wrapper.style.height = '100px';
        } else if (type.startsWith('shape-')) {
            const shape = type.split('-')[1];
            element = document.createElement('div');
            element.className = `canvas-element shape-element ${shape}`;
            wrapper.style.width = '100px';
            wrapper.style.height = '100px';
        } else if (type.startsWith('sticker-')) {
            element = document.createElement('div');
            element.className = 'canvas-element sticker-element';
            element.textContent = content;
            wrapper.style.width = '50px';
            wrapper.style.height = '50px';
            element.style.fontSize = '40px';
        }

        if (element) {
            wrapper.appendChild(element);
            canvas.appendChild(wrapper);
            selectElement(wrapper);
        }
    }

    // --- Main Interaction Handler ---
    canvas.addEventListener('mousedown', (e) => {
        const handle = e.target.closest('.handle');
        const targetWrapper = e.target.closest('.element-wrapper');

        if (activeTool === 'select') {
            if (handle) {
                e.stopPropagation();
                startTransform(e, handle);
            } else if (targetWrapper) {
                selectElement(targetWrapper);
                startDrag(e);
            } else {
                deselectAll();
            }
        } else if (activeTool === 'pen') {
            startDrawing(e);
        }
    });

    function startDrag(e) {
        actionState = {
            isActing: true,
            action: 'drag',
            startX: e.clientX,
            startY: e.clientY,
            startLeft: selectedElement.offsetLeft,
            startTop: selectedElement.offsetTop,
        };
    }

    function startTransform(e, handle) {
        actionState = {
            isActing: true,
            action: handle.classList.contains('rotate') ? 'rotate' : 'resize',
            handleType: handle.className,
            startX: e.clientX,
            startY: e.clientY,
            startWidth: selectedElement.offsetWidth,
            startHeight: selectedElement.offsetHeight,
            startLeft: selectedElement.offsetLeft,
            startTop: selectedElement.offsetTop,
            elementCenterX: selectedElement.offsetLeft + selectedElement.offsetWidth / 2,
            elementCenterY: selectedElement.offsetTop + selectedElement.offsetHeight / 2,
            startAngle: getRotation(selectedElement),
        };
    }
    
    let drawingContext = {};
    function startDrawing(e) {
        actionState = { isActing: true, action: 'draw' };
        const { x, y } = getCanvasCoordinates(e);
        drawingContext = { path: [[x, y]] };

        const wrapper = document.createElement('div');
        wrapper.className = 'element-wrapper drawing-wrapper';
        const canvasEl = document.createElement('canvas');
        canvasEl.className = 'canvas-element drawing-element';
        wrapper.appendChild(canvasEl);
        canvas.appendChild(wrapper);
        drawingContext.wrapper = wrapper;
        drawingContext.canvas = canvasEl;
        drawingContext.ctx = canvasEl.getContext('2d');
    }

    window.addEventListener('mousemove', (e) => {
        if (!actionState.isActing) return;

        if (actionState.action === 'drag') {
            const dx = e.clientX - actionState.startX;
            const dy = e.clientY - actionState.startY;
            selectedElement.style.left = `${actionState.startLeft + dx}px`;
            selectedElement.style.top = `${actionState.startTop + dy}px`;
        } else if (actionState.action === 'resize') {
            const dx = e.clientX - actionState.startX;
            const dy = e.clientY - actionState.startY;
            let newWidth = actionState.startWidth, newHeight = actionState.startHeight, newLeft = actionState.startLeft, newTop = actionState.startTop;

            if (actionState.handleType.includes('tr') || actionState.handleType.includes('br')) newWidth += dx;
            if (actionState.handleType.includes('tl') || actionState.handleType.includes('bl')) { newWidth -= dx; newLeft += dx; }
            if (actionState.handleType.includes('bl') || actionState.handleType.includes('br')) newHeight += dy;
            if (actionState.handleType.includes('tl') || actionState.handleType.includes('tr')) { newHeight -= dy; newTop += dy; }

            if (newWidth > 20) { selectedElement.style.width = `${newWidth}px`; selectedElement.style.left = `${newLeft}px`; }
            if (newHeight > 20) { selectedElement.style.height = `${newHeight}px`; selectedElement.style.top = `${newTop}px`; }

            const innerElement = selectedElement.querySelector('.sticker-element');
            if (innerElement) {
                innerElement.style.fontSize = `${Math.min(newWidth, newHeight) * 0.8}px`;
            }
        } else if (actionState.action === 'rotate') {
            const angle = Math.atan2(e.clientY - actionState.elementCenterY - canvas.offsetTop, e.clientX - actionState.elementCenterX - canvas.offsetLeft) * 180 / Math.PI;
            selectedElement.style.transform = `rotate(${angle + 90}deg)`;
        } else if (actionState.action === 'draw') {
            const { x, y } = getCanvasCoordinates(e);
            drawingContext.path.push([x, y]);
            redrawDrawing();
        }
    });

    window.addEventListener('mouseup', () => {
        if (actionState.action === 'draw' && drawingContext.wrapper) {
            if(drawingContext.path.length > 1) {
                selectElement(drawingContext.wrapper);
            } else {
                drawingContext.wrapper.remove(); // Remove tiny dot clicks
            }
        }
        actionState = { isActing: false };
    });

    function redrawDrawing() {
        const path = drawingContext.path;
        const wrapper = drawingContext.wrapper;
        const canvasEl = drawingContext.canvas;
        const ctx = drawingContext.ctx;

        const minX = Math.min(...path.map(p => p[0])), minY = Math.min(...path.map(p => p[1]));
        const maxX = Math.max(...path.map(p => p[0])), maxY = Math.max(...path.map(p => p[1]));
        
        const padding = 10;
        const width = maxX - minX + 2 * padding, height = maxY - minY + 2 * padding;
        
        wrapper.style.left = `${minX - padding}px`;
        wrapper.style.top = `${minY - padding}px`;
        wrapper.style.width = `${width}px`;
        wrapper.style.height = `${height}px`;
        canvasEl.width = width;
        canvasEl.height = height;

        ctx.strokeStyle = '#000'; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(path[0][0] - minX + padding, path[0][1] - minY + padding);
        path.forEach(p => ctx.lineTo(p[0] - minX + padding, p[1] - minY + padding));
        ctx.stroke();
    }

    // --- Selection & Handles ---
    function selectElement(element) {
        deselectAll();
        selectedElement = element;
        selectedElement.classList.add('selected');
        createHandles(selectedElement);
    }
    
    function deselectAll() {
        document.querySelectorAll('.selected').forEach(el => el.classList.remove('selected'));
        document.querySelectorAll('.handles').forEach(h => h.remove());
        selectedElement = null;
    }

    function createHandles(element) {
        const handlesContainer = document.createElement('div');
        handlesContainer.className = 'handles';
        handlesContainer.innerHTML = `
            <div class="handle resize-tl"></div> <div class="handle resize-tr"></div>
            <div class="handle resize-bl"></div> <div class="handle resize-br"></div>
            <div class="handle rotate"></div>
        `;
        element.appendChild(handlesContainer);
    }

    // --- Context Menu & Delete Key ---
    canvas.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        const targetWrapper = e.target.closest('.element-wrapper');
        if (targetWrapper) {
            selectElement(targetWrapper);
            contextMenu.style.top = `${e.clientY}px`;
            contextMenu.style.left = `${e.clientX}px`;
            contextMenu.classList.remove('hidden');
        }
    });

    document.addEventListener('click', () => {
        contextMenu.classList.add('hidden');
        if (!event.target.closest('.popover') && !event.target.closest('#sticker-btn')) {
            stickerPanel.classList.add('hidden');
        }
    });

    contextMenu.addEventListener('click', (e) => {
        if (!selectedElement) return;
        const action = e.target.dataset.action;
        switch (action) {
            case 'bringToFront': selectedElement.style.zIndex = zIndexCounter++; break;
            case 'sendToBack': selectedElement.style.zIndex = 1; break;
            case 'delete': selectedElement.remove(); deselectAll(); break;
        }
    });
    
    document.addEventListener('keydown', (e) => {
        if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElement) {
            const target = e.target;
            if (target.isContentEditable || target.tagName === 'INPUT') return;
            selectedElement.remove();
            deselectAll();
        }
    });

    // --- Utility Functions ---
    function getCanvasCoordinates(event) {
        const canvasRect = canvas.getBoundingClientRect();
        return {
            x: event.clientX - canvasRect.left,
            y: event.clientY - canvasRect.top
        };
    }
    
    function getRotation(element) {
        const transform = window.getComputedStyle(element).transform;
        if (transform === 'none') return 0;
        const matrix = transform.split('(')[1]?.split(')')[0]?.split(',');
        if (!matrix) return 0;
        const a = parseFloat(matrix[0]);
        const b = parseFloat(matrix[1]);
        return Math.round(Math.atan2(b, a) * (180/Math.PI));
    }
    
    // --- Initialize ---
    initializeStickerPanel();
});