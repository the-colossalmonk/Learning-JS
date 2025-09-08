// --- script.js ---

import Validator from './validator.js';

// --- DOM Elements ---
const form = document.getElementById('signup-form');
const inspectorContent = document.getElementById('inspector-content');

// --- State ---
const validationConfig = {
    'username': ['isRequired', 'minLength:5', 'isUsernameAvailable'],
    'email': ['isRequired', 'isEmail'],
    'password': ['isRequired', 'isStrongPassword'],
    'password-confirm': ['isRequired', 'match:password'],
    'terms': ['isRequired'],
};

// --- Inspector Panel UI Logic ---

function showInspectorPlaceholder() {
    inspectorContent.classList.add('placeholder');
    inspectorContent.innerHTML = `<p>Focus on a form field to begin.</p>`;
}

function updateInspector(fieldName) {
    const rules = validationConfig[fieldName];
    if (!rules) return;
    
    inspectorContent.classList.remove('placeholder');
    inspectorContent.innerHTML = `
        <h3>Field: <span id="field-name">${fieldName}</span></h3>
        <p>The following validation rules are being applied:</p>
        <ul id="validation-rules">
            ${rules.map(rule => `<li class="rule-item pending" data-rule="${rule}"><span class="status-icon"></span>${rule}</li>`).join('')}
        </ul>
    `;
}

function setRuleStatus(fieldName, rule, status) {
    // Ensure the inspector is showing the correct field before updating a rule
    const inspectorField = inspectorContent.querySelector('#field-name');
    if (inspectorField && inspectorField.textContent === fieldName) {
        const ruleItem = inspectorContent.querySelector(`.rule-item[data-rule="${rule}"]`);
        if (ruleItem) {
            ruleItem.className = `rule-item ${status}`;
        }
    }
}

// --- Main ---

// Create the callback function that the Validator will use
const inspectorCallback = (fieldName, rule, status) => {
    setRuleStatus(fieldName, rule, status);
};

// Initialize the validator with the form, config, and our callback options
new Validator(form, validationConfig, {
    onRuleCheck: inspectorCallback
});

// Add focus listeners to all inputs to control the Inspector UI
form.querySelectorAll('input').forEach(input => {
    input.addEventListener('focus', () => {
        updateInspector(input.name);
    });
});

// Set initial state
showInspectorPlaceholder();