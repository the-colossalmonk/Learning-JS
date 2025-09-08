// --- analyzer.js ---

const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

/**
 * Main function to run all audits on a given URL.
 * @param {string} url - The URL to analyze.
 * @returns {Promise<object>} A promise that resolves with the audit data.
 */
export async function analyzeUrl(url) {
    const response = await fetch(`${CORS_PROXY}${encodeURIComponent(url)}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch the URL. Status: ${response.status}`);
    }
    const html = await response.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');

    // Run all individual audits
    const imageAudit = auditImages(doc);
    const scriptAudit = auditScripts(doc);
    const metaAudit = auditMeta(doc);
    
    // Calculate a performance score based on audit results
    let performanceScore = 100;
    performanceScore -= imageAudit.issues.length * 5; // Each image issue costs 5 points
    performanceScore -= scriptAudit.issues.length * 3;
    performanceScore -= metaAudit.issues.length * 10;
    performanceScore = Math.max(0, performanceScore); // Clamp at 0

    // Simulate Core Web Vitals based on the score
    const simulatedVitals = {
        lcp: (2.5 - (performanceScore / 100) * 1.5).toFixed(2) + 's',
        cls: (0.25 - (performanceScore / 100) * 0.2).toFixed(3),
        fid: Math.round(100 - (performanceScore / 100) * 70) + 'ms',
    };

    return {
        url,
        performanceScore,
        accessibilityScore: Math.floor(Math.random() * 21) + 80, // Fake a11y score
        metrics: simulatedVitals,
        diagnostics: [
            ...imageAudit.results,
            ...scriptAudit.results,
            ...metaAudit.results
        ],
        // Keep a list of raw issues for scoring
        issues: [...imageAudit.issues, ...scriptAudit.issues, ...metaAudit.issues]
    };
}

// --- Individual Audit Functions ---

function auditImages(doc) {
    const images = Array.from(doc.querySelectorAll('img'));
    const results = [];
    const issues = [];
    
    if (images.length === 0) {
        results.push({ text: 'Page contains no <img> elements.', pass: true });
        return { results, issues };
    }

    const missingAlt = images.filter(img => !img.alt).length;
    if (missingAlt > 0) {
        results.push({ text: `${missingAlt} image(s) are missing an alt attribute.`, pass: false });
        issues.push('missing-alt');
    } else {
        results.push({ text: 'All images have alt attributes.', pass: true });
    }
    
    const missingDimensions = images.filter(img => !img.width || !img.height).length;
    if (missingDimensions > 0) {
        results.push({ text: `${missingDimensions} image(s) are missing explicit width and height attributes, which can cause layout shift.`, pass: false });
        issues.push('missing-dimensions');
    } else {
        results.push({ text: 'All images have explicit dimensions.', pass: true });
    }

    return { results, issues };
}

function auditScripts(doc) {
    const scripts = Array.from(doc.querySelectorAll('script[src]'));
    const results = [];
    const issues = [];

    const blockingScripts = scripts.filter(s => !s.async && !s.defer).length;
    if (blockingScripts > 0) {
        results.push({ text: `${blockingScripts} script(s) are render-blocking. Consider adding 'async' or 'defer'.`, pass: false });
        issues.push('render-blocking-script');
    } else {
        results.push({ text: 'Scripts appear to be loaded asynchronously.', pass: true });
    }
    
    return { results, issues };
}

function auditMeta(doc) {
    const results = [];
    const issues = [];

    const viewport = doc.querySelector('meta[name="viewport"]');
    if (!viewport) {
        results.push({ text: 'No viewport meta tag found. This is critical for mobile responsiveness.', pass: false });
        issues.push('no-viewport');
    } else {
        results.push({ text: 'Viewport meta tag is present.', pass: true });
    }
    
    return { results, issues };
}