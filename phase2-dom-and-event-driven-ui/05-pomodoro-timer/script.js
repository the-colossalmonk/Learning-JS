document.addEventListener('DOMContentLoaded', () => {

    // --- DOM Elements ---
    const timerDisplay = document.getElementById('timer-display');
    const sessionTitle = document.getElementById('session-title');
    const startPauseBtn = document.getElementById('start-pause-btn');
    const resetBtn = document.getElementById('reset-btn');
    const skipBtn = document.getElementById('skip-btn');
    const sessionProgress = document.getElementById('session-progress');
    // To-Do
    const todoForm = document.getElementById('todo-form');
    const todoInput = document.getElementById('todo-input');
    const todoList = document.getElementById('todo-list');
    // Settings
    const settingsBtn = document.getElementById('settings-btn');
    const settingsModal = document.getElementById('settings-modal');
    const workDurationInput = document.getElementById('work-duration');
    const breakDurationInput = document.getElementById('break-duration');
    const longBreakDurationInput = document.getElementById('long-break-duration');
    const saveSettingsBtn = document.getElementById('save-settings-btn');
    // Sounds
    const soundsBtn = document.getElementById('sounds-btn');
    const soundsModal = document.getElementById('sounds-modal');
    const soundsGrid = document.querySelector('.sounds-grid');
    const chimeSound = document.getElementById('chime-sound');
    const allAmbientSounds = document.querySelectorAll('audio[loop]');

    // --- State ---
    let settings = { work: 25, break: 5, longBreak: 15 };
    let todos = [];
    let timerInterval = null;
    let isRunning = false;
    let secondsLeft = settings.work * 60;
    let sessionType = 'work'; // 'work', 'break', 'longBreak'
    let sessionCount = 0;
    let currentSound = null;

    // --- Timer Logic ---
    function updateTimerDisplay() {
        const minutes = Math.floor(secondsLeft / 60);
        const seconds = secondsLeft % 60;
        timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        document.title = `${timerDisplay.textContent} - ${sessionTitle.textContent}`;
    }

    function startTimer() {
        isRunning = true;
        startPauseBtn.textContent = 'Pause';
        if (currentSound && sessionType === 'work') currentSound.play();
        timerInterval = setInterval(() => {
            secondsLeft--;
            updateTimerDisplay();
            if (secondsLeft <= 0) {
                switchSession();
            }
        }, 1000);
    }
    
    function pauseTimer() {
        isRunning = false;
        startPauseBtn.textContent = 'Start';
        clearInterval(timerInterval);
        if (currentSound) currentSound.pause();
    }

    function resetCurrentSession() {
        pauseTimer();
        secondsLeft = settings[sessionType] * 60;
        updateTimerDisplay();
    }
    
    function switchSession() {
        chimeSound.play();
        pauseTimer();

        if (sessionType === 'work') {
            sessionCount++;
            sessionType = (sessionCount % 4 === 0) ? 'long-break' : 'break';
            sendNotification("Work session over! Time for a break.");
        } else {
            sessionType = 'work';
            sendNotification("Break's over! Time to focus.");
        }
        
        updateSessionUI();
        secondsLeft = settings[sessionType] * 60;
        updateTimerDisplay();
        startPauseBtn.textContent = 'Start';
    }

    function updateSessionUI() {
        document.body.className = `state-${sessionType}`;
        if (sessionType === 'work') sessionTitle.textContent = 'Work';
        if (sessionType === 'break') sessionTitle.textContent = 'Break';
        if (sessionType === 'long-break') sessionTitle.textContent = 'Long Break';
        
        sessionProgress.innerHTML = '';
        let completedInCycle = sessionCount % 4;
        // if (sessionCount > 0 && completedInCycle === 0) {
        //     completedInCycle = 4;
        // }
        for (let i = 0; i < 4; i++) {
            const icon = document.createElement('span');
            icon.className = 'session-icon';
            icon.textContent = i < completedInCycle ? '🍅' : '⚪';
            sessionProgress.appendChild(icon);
        }

        if (currentSound && sessionType !== 'work') {
            currentSound.pause();
        } else if (currentSound && isRunning) {
            currentSound.play();
        }
    }
    
    // --- To-Do List Logic ---
    function renderTodos() {
        todoList.innerHTML = '';
        todos.forEach((todo, index) => {
            const li = document.createElement('li');
            li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
            li.dataset.index = index;
            li.innerHTML = `
                <input type="checkbox" class="todo-checkbox" id="todo-${index}" ${todo.completed ? 'checked' : ''}>
                <span class="todo-text">${todo.text}</span>
                <div class="todo-actions">
                    <button class="todo-action-btn edit-btn" title="Edit task">✏️</button>
                    <button class="todo-action-btn delete-btn" title="Delete task">🗑️</button>
                </div>
            `;
            todoList.appendChild(li);
        });
        saveState();
    }

    todoForm.addEventListener('submit', e => {
        e.preventDefault();
        const text = todoInput.value.trim();
        if (text) {
            todos.push({ text, completed: false });
            todoInput.value = '';
            renderTodos();
        }
    });

    todoList.addEventListener('click', e => {
        const target = e.target;
        const todoItem = target.closest('.todo-item');
        if (!todoItem) return;
        const index = parseInt(todoItem.dataset.index);

        if (target.classList.contains('todo-checkbox')) {
            todos[index].completed = target.checked;
            todoItem.classList.toggle('completed');
            saveState();
        } else if (target.classList.contains('delete-btn')) {
            todos.splice(index, 1);
            renderTodos();
        } else if (target.classList.contains('edit-btn')) {
            const textSpan = todoItem.querySelector('.todo-text');
            const currentText = textSpan.textContent;
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'edit-input';
            input.value = currentText;
            textSpan.replaceWith(input);
            input.focus();

            const saveEdit = () => {
                const newText = input.value.trim();
                if (newText) todos[index].text = newText;
                renderTodos();
            };
            
            input.addEventListener('blur', saveEdit);
            input.addEventListener('keydown', e => {
                if (e.key === 'Enter') saveEdit();
                else if (e.key === 'Escape') renderTodos();
            });
        }
    });

    // --- Settings & Sounds Logic ---
    function openModal(modal) { modal.classList.remove('hidden'); }
    function closeModal(modal) { modal.classList.add('hidden'); }

    settingsBtn.addEventListener('click', () => openModal(settingsModal));
    soundsBtn.addEventListener('click', () => openModal(soundsModal));

    document.querySelectorAll('.modal-close-btn').forEach(btn => {
        btn.addEventListener('click', () => closeModal(btn.closest('.modal-overlay')));
    });

    saveSettingsBtn.addEventListener('click', () => {
        settings.work = workDurationInput.value;
        settings.break = breakDurationInput.value;
        settings.longBreak = longBreakDurationInput.value;
        closeModal(settingsModal);
        if (!isRunning) resetCurrentSession();
        saveState();
    });

    soundsGrid.addEventListener('click', e => {
        const soundBtn = e.target.closest('.sound-btn');
        if (soundBtn) {
            const sound = soundBtn.dataset.sound;
            document.querySelectorAll('.sound-btn.active').forEach(b => b.classList.remove('active'));
            soundBtn.classList.add('active');
            
            allAmbientSounds.forEach(audio => audio.pause());
            if (sound !== 'none') {
                currentSound = document.getElementById(`${sound}-sound`);
                if (isRunning && sessionType === 'work') {
                    currentSound.play();
                }
            } else {
                currentSound = null;
            }
        }
    });

    // --- Notifications & State Persistence ---
    function sendNotification(message) {
        if (Notification.permission === 'granted') {
            new Notification('FocusFlow', { body: message });
        }
    }

    function saveState() {
        localStorage.setItem('focusFlowSettings', JSON.stringify(settings));
        localStorage.setItem('focusFlowTodos', JSON.stringify(todos));
    }

    function loadState() {
        const savedSettings = localStorage.getItem('focusFlowSettings');
        if (savedSettings) settings = JSON.parse(savedSettings);
        const savedTodos = localStorage.getItem('focusFlowTodos');
        if (savedTodos) todos = JSON.parse(savedTodos);
        
        workDurationInput.value = settings.work;
        breakDurationInput.value = settings.break;
        longBreakDurationInput.value = settings.longBreak;
        
        secondsLeft = settings.work * 60;
    }

    // --- Keyboard Shortcuts ---
    window.addEventListener('keydown', e => {
        if (document.activeElement.tagName === 'INPUT' && document.activeElement.type === 'text') return;
        if (e.code === 'Space') {
            e.preventDefault();
            startPauseBtn.click();
        }
        if (e.key.toLowerCase() === 'r') resetCurrentSession();
        if (e.key.toLowerCase() === 's') switchSession();
    });

    // --- Initial Load ---
    function init() {
        loadState();
        renderTodos();
        updateTimerDisplay();
        updateSessionUI();
        if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
            setTimeout(() => {
                Notification.requestPermission();
            }, 5000);
        }
    }
    
    startPauseBtn.addEventListener('click', () => isRunning ? pauseTimer() : startTimer());
    resetBtn.addEventListener('click', resetCurrentSession);
    skipBtn.addEventListener('click', switchSession);
    init();
});