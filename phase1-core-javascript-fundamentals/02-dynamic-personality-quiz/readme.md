# Phase 1, Project 2: Dynamic Personality Quiz

This is an interactive, single-page web application that allows users to discover their "Coding Archetype" by answering a series of five personality-based questions. The quiz is designed to be engaging, with a clean, modern interface and smooth transitions.

### Features

-   **Four Unique Archetypes:** Discover if you are an Architect, Alchemist, Sorcerer, or Storyteller.
-   **Dynamic Questioning:** Questions are loaded and displayed one by one from a central data source.
-   **Randomized Questions:** The order of questions is shuffled each time the quiz is taken to enhance replayability.
-   **Score Calculation:** The application tracks responses and calculates the most-selected archetype.
-   **Animated Progress Bar:** A visual indicator shows the user how far they are through the quiz.
-   **Polished UI/UX:** A minimalist, pastel-themed design with smooth, animated transitions between screens.
-   **Social Sharing:** A "Share" button on the results screen allows users to easily share their archetype on Twitter.

---

### Core JavaScript Concepts Covered

This project builds on fundamental concepts by introducing more complex data structures and application logic.

#### 1. Data Structuring (Separation of Concerns)

We structure our data logically. The quiz content (questions and answers) is stored separately from the result content (titles, descriptions). This makes the code easier to manage and update.

**Example: `quizData` and `resultsData` in `script.js`**

```javascript
// Data for the questions themselves
const quizData = [
    {
        question: "You're starting a new project...",
        answers: [
            { text: "Draft a detailed architecture...", value: 'Architect' },
            { text: "Spin up a quick prototype...", value: 'Alchemist' },
            // ... more answers
        ]
    }, // ... more questions
];

// Data for the possible outcomes
const resultsData = {
    Architect: {
        title: "The Architect",
        emoji: '🏛️',
        description: "You are the master planner..."
    },
    Alchemist: {
        title: "The Alchemist",
        emoji: '🧪',
        description: "You are a creative innovator..."
    } // ... more results
};
```

#### 2. Control Flow & State Management

The application's state (which question is active, what the user's scores are) is managed through variables. Functions transition the user between different "screens" (start, question, result) by changing CSS classes.

**Example: The main quiz loop (`script.js`)**

```javascript
const selectAnswer = (e) => {
    // 1. Record the score
    const selectedValue = e.target.dataset.value;
    scores[selectedValue]++;
    
    // 2. Advance the state
    currentQuestionIndex++;
    
    // 3. Use an if/else block to control the flow
    if (currentQuestionIndex < questions.length) {
        showQuestion(); // Go to the next question
    } else {
        calculateResult(); // End the quiz
    }
};
```

#### 3. Dynamic DOM Generation

Instead of having all question HTML pre-written, we generate answer buttons on-the-fly based on our `quizData` array. This makes the quiz scalable—to add more answers, you only need to update the data array.

**Example: Creating answer buttons (`script.js`)**

```javascript
// From the showQuestion function
currentQuestion.answers.forEach(answer => {
    const button = document.createElement('button');
    button.innerText = answer.text;
    button.classList.add('btn', 'answer-btn');
    button.dataset.value = answer.value; // Store the value in a data attribute
    button.addEventListener('click', selectAnswer);
    answerButtons.appendChild(button);
});
```

#### 4. Algorithms: Shuffling & Score Calculation

-   **Shuffling:** To make the quiz more interesting, we randomize the question order using a simple `sort` method with a random comparator.
-   **Score Calculation:** We use an object to store scores. After the quiz, we find the archetype with the highest score using `Object.keys()` and `Array.prototype.reduce()`, which is a powerful and concise way to find a maximum value in an object.

**Example: Calculating the final result (`script.js`)**

```javascript
const calculateResult = () => {
    // Find the key in the 'scores' object with the highest value
    finalResult = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
    showResult();
};
```

### How to Run

1.  Save the three files (`index.html`, `style.css`, `script.js`) in the same folder.
2.  Open the `index.html` file in your web browser.