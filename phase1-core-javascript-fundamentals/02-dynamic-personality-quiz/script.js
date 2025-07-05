document.addEventListener('DOMContentLoaded', () => {
    // --- DATA ---
    const quizData = [
        {
            question: "You're starting a new project. What's your first move?",
            answers: [
                { text: "Draft a detailed architecture diagram and plan the data models.", value: 'Architect' },
                { text: "Spin up a quick prototype with a brand new framework I want to try.", value: 'Alchemist' },
                { text: "Research the core algorithm to ensure it's the most efficient possible.", value: 'Sorcerer' },
                { text: "Create wireframes and mockups to define the user journey.", value: 'Storyteller' }
            ]
        },
        {
            question: "You encounter a really difficult bug. How do you approach it?",
            answers: [
                { text: "Systematically trace the data flow to find the logical flaw.", value: 'Architect' },
                { text: "Try a few unconventional workarounds and see what sticks.", value: 'Alchemist' },
                { text: "Dive into the library's source code to understand the root cause.", value: 'Sorcerer' },
                { text: "Ask a colleague for a fresh perspective or 'rubber duck' the problem.", value: 'Storyteller' }
            ]
        },
        {
            question: "How do you prefer to learn a new technology?",
            answers: [
                { text: "By reading the official documentation and understanding its design principles.", value: 'Architect' },
                { text: "Jumping straight into code and building a small, fun project.", value: 'Alchemist' },
                { text: "By finding a complex problem and using the new tech to solve it.", value: 'Sorcerer' },
                { text: "Watching video tutorials and seeing how it improves the user-facing product.", value: 'Storyteller' }
            ]
        },
        {
            question: "When reviewing code, what do you pay the most attention to?",
            answers: [
                { text: "The overall structure, scalability, and adherence to design patterns.", value: 'Architect' },
                { text: "Clever or innovative use of language features or libraries.", value: 'Alchemist' },
                { text: "Performance bottlenecks and algorithmic efficiency.", value: 'Sorcerer' },
                { text: "Readability, comments, and how easy it is for a new developer to understand.", value: 'Storyteller' }
            ]
        },
        {
            question: "What's the most satisfying part of a project for you?",
            answers: [
                { text: "Seeing a well-architected system run flawlessly under load.", value: 'Architect' },
                { text: "The 'aha!' moment when a crazy experiment actually works.", value: 'Alchemist' },
                { text: "Refactoring a slow function to be 10x faster.", value: 'Sorcerer' },
                { text: "Receiving positive feedback from users who love the interface.", value: 'Storyteller' }
            ]
        }
    ];

    const resultsData = {
        Architect: {
            title: "The Architect",
            emoji: '🏛️',
            description: "You are the master planner. You excel at seeing the big picture, designing robust systems, and ensuring projects are built on a solid, scalable foundation. Clean code and well-defined patterns are your signature."
        },
        Alchemist: {
            title: "The Alchemist",
            emoji: '🧪',
            description: "You are a creative innovator and a fearless experimenter. You love mixing new technologies, APIs, and libraries to create something entirely new. For you, the joy is in the discovery and the art of the possible."
        },
        Sorcerer: {
            title: "The Sorcerer",
            emoji: '🧙',
            description: "You are a deep diver into the arcane arts of code. You thrive on complexity, mastering algorithms, and optimizing performance. When a problem seems impossible, you're the one who can find a way by understanding the code at its most fundamental level."
        },
        Storyteller: {
            title: "The Storyteller",
            emoji: '🎨',
            description: "You are the voice of the user. You craft intuitive, beautiful, and engaging experiences. Your focus is on clear communication, elegant UIs, and ensuring that the technology serves a human purpose. You bridge the gap between code and user."
        }
    };

    // --- DOM Elements ---
    const startScreen = document.getElementById('start-screen');
    const questionScreen = document.getElementById('question-screen');
    const resultScreen = document.getElementById('result-screen');
    
    const startBtn = document.getElementById('start-btn');
    const restartBtn = document.getElementById('restart-btn');
    const shareBtn = document.getElementById('share-btn');

    const questionText = document.getElementById('question-text');
    const answerButtons = document.getElementById('answer-buttons');
    const progressBar = document.getElementById('progress-bar');

    const resultTitle = document.getElementById('result-title');
    const resultEmoji = document.getElementById('result-emoji');
    const resultDescription = document.getElementById('result-description');

    // --- State ---
    let currentQuestionIndex = 0;
    let scores = {};
    let questions = [];
    let finalResult = '';

    // --- Functions ---
    const startQuiz = () => {
        // Shuffle questions for replayability
        questions = [...quizData].sort(() => Math.random() - 0.5);
        currentQuestionIndex = 0;
        scores = { Architect: 0, Alchemist: 0, Sorcerer: 0, Storyteller: 0 };
        
        startScreen.classList.add('hidden');
        resultScreen.classList.add('hidden');
        questionScreen.classList.remove('hidden');
        
        showQuestion();
    };

    const showQuestion = () => {
        resetState();
        const currentQuestion = questions[currentQuestionIndex];
        questionText.innerText = currentQuestion.question;
        
        currentQuestion.answers.forEach(answer => {
            const button = document.createElement('button');
            button.innerText = answer.text;
            button.classList.add('btn', 'answer-btn');
            button.dataset.value = answer.value;
            button.addEventListener('click', selectAnswer);
            answerButtons.appendChild(button);
        });
        
        updateProgressBar();
    };
    
    const resetState = () => {
        while (answerButtons.firstChild) {
            answerButtons.removeChild(answerButtons.firstChild);
        }
    };
    
    const selectAnswer = (e) => {
        const selectedValue = e.target.dataset.value;
        scores[selectedValue]++;
        
        currentQuestionIndex++;
        
        if (currentQuestionIndex < questions.length) {
            showQuestion();
        } else {
            calculateResult();
        }
    };
    
    const calculateResult = () => {
        finalResult = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
        showResult();
    };

    const showResult = () => {
        questionScreen.classList.add('hidden');
        resultScreen.classList.remove('hidden');

        const result = resultsData[finalResult];
        resultTitle.innerText = result.title;
        resultEmoji.innerText = result.emoji;
        resultDescription.innerText = result.description;
    };
    
    const updateProgressBar = () => {
        const progress = ((currentQuestionIndex) / questions.length) * 100;
        progressBar.style.width = `${progress}%`;
    };

    const shareResult = () => {
        const result = resultsData[finalResult];
        const tweetText = `I took the Coding Archetype quiz and I'm a ${result.emoji} ${result.title}! Find out your type.`;
        // In a real project, you would replace the URL
        const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
        window.open(shareUrl, '_blank');
    };

    // --- Event Listeners ---
    startBtn.addEventListener('click', startQuiz);
    restartBtn.addEventListener('click', startQuiz);
    shareBtn.addEventListener('click', shareResult);
});