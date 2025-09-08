document.addEventListener('DOMContentLoaded', () => {

    // --- DOM Elements ---
    const canvas = document.getElementById('bar-chart-canvas');
    const ctx = canvas.getContext('2d');
    const chartContainer = document.getElementById('chart-container');
    const chartTitle = document.getElementById('chart-title');
    const tooltip = document.getElementById('tooltip');

    // --- State & Config ---
    let chartState = []; // e.g., [{ label, targetValue, currentValue, color }]
    let chartConfig = {};
    let hoveredBarIndex = -1;

    // --- Core Functions ---
    
    async function initializeChart() {
        try {
            const response = await fetch('data.json');
            const config = await response.json();
            
            chartConfig = config;
            chartTitle.textContent = chartConfig.title;

            // Initialize chartState with both target and current values
            chartState = config.data.map(item => ({
                label: item.label,
                targetValue: item.value,
                currentValue: 0, // Start all bars at 0
                color: chartConfig.barColor || '#4f46e5'
            }));

            // Start the perpetual animation loop
            requestAnimationFrame(animationLoop);
            
            // Start the live data simulation
            setInterval(simulateDataUpdate, 3000);

        } catch (error) {
            chartTitle.textContent = 'Error loading chart data';
            console.error(error);
        }
    }

    // --- Animation Engine ---
    
    function animationLoop() {
        // Clear the canvas for the new frame
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Animate the state
        let isAnimating = false;
        chartState.forEach(bar => {
            const difference = bar.targetValue - bar.currentValue;
            if (Math.abs(difference) > 0.01) {
                // Easing / Interpolation
                bar.currentValue += difference * 0.08;
                isAnimating = true;
            } else {
                bar.currentValue = bar.targetValue; // Snap to target
            }
        });

        // Draw the current state of the chart
        drawChart();

        // Continue the loop
        requestAnimationFrame(animationLoop);
    }
    
    // --- Live Data Simulation ---

    function simulateDataUpdate() {
        chartState.forEach(bar => {
            // Update the targetValue to a new random number
            bar.targetValue = Math.floor(Math.random() * 800) + 100; // Random value between 100-900
        });
    }

    // --- Canvas Drawing ---

    function drawChart() {
        const { width, height } = canvas;
        const padding = { top: 20, right: 20, bottom: 40, left: 50 };
        const chartWidth = width - padding.left - padding.right;
        const chartHeight = height - padding.top - padding.bottom;
        
        const maxValue = Math.max(...chartState.map(b => b.targetValue), 100); // Use targetValue for stable axis
        const barWidth = chartWidth / chartState.length * 0.6;
        const barSpacing = chartWidth / chartState.length * 0.4;
        
        // Draw Y-axis and labels
        ctx.strokeStyle = '#cbd5e1';
        ctx.fillStyle = '#6b7280';
        ctx.font = '12px Poppins';
        ctx.beginPath();
        ctx.moveTo(padding.left, padding.top);
        ctx.lineTo(padding.left, height - padding.bottom);
        ctx.stroke();

        for(let i = 0; i <= 5; i++) {
            const value = (maxValue / 5) * i;
            const y = height - padding.bottom - (value / maxValue) * chartHeight;
            ctx.fillText(Math.round(value), padding.left - 40, y + 4);
        }

        // Draw X-axis
        ctx.beginPath();
        ctx.moveTo(padding.left, height - padding.bottom);
        ctx.lineTo(width - padding.right, height - padding.bottom);
        ctx.stroke();

        // Draw bars
        chartState.forEach((bar, index) => {
            const barHeight = (bar.currentValue / maxValue) * chartHeight;
            const x = padding.left + index * (barWidth + barSpacing) + barSpacing / 2;
            const y = height - padding.bottom - barHeight;
            
            ctx.fillStyle = bar.color;
            if(index === hoveredBarIndex) {
                // Make hovered bar slightly lighter
                ctx.globalAlpha = 0.8;
            }
            ctx.fillRect(x, y, barWidth, barHeight);
            ctx.globalAlpha = 1.0;
            
            // Draw X-axis labels
            ctx.fillStyle = '#1f2937';
            ctx.textAlign = 'center';
            ctx.fillText(bar.label, x + barWidth / 2, height - padding.bottom + 20);
        });
    }

    // --- Interactivity & Responsiveness ---
    
    function handleMouseMove(e) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const padding = { left: 50 };
        const chartWidth = canvas.width - padding.left - 20;
        const barTotalWidth = chartWidth / chartState.length;

        const index = Math.floor((x - padding.left) / barTotalWidth);

        if (index >= 0 && index < chartState.length) {
            const bar = chartState[index];
            const barX = padding.left + index * barTotalWidth + barTotalWidth / 2;
            
            tooltip.classList.remove('hidden');
            tooltip.style.left = `${barX}px`;
            tooltip.style.top = `${e.clientY - rect.top - 50}px`;
            tooltip.innerHTML = `<strong>${bar.label}</strong>: ${Math.round(bar.targetValue)}`;
            
            hoveredBarIndex = index;
        } else {
            tooltip.classList.add('hidden');
            hoveredBarIndex = -1;
        }
    }

    function setupResponsiveCanvas() {
        const resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                const { width, height } = entry.contentRect;
                canvas.width = width;
                canvas.height = height;
                // No need to call drawChart() here, animationLoop handles it
            }
        });
        resizeObserver.observe(chartContainer);
    }
    
    // --- Initial Setup ---
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', () => {
        tooltip.classList.add('hidden');
        hoveredBarIndex = -1;
    });
    
    setupResponsiveCanvas();
    initializeChart();
});