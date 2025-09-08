// --- reporter.js ---

/**
 * Generates the complete HTML for the report.
 * @param {object} auditData - The data from the analyzer.
 * @param {object|null} previousData - The data from a previous audit, if it exists.
 * @returns {string} The complete HTML string for the report.
 */
export function generateReportHTML(auditData, previousData = null) {
    return `
        <div class="report-header">
            <div>
                <p>Report for:</p>
                <h2 class="report-url">${auditData.url}</h2>
            </div>
            <button class="btn" onclick="window.print()">Export as PDF</button>
        </div>
        
        <section class="report-scores">
            ${generateScoreCard('Performance', auditData.performanceScore, previousData?.performanceScore)}
            ${generateScoreCard('Accessibility', auditData.accessibilityScore, previousData?.accessibilityScore)}
        </section>

        <section class="report-section">
            <h3>Core Metrics</h3>
            <div class="metric-grid">
                ${generateMetricCard('Largest Contentful Paint', auditData.metrics.lcp)}
                ${generateMetricCard('Cumulative Layout Shift', auditData.metrics.cls)}
                ${generateMetricCard('First Input Delay', auditData.metrics.fid)}
            </div>
        </section>
        
        <section class="report-section">
            <h3>Diagnostics</h3>
            <ul class="diagnostic-list">
                ${auditData.diagnostics.map(d => generateDiagnosticItem(d)).join('')}
            </ul>
        </section>
    `;
}

function generateScoreCard(title, score, prevScore = null) {
    let comparisonHTML = '';
    if (prevScore !== null) {
        const diff = score - prevScore;
        const diffClass = diff >= 0 ? 'positive' : 'negative';
        comparisonHTML = `<p class="score-comparison">vs. previous: ${prevScore} <span class="${diffClass}">(${diff > 0 ? '+' : ''}${diff})</span></p>`;
    }

    return `
        <div class="score-card">
            <h3>${title}</h3>
            <canvas class="score-gauge" data-score="${score}" width="150" height="150"></canvas>
            ${comparisonHTML}
        </div>
    `;
}

function generateMetricCard(label, value) {
    return `<div class="metric-card"><div class="label">${label}</div><div class="value">${value}</div></div>`;
}

function generateDiagnosticItem({ text, pass }) {
    const statusClass = pass ? 'pass' : 'fail';
    const icon = pass ? '✅' : '❌';
    return `<li class="diagnostic-item"><span class="${statusClass}">${icon} ${text}</span></li>`;
}

/**
 * Finds all gauge canvases and draws the charts.
 */
export function drawGauges() {
    document.querySelectorAll('.score-gauge').forEach(canvas => {
        const score = parseInt(canvas.dataset.score, 10);
        drawGauge(canvas.getContext('2d'), score);
    });
}

function drawGauge(ctx, score) {
    const size = 150;
    const center = size / 2;
    const radius = size / 2 - 20;
    const lineWidth = 15;
    
    ctx.clearRect(0, 0, size, size);

    // Determine color based on score
    let color = 'var(--score-good)';
    if (score < 50) color = 'var(--score-bad)';
    else if (score < 90) color = 'var(--score-medium)';
    
    // Background arc
    ctx.beginPath();
    ctx.arc(center, center, radius, Math.PI, 2 * Math.PI);
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = lineWidth;
    ctx.stroke();

    // Foreground arc
    const endAngle = Math.PI + (score / 100) * Math.PI;
    ctx.beginPath();
    ctx.arc(center, center, radius, Math.PI, endAngle);
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
    
    // Text
    ctx.fillStyle = color;
    ctx.font = 'bold 36px Poppins';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(score, center, center);
}