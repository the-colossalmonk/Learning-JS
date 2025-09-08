document.addEventListener('DOMContentLoaded', () => {
    "use strict";

    // --- DOM Elements ---
    const dashboardGrid = document.getElementById('dashboard-grid');
    const widgetTemplate = document.getElementById('widget-template');

    // --- Mock API Service ---
    const mockApiService = {
        fetchTimeSeriesData: () => Array.from({ length: 20 }, () => Math.random() * 80 + 20),
        fetchCategoricalData: () => ([
            { label: 'USA', value: Math.random() * 500 }, { label: 'EU', value: Math.random() * 400 },
            { label: 'JP', value: Math.random() * 300 }, { label: 'Other', value: Math.random() * 200 }
        ]),
        fetchGaugeData: () => ({ value: Math.random() * 100, max: 100 }),
        fetchKpiData: () => Math.floor(Math.random() * 5000) + 1000,
    };
    
    // --- State Management ---
    let widgets = [];
    
    function loadState() {
        let savedWidgets = null;
        try {
            savedWidgets = localStorage.getItem('dashboardState');
        } catch (e) {
            // SES may block localStorage
            savedWidgets = null;
        }
        if (savedWidgets) {
            try {
                widgets = JSON.parse(savedWidgets);
            } catch (e) {
                widgets = [];
            }
        } else {
            // Load default layout from data.json if nothing is saved
            fetch('data.json')
                .then(res => res.json())
                .then(data => {
                    widgets = data.widgets.map(w => ({...w, data: { target: null, current: null }}));
                    saveState();
                    renderDashboard();
                })
                .catch(() => {
                    widgets = [];
                    renderDashboard();
                });
        }
    }
    
    function saveState() {
        try {
            localStorage.setItem('dashboardState', JSON.stringify(widgets));
        } catch (e) {
            // SES may block localStorage
        }
    }
    
    // --- Custom Drag, Drop, Resize Engine ---
    let dragState = {};
    
    dashboardGrid.addEventListener('dragstart', (e) => {
        if (e.target.classList.contains('widget')) {
            e.target.classList.add('dragging');
            dragState.draggedElement = e.target;
        }
    });

    dashboardGrid.addEventListener('dragend', (e) => {
        if (e.target.classList.contains('widget')) {
            e.target.classList.remove('dragging');
            dragState.placeholder?.remove();
            dragState = {};
            saveState();
        }
    });
    
    dashboardGrid.addEventListener('dragover', (e) => {
        e.preventDefault();
        const { x, y } = getGridCoordinates(e);

        if (!dragState.placeholder) {
            dragState.placeholder = document.createElement('div');
            dragState.placeholder.className = 'placeholder';
            dashboardGrid.appendChild(dragState.placeholder);
        }
        
        const widget = widgets.find(w => w.id === dragState.draggedElement.dataset.id);
        dragState.placeholder.style.gridColumn = `${x} / span ${widget.layout.w}`;
        dragState.placeholder.style.gridRow = `${y} / span ${widget.layout.h}`;
    });

    dashboardGrid.addEventListener('drop', (e) => {
        e.preventDefault();
        const { x, y } = getGridCoordinates(e);
        const widget = widgets.find(w => w.id === dragState.draggedElement.dataset.id);
        widget.layout.x = x;
        widget.layout.y = y;
        renderDashboard();
    });

    function makeResizable(widgetEl) {
        const handle = widgetEl.querySelector('.resize-handle');
        handle.addEventListener('mousedown', (e) => {
            e.preventDefault();
            dragState = {
                isResizing: true,
                widgetElement: widgetEl,
                startX: e.clientX,
                startY: e.clientY
            };
            window.addEventListener('mousemove', onResizeMove);
            window.addEventListener('mouseup', onResizeEnd);
        });
    }

    function onResizeMove(e) {
        if (!dragState.isResizing) return;
        
        const gridRect = dashboardGrid.getBoundingClientRect();
        const colWidth = gridRect.width / 12;
        const rowHeight = 100 + 16; // 100px row + 1rem gap
        
        const widget = widgets.find(w => w.id === dragState.widgetElement.dataset.id);
        const newWidth = Math.round((e.clientX - dragState.widgetElement.getBoundingClientRect().left) / colWidth);
        const newHeight = Math.round((e.clientY - dragState.widgetElement.getBoundingClientRect().top) / rowHeight);

        if (newWidth > 0 && newHeight > 0) {
            dragState.widgetElement.style.gridColumnEnd = `span ${newWidth}`;
            dragState.widgetElement.style.gridRowEnd = `span ${newHeight}`;
            widget.layout.w = newWidth;
            widget.layout.h = newHeight;
        }
    }

    function onResizeEnd() {
        dragState = {};
        window.removeEventListener('mousemove', onResizeMove);
        window.removeEventListener('mouseup', onResizeEnd);
        saveState();
    }

    // --- Rendering ---
    function renderDashboard() {
        dashboardGrid.innerHTML = '';
        widgets.forEach(widget => {
            const widgetEl = widgetTemplate.content.cloneNode(true).firstElementChild;
            widgetEl.dataset.id = widget.id;
            widgetEl.style.gridColumn = `${widget.layout.x} / span ${widget.layout.w}`;
            widgetEl.style.gridRow = `${widget.layout.y} / span ${widget.layout.h}`;
            widgetEl.querySelector('.widget-title').textContent = widget.title;
            
            dashboardGrid.appendChild(widgetEl);
            makeResizable(widgetEl);

            // Attach canvas and context for rendering
            widget.canvas = widgetEl.querySelector('.widget-canvas');
            widget.ctx = widget.canvas.getContext('2d');
            
            const resizeObserver = new ResizeObserver(() => {
                widget.canvas.width = widget.canvas.clientWidth;
                widget.canvas.height = widget.canvas.clientHeight;
            });
            resizeObserver.observe(widget.canvas);
        });
    }

    // --- Chart Drawing Functions ---
const drawFunctions = {
    line: (widget) => {
        const { ctx, canvas, data } = widget;
        if (!data.target) return;
        if (data.current === null) data.current = data.target.map(() => 0);

        const width = canvas.width, height = canvas.height;
        const maxVal = Math.max(...data.target);
        
        ctx.beginPath();
        ctx.strokeStyle = '#4f46e5';
        ctx.lineWidth = 2;
        
        data.target.forEach((val, i) => {
            data.current[i] += (val - data.current[i]) * 0.1;
            const x = (i / (data.current.length - 1)) * width;
            const y = height - (data.current[i] / maxVal) * height;
            if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        });
        ctx.stroke();
    },
    bar: (widget) => {
        const { ctx, canvas, data } = widget;
        if (!data.target) return;
        if (data.current === null) data.current = data.target.map(d => ({...d, value: 0}));
        
        const width = canvas.width, height = canvas.height;
        const maxVal = Math.max(...data.target.map(d => d.value));
        const barWidth = width / data.current.length * 0.8;
        const barSpacing = width / data.current.length * 0.2;

        data.target.forEach((d, i) => {
            data.current[i].value += (d.value - data.current[i].value) * 0.1;
            const barHeight = (data.current[i].value / maxVal) * height;
            const x = i * (barWidth + barSpacing);
            const y = height - barHeight;
            ctx.fillStyle = '#4f46e5';
            ctx.fillRect(x, y, barWidth, barHeight);
        });
    },
    gauge: (widget) => {
        const { ctx, canvas, data } = widget;
        if (!data.target) return;
        if (data.current === null) data.current = { value: 0 };
        
        data.current.value += (data.target.value - data.current.value) * 0.1;
        
        const width = canvas.width, height = canvas.height;
        const centerX = width / 2, centerY = height - 20;
        const radius = Math.min(width, height) / 2 * 0.8;
        const angle = (data.current.value / data.target.max) * Math.PI;

        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 15;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, Math.PI, 2 * Math.PI);
        ctx.stroke();
        
        ctx.strokeStyle = '#4f46e5';
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, Math.PI, Math.PI + angle);
        ctx.stroke();

        ctx.fillStyle = '#1f2937';
        ctx.font = 'bold 24px Poppins';
        ctx.textAlign = 'center';
        ctx.fillText(`${Math.round(data.current.value)}%`, centerX, centerY - 10);
    },
    kpi: (widget) => {
        const { ctx, canvas, data } = widget;
        if (!data.target) return;
        if (data.current === null) data.current = 0;

        data.current += (data.target - data.current) * 0.1;

        ctx.fillStyle = '#1f2937';
        ctx.font = 'bold 48px Poppins';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(Math.round(data.current).toLocaleString(), canvas.width / 2, canvas.height / 2);
    },
};

    // --- Animation & Data Update Loop ---
    function animationLoop() {
        widgets.forEach(widget => {
            if (widget.ctx) {
                widget.ctx.clearRect(0, 0, widget.canvas.width, widget.canvas.height);
                drawFunctions[widget.type]?.(widget);
            }
        });
        requestAnimationFrame(animationLoop);
    }
    
    function fetchDataLoop() {
        widgets.forEach(widget => {
            const data = mockApiService[widget.apiEndpoint]();
            // Easing: The target is updated, the animation loop will handle the rest
            widget.data.target = data;
        });
    }
    
    // --- Utility ---
    function getGridCoordinates(e) {
        const gridRect = dashboardGrid.getBoundingClientRect();
        const x = e.clientX - gridRect.left;
        const y = e.clientY - gridRect.top;
        const col = Math.floor(x / (gridRect.width / 12)) + 1;
        const row = Math.floor(y / (100 + 16)) + 1;
        return { x: col, y: row };
    }
    
    // --- Chart Implementations (with Easing) ---
    // (This is a simplified version of the logic for brevity, the full logic is in the next block)
    
    // --- Initialize ---
    loadState();
    renderDashboard();
    setInterval(fetchDataLoop, 2000);
    requestAnimationFrame(animationLoop);
});