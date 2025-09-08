// --- validator.js ---

// A collection of reusable, pure validation functions
const rules = {
    isRequired: (value) => {
        if (typeof value === 'boolean') return value; // For checkboxes
        return value !== '';
    },
    isEmail: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    minLength: (value, length) => value.length >= parseInt(length, 10),
    isStrongPassword: (value) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(value),
    match: (value, fieldNameToMatch, form) => {
        const fieldToMatch = form.querySelector(`[name="${fieldNameToMatch}"]`);
        return fieldToMatch ? value === fieldToMatch.value : false;
    },
    // Mock async rule
    isUsernameAvailable: async (value) => {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
        const takenUsernames = ['admin', 'test', 'user', 'root'];
        return !takenUsernames.includes(value.toLowerCase());
    }
};

const defaultErrorMessages = {
    isRequired: 'This field is required.',
    isEmail: 'Please enter a valid email address.',
    minLength: (length) => `Must be at least ${length} characters long.`,
    isStrongPassword: 'Password must be 8+ characters with one uppercase, lowercase, and number.',
    match: (fieldName) => `This field must match the ${fieldName} field.`,
    isUsernameAvailable: 'This username is already taken.',
};

class Validator {
    constructor(form, config, options = {}) {
        this.form = form;
        this.config = config;
        this.options = options; // Store options, including callbacks
        this.fields = {};
        this.init();
    }

    init() {
        for (const fieldName in this.config) {
            const input = this.form.querySelector(`[name="${fieldName}"]`);
            if (input) {
                this.fields[fieldName] = {
                    input,
                    rules: this.config[fieldName],
                    errorElement: input.parentElement.querySelector('.error-message'),
                    isValid: false
                };
                input.addEventListener('input', () => this.validateField(fieldName));
                input.addEventListener('blur', () => this.validateField(fieldName));
            }
        }
        
        this.form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const isFormValid = await this.validateForm();
            if (isFormValid) {
                console.log('Form is valid! Submitting...');
                alert('Form submitted successfully!');
            } else {
                console.log('Form is invalid.');
            }
        });
    }
    
    async validateField(fieldName) {
        const field = this.fields[fieldName];
        let fieldIsValid = true;
        let errorMessage = '';
        
        for(const ruleConfig of field.rules) {
            const [ruleName, param] = ruleConfig.split(':');
            const ruleFunction = rules[ruleName];
            const isCheckbox = field.input.type === 'checkbox';
            const value = isCheckbox ? field.input.checked : field.input.value;

            // Call the callback to show the "checking" state
            this.options.onRuleCheck?.(fieldName, ruleConfig, 'checking');
            
            const isValid = await ruleFunction(value, param, this.form);
            
            if (isValid) {
                this.options.onRuleCheck?.(fieldName, ruleConfig, 'pass');
            } else {
                fieldIsValid = false;
                errorMessage = this.getErrorMessage(ruleName, param);
                this.options.onRuleCheck?.(fieldName, ruleConfig, 'fail');
                break; // Stop on the first error
            }
        }
        
        field.isValid = fieldIsValid;
        if (fieldIsValid) {
            this.clearError(field);
        } else {
            this.showError(field, errorMessage);
        }
        
        return fieldIsValid;
    }

    async validateForm() {
        let isFormValid = true;
        for(const fieldName in this.fields) {
            const isFieldValid = await this.validateField(fieldName);
            if(!isFieldValid) {
                isFormValid = false;
            }
        }
        return isFormValid;
    }
    
    getErrorMessage(ruleName, param) {
        const message = defaultErrorMessages[ruleName];
        return typeof message === 'function' ? message(param) : message;
    }
    
    showError(field, message) {
        field.input.classList.add('invalid');
        field.input.classList.remove('valid');
        field.errorElement.textContent = message;
    }
    
    clearError(field) {
        field.input.classList.remove('invalid');
        field.input.classList.add('valid');
        field.errorElement.textContent = '';
    }
}

export default Validator;