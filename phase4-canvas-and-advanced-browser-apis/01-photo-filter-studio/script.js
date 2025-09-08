document.addEventListener('DOMContentLoaded', () => {

    // --- DOM Elements ---
    const canvas = document.getElementById('main-canvas');
    const ctx = canvas.getContext('2d');
    const uploadInput = document.getElementById('upload-input');
    const placeholderText = document.getElementById('placeholder-text');
    const canvasContainer = document.getElementById('canvas-container');
    const textOverlayTemplate = document.getElementById('text-overlay-template');
    
    // --- State ---
    let originalImageData = null;
    let currentImageData = null;
    let historyStack = [];
    let textOverlays = [];
    
    // --- Event Listeners ---
    document.querySelector('.controls-panel').addEventListener('click', handleFilterClick);
    document.querySelector('.controls-panel').addEventListener('input', handleSliderInput);
    document.getElementById('add-text-btn').addEventListener('click', addTextOverlay);
    document.getElementById('reset-btn').addEventListener('click', resetImage);
    document.getElementById('undo-btn').addEventListener('click', handleUndo);
    document.getElementById('download-btn').addEventListener('click', downloadImage);
    uploadInput.addEventListener('change', handleImageUpload);
    
    // --- Image Handling ---
    function handleImageUpload(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                placeholderText.classList.add('hidden');
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                currentImageData = originalImageData;
                pushToHistory(originalImageData);
                document.getElementById('download-btn').disabled = false;
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }
    
    // --- History & State Management ---
    function pushToHistory(imageData) {
        historyStack.push(imageData);
        document.getElementById('undo-btn').disabled = historyStack.length <= 1;
    }

    function handleUndo() {
        if (historyStack.length <= 1) return;
        historyStack.pop(); // Remove current state
        const prevState = historyStack[historyStack.length - 1];
        currentImageData = prevState;
        ctx.putImageData(prevState, 0, 0);
        document.getElementById('undo-btn').disabled = historyStack.length <= 1;
    }
    
    function resetImage() {
        if (!originalImageData) return;
        currentImageData = originalImageData;
        ctx.putImageData(originalImageData, 0, 0);
        historyStack = [originalImageData];
        document.getElementById('undo-btn').disabled = true;
    }

    // --- Filter Application Logic ---
    function applyFilter(filterFunction, value) {
        if (!originalImageData) return;
        
        const newImageData = filterFunction(originalImageData, value);
        currentImageData = newImageData;
        ctx.putImageData(newImageData, 0, 0);
        pushToHistory(newImageData);
    }
    
    function handleFilterClick(e) {
        if (e.target.classList.contains('filter-btn')) {
            const filterName = e.target.dataset.filter;
            const filterFunction = filters[filterName];
            if(filterFunction) applyFilter(filterFunction);
        }
    }

    function handleSliderInput(e) {
        if (e.target.type === 'range') {
            const filterName = e.target.id.split('-')[0];
            const value = parseInt(e.target.value);
            const filterFunction = filters[filterName];
            if(filterFunction) applyFilter(filterFunction, value);
        }
    }
    
    // --- Filter Algorithms ---
    const filters = {
        grayscale: (imgData) => {
            const data = new Uint8ClampedArray(imgData.data);
            for (let i = 0; i < data.length; i += 4) {
                const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
                data[i] = data[i + 1] = data[i + 2] = avg;
            }
            return new ImageData(data, imgData.width, imgData.height);
        },
        sepia: (imgData) => {
            const data = new Uint8ClampedArray(imgData.data);
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i], g = data[i + 1], b = data[i + 2];
                data[i] = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189);
                data[i + 1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168);
                data[i + 2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131);
            }
            return new ImageData(data, imgData.width, imgData.height);
        },
        invert: (imgData) => {
            const data = new Uint8ClampedArray(imgData.data);
            for (let i = 0; i < data.length; i += 4) {
                data[i] = 255 - data[i];
                data[i + 1] = 255 - data[i + 1];
                data[i + 2] = 255 - data[i + 2];
            }
            return new ImageData(data, imgData.width, imgData.height);
        },
        brightness: (imgData, value) => {
            const data = new Uint8ClampedArray(imgData.data);
            for (let i = 0; i < data.length; i += 4) {
                data[i] = Math.max(0, Math.min(255, data[i] + value));
                data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + value));
                data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + value));
            }
            return new ImageData(data, imgData.width, imgData.height);
        },
        contrast: (imgData, value) => {
            const data = new Uint8ClampedArray(imgData.data);
            const factor = (259 * (value + 255)) / (255 * (259 - value));
            for (let i = 0; i < data.length; i += 4) {
                data[i] = factor * (data[i] - 128) + 128;
                data[i + 1] = factor * (data[i + 1] - 128) + 128;
                data[i + 2] = factor * (data[i + 2] - 128) + 128;
            }
            return new ImageData(data, imgData.width, imgData.height);
        },
        saturation: (imgData, value) => {
            const data = new Uint8ClampedArray(imgData.data);
            const lumR = 0.3086, lumG = 0.6094, lumB = 0.0820;
            const s = value / 100 + 1;
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i], g = data[i+1], b = data[i+2];
                const gray = r * lumR + g * lumG + b * lumB;
                data[i] = Math.max(0, Math.min(255, gray + s * (r - gray)));
                data[i+1] = Math.max(0, Math.min(255, gray + s * (g - gray)));
                data[i+2] = Math.max(0, Math.min(255, gray + s * (b - gray)));
            }
            return new ImageData(data, imgData.width, imgData.height);
        },
        sharpen: (imgData) => applyConvolution(imgData, [[0, -1, 0], [-1, 5, -1], [0, -1, 0]]),
        blur: (imgData) => applyConvolution(imgData, [[1, 1, 1], [1, 1, 1], [1, 1, 1]], 1/9),
        edgeDetect: (imgData) => applyConvolution(imgData, [[-1, -1, -1], [-1, 8, -1], [-1, -1, -1]]),
    };

    function applyConvolution(imgData, kernel, factor = 1) {
        const src = imgData.data;
        const width = imgData.width;
        const height = imgData.height;
        const dstData = new Uint8ClampedArray(src.length);
        const side = Math.round(Math.sqrt(kernel.length));
        const halfSide = Math.floor(side / 2);

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let r = 0, g = 0, b = 0;
                for (let cy = 0; cy < side; cy++) {
                    for (let cx = 0; cx < side; cx++) {
                        const scy = y + cy - halfSide;
                        const scx = x + cx - halfSide;
                        if (scy >= 0 && scy < height && scx >= 0 && scx < width) {
                            const srcOffset = (scy * width + scx) * 4;
                            const wt = kernel[cy][cx];
                            r += src[srcOffset] * wt;
                            g += src[srcOffset + 1] * wt;
                            b += src[srcOffset + 2] * wt;
                        }
                    }
                }
                const dstOffset = (y * width + x) * 4;
                dstData[dstOffset] = r * factor;
                dstData[dstOffset + 1] = g * factor;
                dstData[dstOffset + 2] = b * factor;
                dstData[dstOffset + 3] = src[dstOffset + 3];
            }
        }
        return new ImageData(dstData, width, height);
    }
    
    // --- Text Overlay Logic ---
    function addTextOverlay() {
        const textInput = document.getElementById('text-input');
        const textColor = document.getElementById('text-color-input').value;
        const text = textInput.value || 'Hello!';

        const textOverlay = textOverlayTemplate.content.cloneNode(true).firstElementChild;
        textOverlay.textContent = text;
        textOverlay.style.color = textColor;
        textOverlay.style.left = '50px';
        textOverlay.style.top = '50px';
        canvasContainer.appendChild(textOverlay);

        const textObj = { element: textOverlay, text, color: textColor, x: 50, y: 50 };
        textOverlays.push(textObj);
        makeDraggable(textObj);
        textInput.value = '';
    }
    
    function makeDraggable(textObj) {
        let isDragging = false;
        let startX, startY, startLeft, startTop;

        textObj.element.onmousedown = (e) => {
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            startLeft = textObj.element.offsetLeft;
            startTop = textObj.element.offsetTop;
            document.onmousemove = (e) => {
                if (!isDragging) return;
                const dx = e.clientX - startX;
                const dy = e.clientY - startY;
                textObj.x = startLeft + dx;
                textObj.y = startTop + dy;
                textObj.element.style.left = `${textObj.x}px`;
                textObj.element.style.top = `${textObj.y}px`;
            };
            document.onmouseup = () => {
                isDragging = false;
                document.onmousemove = null;
                document.onmouseup = null;
            };
        };
    }

    // --- Download Logic ---
    function downloadImage() {
        if (!currentImageData) return;
        
        // "Bake" text onto the canvas before downloading
        ctx.putImageData(currentImageData, 0, 0);
        textOverlays.forEach(obj => {
            ctx.font = `${obj.element.style.fontSize || '48px'} ${'bold'} sans-serif`;
            ctx.fillStyle = obj.color;
            ctx.fillText(obj.element.textContent, obj.x + 5, obj.y + 48); // Adjust position
        });

        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = 'filtered-image.png';
        link.href = dataUrl;
        link.click();
        
        // Restore canvas to its state without baked-in text
        ctx.putImageData(currentImageData, 0, 0);
    }
});