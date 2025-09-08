// --- script.js ---

import { analyzeUrl } from './analyzer.js';
import { generateReportHTML, drawGauges } from './reporter.js';

// --- DOM Elements ---
const auditForm = document.getElementById('audit-form');
const urlInput = document.getElementById('url-input');
const analyzeBtn = document.getElementById('analyze-btn');
const loadingSpinner = document.getElementById('loading-spinner');
const reportContainer = document.getElementById('report-container');

// --- State ---
let previousAudits = {};

// --- Functions ---

function loadPreviousAudits() {
    const saved = localStorage.getItem('performanceAudits');
    previousAudits = saved ? JSON.parse(saved) : {};
}

function saveAudit(auditData) {
    previousAudits[auditData.url] = auditData;
    localStorage.setItem('performanceAudits', JSON.stringify(previousAudits));
}

async function runAudit(e) {
    e.preventDefault();
    const url = urlInput.value.trim();
    if (!url) return;

    // Reset UI
    reportContainer.innerHTML = '';
    loadingSpinner.classList.remove('hidden');
    analyzeBtn.disabled = true;

    try {
        const previousData = previousAudits[url] || null;
        const auditData = await analyzeUrl(url);
        
        const reportHTML = generateReportHTML(auditData, previousData);
        reportContainer.innerHTML = reportHTML;
        
        // After the HTML is in the DOM, draw the canvas gauges
        drawGauges();
        
        // Save the new audit for future comparison
        saveAudit(auditData);

    } catch (error) {
        reportContainer.innerHTML = `<p class="error-message">Error: ${error.message}</p>`;
        console.error(error);
    } finally {
        loadingSpinner.classList.add('hidden');
        analyzeBtn.disabled = false;
    }
}

// --- Event Listeners ---
auditForm.addEventListener('submit', runAudit);

// --- Initial Load ---
loadPreviousAudits();