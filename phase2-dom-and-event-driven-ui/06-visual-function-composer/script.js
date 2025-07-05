document.addEventListener('DOMContentLoaded', () => {

    // --- DOM Elements ---
    const libraryPanel = document.getElementById('library-nodes');
    const canvasContainer = document.querySelector('.canvas-container');
    const canvas = document.getElementById('canvas');
    const svgLayer = document.getElementById('svg-layer');
    const panner = document.getElementById('canvas-panner');

    // --- Data: The Function Library ---
    const functionLibrary = {
        'input': { name: 'Input', type: 'input', inputs: [], outputs: ['value'], operation: null },
        'add': { name: 'Add', type: 'math', inputs: ['a', 'b'], outputs: ['sum'], operation: (a, b) => a + b },
        'subtract': { name: 'Subtract', type: 'math', inputs: ['a', 'b'], outputs: ['difference'], operation: (a, b) => a - b },
        'multiply': { name: 'Multiply', type: 'math', inputs: ['a', 'b'], outputs: ['product'], operation: (a, b) => a * b },
        'divide': { name: 'Divide', type: 'math', inputs: ['a', 'b'], outputs: ['quotient'], operation: (a, b) => b === 0 ? NaN : a / b },
        'toUpperCase': { name: 'To Uppercase', type: 'string', inputs: ['string'], outputs: ['result'], operation: (str) => String(str).toUpperCase() },
        'toNumber': { name: 'To Number', type: 'string', inputs: ['string'], outputs: ['number'], operation: (str) => Number(str) },
        'log': { name: 'Log Value', type: 'output', inputs: ['value'], outputs: [], operation: (val) => console.log('LOG:', val) },
    };
    
    // --- Application State ---
    let nodes = [];
    let connections = [];
    let state = {
        isDraggingNode: false,
        isDrawingWire: false,
        isPanning: false,
        draggedNodeId: null,
        wireStartNodeId: null,
        wireStartSocket: null,
        panStartX: 0,
        panStartY: 0,
        transform: { x: 0, y: 0, scale: 1 },
    };
    let nextNodeId = 0;

    // --- Initialization ---
    function initializeLibrary() {
        for (const key in functionLibrary) {
            const template = document.createElement('div');
            template.className = 'node-template';
            template.draggable = true;
            template.textContent = functionLibrary[key].name;
            template.dataset.type = key;
            libraryPanel.appendChild(template);
        }
        createNode('input', 50, 150); // Create an initial input node
    }

    // --- Node & Wire Creation/Rendering ---
    function createNode(type, x, y) {
        const id = nextNodeId++;
        const func = functionLibrary[type];
        
        const node = {
            id, type, x, y,
            inputs: Object.fromEntries(func.inputs.map(name => [name, null])),
            outputs: Object.fromEntries(func.outputs.map(name => [name, null])),
            error: null
        };
        nodes.push(node);
        renderNode(node);
    }
    
    function renderNode(node) {
        const func = functionLibrary[node.type];
        const nodeEl = document.createElement('div');
        nodeEl.className = 'node';
        nodeEl.id = `node-${node.id}`;
        nodeEl.style.left = `${node.x}px`;
        nodeEl.style.top = `${node.y}px`;
        
        let inputsHTML = '';
        func.inputs.forEach((inputName, i) => {
            inputsHTML += `
                <div class="node-row">
                    <div class="socket in" data-node-id="${node.id}" data-socket-name="${inputName}" data-socket-index="${i}"></div>
                    <label>${inputName}</label>
                    <input type="number" class="node-input" data-node-id="${node.id}" data-input-name="${inputName}" placeholder="0">
                </div>
            `;
        });

        // Special case for the main input node
        if(node.type === 'input') {
            inputsHTML = `
                <div class="node-row">
                    <label>Value</label>
                    <input type="text" class="node-input" data-node-id="${node.id}" data-input-name="value" value="10">
                </div>
            `;
        }
        
        let outputsHTML = '';
        func.outputs.forEach((outputName, i) => {
            outputsHTML += `
                <div class="node-row">
                    <label>${outputName}</label>
                    <span class="output-value" id="output-${node.id}-${outputName}">-</span>
                    <div class="socket out" data-node-id="${node.id}" data-socket-name="${outputName}" data-socket-index="${i}"></div>
                </div>
            `;
        });

        nodeEl.innerHTML = `
            <div class="node-header">${func.name}</div>
            <div class="node-body">
                ${inputsHTML}
                ${outputsHTML}
                <div class="error-message" id="error-${node.id}"></div>
            </div>
        `;
        canvas.appendChild(nodeEl);
    }

    function renderAllWires() {
        svgLayer.innerHTML = '';
        connections.forEach(conn => {
            const wire = createWireElement(conn.startX, conn.startY, conn.endX, conn.endY);
            if(conn.error) wire.classList.add('error');
            svgLayer.appendChild(wire);
        });
    }

    function createWireElement(x1, y1, x2, y2) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
        line.classList.add('wire');
        return line;
    }

    // --- Event Handlers ---
    libraryPanel.addEventListener('dragstart', (e) => {
        if (e.target.classList.contains('node-template')) {
            e.dataTransfer.setData('text/plain', e.target.dataset.type);
        }
    });

    canvasContainer.addEventListener('dragover', (e) => e.preventDefault());
    canvasContainer.addEventListener('drop', (e) => {
        e.preventDefault();
        const type = e.dataTransfer.getData('text/plain');
        if (functionLibrary[type]) {
            const coords = getCanvasCoordinates(e);
            createNode(type, coords.x, coords.y);
            propagateUpdates();
        }
    });

    canvas.addEventListener('mousedown', (e) => {
        const targetNode = e.target.closest('.node');
        const targetSocket = e.target.closest('.socket');

        if (targetSocket) {
            e.stopPropagation();
            state.isDrawingWire = true;
            state.wireStartNodeId = targetSocket.dataset.nodeId;
            state.wireStartSocket = targetSocket.dataset.socketName;
        } else if (targetNode) {
            state.isDraggingNode = true;
            state.draggedNodeId = targetNode.id.split('-')[1];
        }
    });
    
    canvasContainer.addEventListener('mousedown', (e) => {
        if(e.target === canvasContainer || e.target === canvas || e.target === panner) {
            state.isPanning = true;
            state.panStartX = e.clientX - state.transform.x;
            state.panStartY = e.clientY - state.transform.y;
            canvasContainer.classList.add('panning');
        }
    });

    window.addEventListener('mousemove', (e) => {
        const coords = getCanvasCoordinates(e);

        if (state.isDraggingNode) {
            const node = nodes.find(n => n.id == state.draggedNodeId);
            const nodeEl = document.getElementById(`node-${node.id}`);
            node.x = coords.x;
            node.y = coords.y;
            nodeEl.style.left = `${node.x}px`;
            nodeEl.style.top = `${node.y}px`;
            updateWiresForNode(node.id);
        } else if (state.isDrawingWire) {
            // Draw temp wire
            const startNode = nodes.find(n => n.id == state.wireStartNodeId);
            const startSocketEl = document.querySelector(`.socket.out[data-node-id="${startNode.id}"]`);
            const startPos = getSocketPosition(startSocketEl);

            document.querySelectorAll('.temp-wire').forEach(w => w.remove());
            const tempWire = createWireElement(startPos.x, startPos.y, coords.x, coords.y);
            tempWire.classList.add('temp-wire');
            svgLayer.appendChild(tempWire);
        } else if (state.isPanning) {
            state.transform.x = e.clientX - state.panStartX;
            state.transform.y = e.clientY - state.panStartY;
            panner.style.transform = `translate(${state.transform.x}px, ${state.transform.y}px) scale(${state.transform.scale})`;
        }
    });

    window.addEventListener('mouseup', (e) => {
        const targetSocket = e.target.closest('.socket.in');
        if (state.isDrawingWire && targetSocket) {
            const endNodeId = targetSocket.dataset.nodeId;
            const endSocket = targetSocket.dataset.socketName;
            
            // Prevent connecting to self
            if(state.wireStartNodeId !== endNodeId) {
                // Remove any existing connection to this input socket
                connections = connections.filter(c => !(c.toNodeId == endNodeId && c.toSocket == endSocket));

                connections.push({
                    fromNodeId: state.wireStartNodeId,
                    fromSocket: state.wireStartSocket,
                    toNodeId: endNodeId,
                    toSocket: endSocket,
                });
                propagateUpdates();
            }
        }
        
        document.querySelectorAll('.temp-wire').forEach(w => w.remove());
        state.isDraggingNode = false;
        state.isDrawingWire = false;
        state.isPanning = false;
        canvasContainer.classList.remove('panning');
    });

    canvasContainer.addEventListener('wheel', (e) => {
        e.preventDefault();
        const scaleAmount = 1.1;
        state.transform.scale *= e.deltaY > 0 ? 1 / scaleAmount : scaleAmount;
        panner.style.transform = `translate(${state.transform.x}px, ${state.transform.y}px) scale(${state.transform.scale})`;
    });

    canvas.addEventListener('input', (e) => {
        if(e.target.classList.contains('node-input')) {
            propagateUpdates();
        }
    });

    // --- Core Logic: Data Propagation ---
    function propagateUpdates() {
        const executionOrder = resolveExecutionOrder();
        let allOutputs = {};

        executionOrder.forEach(nodeId => {
            const node = nodes.find(n => n.id === nodeId);
            const func = functionLibrary[node.type];
            let inputs = [];
            let hasError = false;
            node.error = null; // Reset error

            // Gather inputs for the current node
            func.inputs.forEach(inputName => {
                const connection = connections.find(c => c.toNodeId == node.id && c.toSocket == inputName);
                if (connection) {
                    const fromNodeOutputs = allOutputs[connection.fromNodeId] || {};
                    inputs.push(fromNodeOutputs[connection.fromSocket]);
                    connection.error = fromNodeOutputs.error;
                    if(fromNodeOutputs.error) hasError = true;
                } else {
                    const inputEl = document.querySelector(`#node-${node.id} input[data-input-name="${inputName}"]`);
                    let value = func.type === 'string' ? inputEl.value : parseFloat(inputEl.value);
                    if(node.type === 'input') value = inputEl.value; // Keep input as string initially
                    inputs.push(value);
                }
            });

            // Execute operation and update outputs
            if (!hasError && func.operation) {
                try {
                    const result = func.operation(...inputs);
                    if (Number.isNaN(result)) throw new Error("Result is NaN");
                    node.outputs[func.outputs[0]] = result;
                } catch(e) {
                    node.error = e.message;
                    hasError = true;
                }
            } else if (node.type === 'input') {
                const inputEl = document.querySelector(`#node-${node.id} input`);
                node.outputs.value = inputEl.value;
            }
            
            allOutputs[node.id] = {...node.outputs, error: node.error};
        });
        updateUI(allOutputs);
    }
    
    function resolveExecutionOrder() {
        // Simple topological sort: just process in creation order for this version
        // A real implementation would build a dependency graph.
        return nodes.map(n => n.id);
    }

    function updateUI(allOutputs) {
        nodes.forEach(node => {
            const outputs = allOutputs[node.id] || {};
            for(const key in outputs) {
                if(key !== 'error') {
                    const outputEl = document.getElementById(`output-${node.id}-${key}`);
                    if(outputEl) outputEl.textContent = typeof outputs[key] === 'number' ? outputs[key].toFixed(2) : outputs[key];
                }
            }
            // Update error state
            const nodeEl = document.getElementById(`node-${node.id}`);
            const errorEl = document.getElementById(`error-${node.id}`);
            if (outputs.error) {
                nodeEl.classList.add('error');
                errorEl.textContent = outputs.error;
            } else {
                nodeEl.classList.remove('error');
                errorEl.textContent = '';
            }
        });
        updateAllWirePositions();
    }
    
    function updateWiresForNode(nodeId) {
        connections.forEach(conn => {
            if (conn.fromNodeId == nodeId || conn.toNodeId == nodeId) {
                const fromSocket = document.querySelector(`.socket.out[data-node-id="${conn.fromNodeId}"]`);
                const toSocket = document.querySelector(`.socket.in[data-node-id="${conn.toNodeId}"]`);
                const startPos = getSocketPosition(fromSocket);
                const endPos = getSocketPosition(toSocket);
                conn.startX = startPos.x; conn.startY = startPos.y;
                conn.endX = endPos.x; conn.endY = endPos.y;
            }
        });
        renderAllWires();
    }

    function updateAllWirePositions() {
         connections.forEach(conn => {
            const fromSocket = document.querySelector(`.socket.out[data-node-id="${conn.fromNodeId}"]`);
            const toSocket = document.querySelector(`.socket.in[data-node-id="${conn.toNodeId}"]`);
            if(!fromSocket || !toSocket) return;
            const startPos = getSocketPosition(fromSocket);
            const endPos = getSocketPosition(toSocket);
            conn.startX = startPos.x; conn.startY = startPos.y;
            conn.endX = endPos.x; conn.endY = endPos.y;
        });
        renderAllWires();
    }
    
    // --- Utility ---
    function getSocketPosition(socketEl) {
        const canvasRect = canvas.getBoundingClientRect();
        const socketRect = socketEl.getBoundingClientRect();
        return {
            x: socketRect.left - canvasRect.left + socketRect.width / 2,
            y: socketRect.top - canvasRect.top + socketRect.height / 2,
        };
    }

    function getCanvasCoordinates(e) {
        const canvasRect = canvasContainer.getBoundingClientRect();
        const x = (e.clientX - canvasRect.left - state.transform.x) / state.transform.scale;
        const y = (e.clientY - canvasRect.top - state.transform.y) / state.transform.scale;
        return {x, y};
    }

    // --- Initialize ---
    initializeLibrary();
    propagateUpdates();
});