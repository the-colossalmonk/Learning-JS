document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element Selections ---
    const habitForm = document.getElementById('habit-form');
    const habitIdInput = document.getElementById('habit-id');
    const cueInput = document.getElementById('cue');
    const cravingInput = document.getElementById('craving');
    const responseInput = document.getElementById('response');
    const rewardInput = document.getElementById('reward');
    const formBtn = document.getElementById('form-btn');
    const habitList = document.getElementById('habit-list');
    const searchInput = document.getElementById('search-input');
    const visualizerTitle = document.getElementById('visualizer-title');
    const loopContainer = document.getElementById('loop-container');
    const loopStages = document.querySelectorAll('.loop-stage');

    // --- Application State ---
    let habits = [];
    let currentEditId = null;

    // --- Functions ---

    /**
     * Renders the list of habits to the DOM.
     * Filters habits based on the search input.
     */
    const renderHabits = () => {
        habitList.innerHTML = ''; // Clear the current list

        const searchTerm = searchInput.value.toLowerCase();
        
        const filteredHabits = habits.filter(habit => 
            (habit.cue && habit.cue.toLowerCase().includes(searchTerm)) ||
            (habit.response && habit.response.toLowerCase().includes(searchTerm))
        );

        if (filteredHabits.length === 0 && habits.length > 0) {
            habitList.innerHTML = '<p class="empty-list-msg">No habits match your search.</p>';
        } else if (habits.length === 0) {
             habitList.innerHTML = '<p class="empty-list-msg">No habits yet. Add one to get started!</p>';
        }

        filteredHabits.forEach(habit => {
            const habitItem = document.createElement('div');
            habitItem.className = 'habit-item';
            habitItem.dataset.id = habit.id;

            habitItem.innerHTML = `
                <span class="habit-item-name">${habit.response}</span>
                <div class="habit-item-actions">
                    <button class="edit-btn">Edit</button>
                    <button class="delete-btn">Delete</button>
                </div>
            `;
            habitList.appendChild(habitItem);
        });
    };

    /**
     * Saves the current habits array to localStorage.
     */
    const saveToLocalStorage = () => {
        localStorage.setItem('habits', JSON.stringify(habits));
    };

    /**
     * Loads habits from localStorage into the state.
     */
    const loadFromLocalStorage = () => {
        const storedHabits = localStorage.getItem('habits');
        if (storedHabits) {
            habits = JSON.parse(storedHabits);
        }
    };

    /**
     * Resets the form to its initial state.
     */
    const resetForm = () => {
        habitForm.reset();
        habitIdInput.value = '';
        currentEditId = null;
        formBtn.textContent = 'Add New Habit';
        formBtn.style.background = ''; // Reset to CSS gradient
    };

    /**
     * Displays the details of a selected habit in the visualizer panel with animations.
     * @param {string} id - The ID of the habit to display.
     */
    const displayInVisualizer = (id) => {
        const habit = habits.find(h => h.id == id);
        if (!habit) return;

        // Update active item style in the list
        document.querySelectorAll('.habit-item').forEach(item => item.classList.remove('active'));
        document.querySelector(`.habit-item[data-id="${id}"]`).classList.add('active');

        visualizerTitle.textContent = `Visualizing: ${habit.response}`;
        visualizerTitle.style.color = 'var(--font-color)';

        // Hide stages before showing them with animation
        loopStages.forEach(stage => stage.classList.remove('visible'));

        const contentMap = {
            'stage-cue': habit.cue,
            'stage-craving': habit.craving,
            'stage-response': habit.response,
            'stage-reward': habit.reward,
        };

        // Update content and trigger animation with a delay
        let delay = 0;
        loopStages.forEach(stage => {
            setTimeout(() => {
                stage.querySelector('.stage-content').textContent = contentMap[stage.id] || '-';
                stage.classList.add('visible');
            }, delay);
            delay += 200; // Staggered animation effect
        });
    };

    // --- Event Handlers ---

    /**
     * Handles form submission for both adding and editing habits.
     */
    const handleFormSubmit = (event) => {
        event.preventDefault();

        const cue = cueInput.value.trim();
        const craving = cravingInput.value.trim();
        const response = responseInput.value.trim();
        const reward = rewardInput.value.trim();

        if (!cue || !craving || !response || !reward) return;

        if (currentEditId) {
            // Editing existing habit
            const habitIndex = habits.findIndex(h => h.id == currentEditId);
            if (habitIndex > -1) {
                habits[habitIndex] = { ...habits[habitIndex], cue, craving, response, reward };
            }
        } else {
            // Adding new habit
            const newHabit = {
                id: Date.now().toString(),
                cue,
                craving,
                response,
                reward
            };
            habits.push(newHabit);
        }

        saveToLocalStorage();
        renderHabits();
        resetForm();
    };

    /**
     * Handles clicks within the habit list for selecting, editing, or deleting.
     * Uses event delegation.
     */
    const handleListClick = (event) => {
        const target = event.target;
        const habitItem = target.closest('.habit-item');
        if (!habitItem) return;

        const habitId = habitItem.dataset.id;

        if (target.classList.contains('delete-btn')) {
            // Delete habit
            habits = habits.filter(h => h.id !== habitId);
            saveToLocalStorage();
            renderHabits();
            // If the deleted habit was being visualized, clear the visualizer
            if (visualizerTitle.textContent.includes(habitItem.querySelector('.habit-item-name').textContent)) {
                visualizerTitle.textContent = 'Select a habit to visualize';
                loopStages.forEach(stage => {
                    stage.classList.remove('visible');
                    stage.querySelector('.stage-content').textContent = '-';
                });
            }
        } else if (target.classList.contains('edit-btn')) {
            // Edit habit
            const habitToEdit = habits.find(h => h.id === habitId);
            if (habitToEdit) {
                habitIdInput.value = habitToEdit.id;
                cueInput.value = habitToEdit.cue;
                cravingInput.value = habitToEdit.craving;
                responseInput.value = habitToEdit.response;
                rewardInput.value = habitToEdit.reward;
                
                currentEditId = habitId;
                formBtn.textContent = 'Save Changes';
                formBtn.style.background = 'var(--success-color)';
                cueInput.focus();
            }
        } else {
            // Select habit to visualize
            displayInVisualizer(habitId);
        }
    };

    // --- Initial Setup ---
    habitForm.addEventListener('submit', handleFormSubmit);
    habitList.addEventListener('click', handleListClick);
    searchInput.addEventListener('input', renderHabits);

    loadFromLocalStorage();
    renderHabits();
});