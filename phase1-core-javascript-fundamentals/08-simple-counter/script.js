document.addEventListener('DOMContentLoaded', () => {

    // --- DOM Elements ---
    const counterDisplay = document.getElementById('counter-display');
    const incrementBtn = document.getElementById('increment-btn');
    const decrementBtn = document.getElementById('decrement-btn');
    const resetBtn = document.getElementById('reset-btn');
    const stepInput = document.getElementById('step-input');
    const setValueInput = document.getElementById('set-value-input');
    const setBtn = document.getElementById('set-btn');
    
    // --- Application State ---
    let count = 0;

    // --- Functions ---
    
    /**
     * Loads the count from localStorage if it exists.
     */
    function loadInitialCount() {
        const savedCount = localStorage.getItem('counterValue');
        if (savedCount !== null) {
            count = parseInt(savedCount, 10);
        }
        updateDisplay();
    }
    
    /**
     * Updates the display with the current count and handles styling and animations.
     */
    function updateDisplay() {
        // Update the text
        counterDisplay.textContent = count;

        // Update the color based on the count value
        if (count > 0) {
            counterDisplay.style.color = 'var(--positive-color)';
        } else if (count < 0) {
            counterDisplay.style.color = 'var(--negative-color)';
        } else {
            counterDisplay.style.color = 'var(--primary-text-color)';
        }
        
        // Trigger the pop animation
        counterDisplay.classList.add('pop');
        // Remove the class after the animation finishes to allow it to be re-added
        setTimeout(() => {
            counterDisplay.classList.remove('pop');
        }, 300); // Duration should match the CSS animation duration
        
        // Save the new count to localStorage
        localStorage.setItem('counterValue', count);
    }
    
    /**
     * Gets the current step value from the input field.
     * @returns {number} The step value.
     */
    function getStep() {
        const step = parseInt(stepInput.value, 10);
        // Ensure the step is a valid positive number, default to 1 otherwise
        return !isNaN(step) && step > 0 ? step : 1;
    }

    // --- Event Handlers ---

    incrementBtn.addEventListener('click', () => {
        count += getStep();
        updateDisplay();
    });

    decrementBtn.addEventListener('click', () => {
        count -= getStep();
        updateDisplay();
    });

    resetBtn.addEventListener('click', () => {
        count = 0;
        stepInput.value = 1;
        setValueInput.value = '';
        updateDisplay();
    });
    
    setBtn.addEventListener('click', () => {
        const value = parseInt(setValueInput.value, 10);
        if (!isNaN(value)) {
            count = value;
            updateDisplay();
            setValueInput.value = ''; // Clear input after setting
        }
    });

    // --- Initial Load ---
    loadInitialCount();
});