// --- script.js ---

import { defaultRules } from './rules.js';

// --- State ---
let availableRules = { ...defaultRules };
let lintingErrors = [];
let currentHighlightMarker = null;

// --- DOM Elements ---
const codeEditorTextarea = document.getElementById('code-editor');
const rulesContainer = document.getElementById('rules-container');
const errorsList = document.getElementById('errors-list');
const errorCount = document.getElementById('error-count');
const applyFixesBtn = document.getElementById('apply-fixes-btn');
const helpBtn = document.getElementById('help-btn');
const helpModal = document.getElementById('help-modal');
const modalCloseBtn = document.getElementById('modal-close-btn');
const rulePopover = document.getElementById('rule-popover');
const astContainer = document.getElementById('ast-container');
// Custom Rule Form is omitted from this script as it's a more advanced feature not included in the final requested build

// --- CodeMirror Setup ---
const editor = CodeMirror.fromTextArea(codeEditorTextarea, {
    lineNumbers: true, mode: 'javascript', theme: 'material-darker',
});
editor.setValue(`var x = 10;\nif (x == '10') {\n    console.log("This is a test.");\n}\n\nfunction greet() {\n    var message = "Hello, world!";\n    return message;\n}`);

// --- Web Worker ---
const linterWorker = new Worker('linter-worker.js');

linterWorker.onmessage = (e) => {
    const { errors, ast } = e.data;
    lintingErrors = errors;
    renderErrors(lintingErrors);
    renderAstTree(ast);
};

// --- Linter Logic ---
function updateLinting() {
    const code = editor.getValue();
    const activeRuleIds = Array.from(rulesContainer.querySelectorAll('input:checked')).map(input => input.dataset.ruleId);
    
    const serializableRules = {};
    for (const id in availableRules) {
        serializableRules[id] = {
            meta: availableRules[id].meta,
            createFnString: availableRules[id].create.toString()
        };
    }
    
    linterWorker.postMessage({ code, availableRules: serializableRules, activeRuleIds });
}

// --- UI Rendering ---
function renderRuleCards() {
    rulesContainer.innerHTML = '';
    for (const ruleId in availableRules) {
        const rule = availableRules[ruleId];
        const card = document.createElement('div');
        card.className = 'rule-card';
        card.id = `rule-card-${ruleId}`;
        card.innerHTML = `
            <div class="rule-header">
                <div class="rule-title">
                    <span class="info-icon" data-rule-id="${ruleId}">ⓘ</span>
                    <span>${ruleId}</span>
                </div>
                <label class="toggle-switch">
                    <input type="checkbox" data-rule-id="${ruleId}" checked>
                </label>
            </div>
            <p class="rule-description">${rule.meta.description}</p>
        `;
        rulesContainer.appendChild(card);
    }
}

function renderErrors(errors) {
    errorsList.innerHTML = '';
    errorCount.textContent = errors.length;
    applyFixesBtn.disabled = errors.filter(e => e.fixable).length === 0;

    if (errors.length === 0) {
        errorsList.innerHTML = '<li>No errors found. Great job!</li>';
        return;
    }

    errors.forEach((error, index) => {
        const li = document.createElement('li');
        li.className = 'error-item';
        li.dataset.errorIndex = index;
        li.dataset.ruleId = error.ruleId;
        
        let fixButtonHTML = '';
        if (error.fixable) {
            fixButtonHTML = `<button class="fix-btn" data-error-index="${index}">Apply Fix</button>`;
        }
        
        li.innerHTML = `
            <div class="error-details">
                <div class="error-message">${error.message} <span class="rule-name">(${error.ruleId})</span></div>
                <div class="error-location">Line ${error.line}, Column ${error.column}</div>
            </div>
            ${fixButtonHTML}
        `;
        errorsList.appendChild(li);
    });
}

function renderAstTree(ast) {
    astContainer.innerHTML = '';
    if (!ast) {
        astContainer.innerHTML = '<p class="placeholder">Could not parse code. Check for syntax errors.</p>';
        return;
    }
    const treeEl = document.createElement('ul');
    treeEl.className = 'ast-tree';
    treeEl.appendChild(createAstNodeElement(ast));
    astContainer.appendChild(treeEl);
}

function createAstNodeElement(node) {
    const li = document.createElement('li');
    li.className = 'ast-node';
    const line = document.createElement('div');
    line.className = 'node-line';
    line.dataset.start = node.start;
    line.dataset.end = node.end;
    const type = document.createElement('span');
    type.className = 'node-type';
    type.textContent = node.type;
    const range = document.createElement('span');
    range.className = 'node-range';
    range.textContent = ` [${node.start}-${node.end}]`;
    line.appendChild(type);
    line.appendChild(range);
    li.appendChild(line);
    const childrenUl = document.createElement('ul');
    childrenUl.className = 'ast-tree';
    for (const key in node) {
        if (key === 'loc' || key === 'start' || key === 'end' || key === 'range') continue;
        const value = node[key];
        if (typeof value === 'object' && value !== null) {
            if (Array.isArray(value)) {
                value.forEach(child => { if(child && child.type) childrenUl.appendChild(createAstNodeElement(child)) });
            } else if (value.type) {
                childrenUl.appendChild(createAstNodeElement(value));
            }
        }
    }
    if (childrenUl.hasChildNodes()) li.appendChild(childrenUl);
    return li;
}

// --- Interactivity ---
function highlightInEditor(start, end) {
    if (currentHighlightMarker) currentHighlightMarker.clear();
    currentHighlightMarker = editor.markText(editor.posFromIndex(start), editor.posFromIndex(end), { className: 'code-highlight' });
}
function highlightInAst(start, end) {
    document.querySelectorAll('.node-line.highlighted').forEach(el => el.classList.remove('highlighted'));
    const nodes = document.querySelectorAll('.node-line');
    let bestNode = null;
    for (const nodeEl of nodes) {
        const nodeStart = parseInt(nodeEl.dataset.start);
        const nodeEnd = parseInt(nodeEl.dataset.end);
        if (nodeStart <= start && nodeEnd >= end) {
            if (!bestNode || (nodeEnd - nodeStart < bestNode.dataset.end - bestNode.dataset.start)) bestNode = nodeEl;
        }
    }
    if(bestNode) {
        bestNode.classList.add('highlighted');
        bestNode.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
}

function applyFix(error) {
    if (!error.fixFnString) return null;
    let fixResult = null;
    const fixer = {
        replaceTextRange: (range, newText) => {
            fixResult = { range, text: newText };
        }
    };
    const fixFunction = eval(`(${error.fixFnString})`);
    fixFunction(fixer);
    return fixResult;
}

function showRulePopover(ruleId, targetElement) {
    const rule = availableRules[ruleId];
    if (!rule) return;
    rulePopover.innerHTML = `
        <h5>Good Example ✅</h5>
        <pre><code class="language-js">${rule.meta.good_code}</code></pre>
        <h5>Bad Example ❌</h5>
        <pre><code class="language-js">${rule.meta.bad_code}</code></pre>
    `;
    const targetRect = targetElement.getBoundingClientRect();
    rulePopover.style.top = `${targetRect.bottom + 5}px`;
    rulePopover.style.left = `${targetRect.left}px`;
    rulePopover.classList.remove('hidden');
}

function hideRulePopover() {
    rulePopover.classList.add('hidden');
}

// --- Event Handlers ---
const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => { clearTimeout(timeoutId); timeoutId = setTimeout(() => { func.apply(this, args); }, delay); };
};

editor.on('change', debounce(updateLinting, 300));
rulesContainer.addEventListener('change', updateLinting);
editor.on('cursorActivity', () => {
    const from = editor.getCursor('from'); const to = editor.getCursor('to');
    const startPos = editor.indexFromPos(from); const endPos = editor.indexFromPos(to);
    if (startPos !== endPos) { if (currentHighlightMarker) currentHighlightMarker.clear(); }
    highlightInAst(startPos, endPos);
});
astContainer.addEventListener('mouseover', (e) => { const nodeEl = e.target.closest('.node-line'); if (nodeEl) highlightInEditor(nodeEl.dataset.start, nodeEl.dataset.end); });
astContainer.addEventListener('mouseout', () => { if (currentHighlightMarker) currentHighlightMarker.clear(); });

errorsList.addEventListener('mouseover', (e) => {
    const errorItem = e.target.closest('.error-item');
    if (errorItem) document.getElementById(`rule-card-${errorItem.dataset.ruleId}`)?.classList.add('highlighted');
});
errorsList.addEventListener('mouseout', (e) => {
    const errorItem = e.target.closest('.error-item');
    if (errorItem) document.getElementById(`rule-card-${errorItem.dataset.ruleId}`)?.classList.remove('highlighted');
});
errorsList.addEventListener('click', (e) => {
    const errorItem = e.target.closest('.error-item');
    if(!errorItem) return;
    document.querySelectorAll('.error-item.highlighted').forEach(el => el.classList.remove('highlighted'));
    errorItem.classList.add('highlighted');
    
    const errorIndex = parseInt(errorItem.dataset.errorIndex, 10);
    const error = lintingErrors[errorIndex];
    if (error && error.node) {
        highlightInEditor(error.node.start, error.node.end);
        highlightInAst(error.node.start, error.node.end);
    }

    if (e.target.classList.contains('fix-btn')) {
        const change = applyFix(error);
        if(change) {
            const startPos = editor.posFromIndex(change.range[0]);
            const endPos = editor.posFromIndex(change.range[1]);
            editor.replaceRange(change.text, startPos, endPos);
        }
        setTimeout(updateLinting, 50);
    }
});

applyFixesBtn.addEventListener('click', () => {
    const changes = lintingErrors.filter(e => e.fixable).map(applyFix).filter(Boolean);
    changes.sort((a, b) => b.range[0] - a.range[0]);
    editor.operation(() => {
        changes.forEach(change => {
            const startPos = editor.posFromIndex(change.range[0]);
            const endPos = editor.posFromIndex(change.range[1]);
            editor.replaceRange(change.text, startPos, endPos);
        });
    });
    setTimeout(updateLinting, 50);
});

helpBtn.addEventListener('click', () => helpModal.classList.remove('hidden'));
modalCloseBtn.addEventListener('click', () => helpModal.classList.add('hidden'));
helpModal.addEventListener('click', (e) => { if(e.target === helpModal) helpModal.classList.add('hidden'); });

rulesContainer.addEventListener('mouseover', (e) => {
    const infoIcon = e.target.closest('.info-icon');
    if (infoIcon) showRulePopover(infoIcon.dataset.ruleId, infoIcon);
});
rulesContainer.addEventListener('mouseout', (e) => {
    const infoIcon = e.target.closest('.info-icon');
    if (infoIcon) hideRulePopover();
});

// --- Initial Load ---
renderRuleCards();
updateLinting();