document.addEventListener('DOMContentLoaded', () => {

    // --- DOM Elements ---
    const habitTracker = document.getElementById('habit-tracker');
    const currentMonthDisplay = document.getElementById('current-month-display');
    const prevMonthBtn = document.getElementById('prev-month-btn');
    const nextMonthBtn = document.getElementById('next-month-btn');
    const addHabitForm = document.getElementById('add-habit-form');
    const habitNameInput = document.getElementById('habit-name-input');
    const habitColorInput = document.getElementById('habit-color-input');

    // --- Application State ---
    let habits = [];
    let currentDate = new Date();

    // --- Functions ---

    /**
     * Loads habits from localStorage.
     */
    function loadHabits() {
        const storedHabits = localStorage.getItem('habits');
        habits = storedHabits ? JSON.parse(storedHabits) : [];
    }

    /**
     * Saves habits to localStorage.
     */
    function saveHabits() {
        localStorage.setItem('habits', JSON.stringify(habits));
    }
    
    /**
     * Calculates the current streak for a given habit.
     * @param {string[]} datesCompleted - An array of dates in 'YYYY-MM-DD' format.
     */
    function calculateStreak(datesCompleted) {
        if (!Array.isArray(datesCompleted) || datesCompleted.length === 0) return 0;
        
        let streak = 0;
        const sortedDates = datesCompleted.map(d => new Date(d)).sort((a, b) => b - a);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize to start of day
        
        let currentDateToCheck = new Date(today);

        // Check if today or yesterday is the last completed date
        const lastCompletedDate = new Date(sortedDates[0]);
        lastCompletedDate.setHours(0, 0, 0, 0);
        
        const diffDays = (today - lastCompletedDate) / (1000 * 60 * 60 * 24);
        
        if (diffDays > 1) {
            return 0; // Streak is broken if last completion was before yesterday
        }
        
        // If last completion was yesterday, start checking from yesterday
        if (diffDays === 1) {
             currentDateToCheck.setDate(today.getDate() - 1);
        }

        for (let i = 0; i < sortedDates.length; i++) {
            const date = sortedDates[i];
            date.setHours(0,0,0,0);

            if (date.getTime() === currentDateToCheck.getTime()) {
                streak++;
                currentDateToCheck.setDate(currentDateToCheck.getDate() - 1);
            } else if (date < currentDateToCheck) {
                // Gap in dates, streak ends
                break;
            }
        }
        return streak;
    }
    
    /**
     * Renders the entire habit tracker grid.
     */
    function render() {
        habitTracker.innerHTML = '';
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        currentMonthDisplay.textContent = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(currentDate);

        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        // --- Render Headers ---
        habitTracker.innerHTML += `<div class="grid-header habit-name-header">Habit</div>`;
        habitTracker.innerHTML += `<div class="grid-header streak-header">Streak</div>`;
        for (let day = 1; day <= daysInMonth; day++) {
            habitTracker.innerHTML += `<div class="grid-header">${day}</div>`;
        }
        
        // --- Render Habit Rows ---
        habits.forEach(habit => {
            // Habit Name
            const habitHeader = document.createElement('div');
            habitHeader.className = 'grid-cell habit-row-header';
            habitHeader.innerHTML = `
                <span>${habit.name}</span>
                <button class="delete-habit-btn" data-habit-id="${habit.id}">🗑️</button>
            `;
            habitTracker.appendChild(habitHeader);

            // Streak
            const streak = calculateStreak(habit.datesCompleted);
            const streakCell = document.createElement('div');
            streakCell.className = 'grid-cell streak-cell';
            streakCell.innerHTML = `${streak} <span class="fire-icon">🔥</span>`;
            habitTracker.appendChild(streakCell);

            // Completion Cells
            for (let day = 1; day <= daysInMonth; day++) {
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const isCompleted = Array.isArray(habit.datesCompleted) && habit.datesCompleted.includes(dateStr);
                const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
                
                const cell = document.createElement('div');
                cell.className = 'grid-cell completion-cell';
                if (isCompleted) cell.classList.add('completed');
                if (isToday) cell.classList.add('today');
                
                cell.dataset.habitId = habit.id;
                cell.dataset.date = dateStr;
                cell.style.setProperty('--habit-color', habit.color);
                
                habitTracker.appendChild(cell);
            }
        });

        // Update grid columns style
        habitTracker.style.gridTemplateColumns = `200px 70px repeat(${daysInMonth}, 1fr)`;
    }

    // --- Event Handlers ---

    function handleAddHabit(e) {
        e.preventDefault();
        const habitName = habitNameInput.value.trim();
        if (habitName) {
            habits.push({
                id: Date.now(),
                name: habitName,
                color: habitColorInput.value,
                datesCompleted: []
            });
            habitNameInput.value = '';
            saveHabits();
            render();
        }
    }

    function handleGridClick(e) {
        const target = e.target;
        
        // Toggle completion
        if (target.classList.contains('completion-cell')) {
            const habitId = parseInt(target.dataset.habitId);
            const date = target.dataset.date;
            const habit = habits.find(h => h.id === habitId);

            if (habit) {
                const dateIndex = habit.datesCompleted.indexOf(date);
                if (dateIndex > -1) {
                    habit.datesCompleted.splice(dateIndex, 1); // Un-complete
                } else {
                    habit.datesCompleted.push(date); // Complete
                }
                saveHabits();
                render();
            }
        }
        
        // Delete habit
        if (target.classList.contains('delete-habit-btn')) {
            const habitId = parseInt(target.dataset.habitId);
            if(confirm('Are you sure you want to delete this habit?')) {
                habits = habits.filter(h => h.id !== habitId);
                saveHabits();
                render();
            }
        }
    }

    // --- Event Listeners ---
    prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        render();
    });
    nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        render();
    });
    addHabitForm.addEventListener('submit', handleAddHabit);
    habitTracker.addEventListener('click', handleGridClick);

    // --- Initial Load ---
    loadHabits();
    render();
});