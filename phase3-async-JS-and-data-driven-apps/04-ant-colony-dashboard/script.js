document.addEventListener('DOMContentLoaded', () => {

    // --- DOM Elements ---
    const dashboardGrid = document.getElementById('dashboard-grid');
    const addWidgetBtn = document.getElementById('add-widget-btn');
    const globalPauseResumeBtn = document.getElementById('global-pause-resume-btn');
    const modal = document.getElementById('add-widget-modal');
    const modalForm = document.getElementById('add-widget-form');
    const modalCancelBtn = document.getElementById('modal-cancel-btn');
    const widgetTemplate = document.getElementById('widget-template');

    // --- Application State ---
    let widgets = {}; // Use an object for easy lookup by ID
    let nextWidgetId = 0;
    let isGloballyPaused = false;

    // --- Widget Management ---
    function addWidget(type, interval) {
        const id = nextWidgetId++;
        const widget = {
            id, type, interval,
            history: [],
            worker: new Worker('worker.js'),
            domElement: createWidgetDOM(id, type),
        };

        dashboardGrid.appendChild(widget.domElement);
        widgets[id] = widget;

        widget.worker.onmessage = handleWorkerMessage;

        // Only send serializable data
        widget.worker.postMessage({ command: 'start', widget: { id, type, interval } });
    }

    function createWidgetDOM(id, type) {
        const widgetEl = widgetTemplate.content.cloneNode(true).firstElementChild;
        widgetEl.dataset.widgetId = id;
        const titleMap = { nursery: "Nursery", foodStore: "Food Stores", queenChamber: "Queen's Chamber" };
        widgetEl.querySelector('.widget-title').textContent = titleMap[type];
        widgetEl.querySelector('.close-widget-btn').addEventListener('click', () => removeWidget(id));
        return widgetEl;
    }
    
    function removeWidget(id) {
        const widget = widgets[id];
        if (!widget) return;
        
        widget.worker.terminate(); // Stop the background thread
        widget.domElement.remove();
        delete widgets[id];
    }
    
    // --- Worker Communication ---
    function handleWorkerMessage(e) {
        const { widgetId, status, data, error } = e.data;
        const widget = widgets[widgetId];
        if (!widget) return;
        
        const statusEl = widget.domElement.querySelector('.widget-status');
        widget.domElement.classList.add('pulse');
        widget.domElement.addEventListener('animationend', () => widget.domElement.classList.remove('pulse'), { once: true });
        
        if (status === 'success') {
            statusEl.textContent = 'Live';
            statusEl.classList.remove('error');
            updateWidgetUI(widget, data);
        } else {
            statusEl.textContent = 'Error';
            statusEl.classList.add('error');
            console.error(`Error from widget ${widgetId}:`, error);
        }
    }

    // --- UI Updates ---
    function updateWidgetUI(widget, data) {
        widget.domElement.querySelector('.population').textContent = data.population;
        widget.domElement.querySelector('.food').textContent = data.foodLevel;

        // Update history for the chart
        widget.history.push(data.population);
        if(widget.history.length > 20) widget.history.shift(); // Keep only last 20 data points
        
        renderChart(widget);
    }

    function renderChart(widget) {
        const svg = widget.domElement.querySelector('.mini-chart');
        const data = widget.history;
        if (data.length < 2) {
            svg.innerHTML = ''; // Not enough data to draw a line
            return;
        }

        const width = svg.clientWidth;
        const height = svg.clientHeight;
        const maxVal = Math.max(...data);
        const minVal = Math.min(...data);
        
        const yRange = (maxVal - minVal) > 0 ? (maxVal - minVal) : 1;
        const getX = (index) => (index / (data.length - 1)) * width;
        const getY = (val) => height - ((val - minVal) / yRange) * height;

        const linePoints = data.map((d, i) => `${getX(i)},${getY(d)}`).join(' ');
        const fillPoints = `${getX(0)},${height} ${linePoints} ${getX(data.length - 1)},${height}`;
        
        svg.innerHTML = `
            <polygon class="chart-fill" points="${fillPoints}"></polygon>
            <polyline class="chart-line" points="${linePoints}"></polyline>
        `;
    }
    
    // --- Event Handlers ---
    addWidgetBtn.addEventListener('click', () => modal.classList.remove('hidden'));
    modalCancelBtn.addEventListener('click', () => modal.classList.add('hidden'));
    modal.addEventListener('click', (e) => {
        if(e.target === modal) modal.classList.add('hidden');
    });

    modalForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const type = document.getElementById('chamber-type').value;
        const interval = parseInt(document.getElementById('update-interval').value, 10);
        addWidget(type, interval);
        modal.classList.add('hidden');
    });

    globalPauseResumeBtn.addEventListener('click', () => {
        isGloballyPaused = !isGloballyPaused;
        const command = isGloballyPaused ? 'stop' : 'start';
        globalPauseResumeBtn.textContent = isGloballyPaused ? 'Resume All' : 'Pause All';

        for(const id in widgets) {
            // Only send serializable data
            const { id: wid, type, interval } = widgets[id];
            widgets[id].worker.postMessage({ command, widget: { id: wid, type, interval } });
            const statusEl = widgets[id].domElement.querySelector('.widget-status');
            statusEl.textContent = isGloballyPaused ? 'Paused' : 'Live';
            statusEl.classList.toggle('paused', isGloballyPaused);
        }
    });
    
    // Initial Widgets
    addWidget('nursery', 3);
    addWidget('foodStore', 5);
});