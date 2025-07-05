# Phase 2, Project 5: FocusFlow - Pomodoro Productivity Timer

FocusFlow is a minimalist and elegant productivity timer based on the Pomodoro Technique. This tool helps you focus by cycling through dedicated work and break sessions, featuring customizable timers, a session-integrated to-do list, ambient sounds, and desktop notifications to keep you on track.

### Key Features

-   **Full Pomodoro Cycle:** Automatically cycles through "Work" (25 min), "Break" (5 min), and "Long Break" (15 min) sessions.
-   **Dynamic Animated Backgrounds:** The entire UI background changes with a smooth gradient transition to visually represent the current session type (Work, Break, or Long Break).
-   **Customizable Timers:** A settings modal allows users to configure the duration of each session type to fit their workflow. Preferences are saved to `localStorage`.
-   **Integrated To-Do List:** A simple but effective task manager allows users to add and check off tasks for the day. Tasks are also saved to `localStorage`.
-   **Ambient Sounds & Chimes:** Users can select from a variety of ambient background sounds (Rain, Cafe, etc.) that play during work sessions. A chime signals the end of each session.
-   **Desktop Notifications:** Utilizes the Notification API to alert the user when a session ends, even if the browser window is not in focus.
-   **Visual Progress Tracker:** A series of icons visually represents the number of completed Pomodoro sessions in the current cycle.
-   **Keyboard Shortcuts:** Core actions like Start/Pause (`Space`), Reset (`R`), and Skip (`S`) are available via keyboard shortcuts for power users.

---

### Core JavaScript Concepts Covered

This project is a comprehensive application that demonstrates proficiency in state management, asynchronous operations, and interaction with various browser APIs.

#### 1. Advanced State Management

The application juggles a complex state, including the timer's status (`isRunning`), the current session type (`work`, `break`, `longBreak`), session counts, user settings, and a list of to-do items. All UI updates are driven by changes to this central state, which is a key principle of modern web applications.

#### 2. Precise Timer Logic with `setInterval`

An accurate countdown timer is achieved by using `setInterval` to tick down every second. The logic correctly handles starting, pausing, resetting, and automatically switching between different session types when the timer reaches zero.

**Example: The main timer loop (`script.js`)**
```javascript
function startTimer() {
    isRunning = true;
    startPauseBtn.textContent = 'Pause';
    timerInterval = setInterval(() => {
        secondsLeft--;
        updateTimerDisplay();
        if (secondsLeft <= 0) {
            switchSession(); // Automatically move to the next session
        }
    }, 1000);
}
```

#### 3. Interacting with Browser APIs
This project goes beyond simple DOM manipulation and interacts with several powerful browser APIs:
- `localStorage`: Used to persist user settings and their to-do list across browser sessions.
- **Notification API**: To send native desktop notifications. The application correctly requests permission before attempting to send a notification.
- `Audio` **API**: To play sound effects and looping ambient tracks, including managing play/pause state based on the current session.
**Example: Sending a desktop notification (`script.js`)**
```javascript
function sendNotification(message) {
    // First, check if permission has been granted
    if (Notification.permission === 'granted') {
        new Notification('FocusFlow', { 
            body: message
        });
    }
}

// On page load, request permission if it hasn't been granted or denied
if(Notification.permission !== 'granted' && Notification.permission !== 'denied') {
    Notification.requestPermission();
}
```

#### 4. Data-Driven Dynamic UI
The entire application is rendered based on the state held in JavaScript. The to-do list, the session progress icons, and the timer itself are all dynamically generated and updated, ensuring the view is always a reflection of the data.

### How to Run
1. Save the three files (`index.html`, `style.css`, `script.js`) in the same folder.
2. Open `index.html` in your web browser.
3. For the best experience, allow the browser to show notifications and play audio when prompted.