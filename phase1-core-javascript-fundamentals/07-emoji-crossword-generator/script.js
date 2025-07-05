document.addEventListener('DOMContentLoaded', () => {

    // --- DATA ---
    const wordList = [
        { clue: '🍎', answer: 'APPLE' }, { clue: '🍌', answer: 'BANANA' }, { clue: '🍇', answer: 'GRAPES' }, { clue: '🍓', answer: 'STRAWBERRY' }, { clue: '🥝', answer: 'KIWI' }, { clue: '🍍', answer: 'PINEAPPLE' }, { clue: '🥭', answer: 'MANGO' }, { clue: '🍑', answer: 'PEACH' }, { clue: '🍒', answer: 'CHERRY' }, { clue: '🍋', answer: 'LEMON' }, { clue: '🍊', answer: 'ORANGE' }, { clue: '🍉', answer: 'WATERMELON' }, { clue: '🥥', answer: 'COCONUT' }, { clue: '🥑', answer: 'AVOCADO' }, { clue: '🚗', answer: 'CAR' }, { clue: '✈️', answer: 'PLANE' }, { clue: '🚀', answer: 'ROCKET' }, { clue: '🚲', answer: 'BICYCLE' }, { clue: '⛵️', answer: 'BOAT' }, { clue: '🚁', answer: 'HELICOPTER' }, { clue: '☀️', answer: 'SUN' }, { clue: '🌙', answer: 'MOON' }, { clue: '⭐️', answer: 'STAR' }, { clue: '🪐', answer: 'PLANET' }, { clue: '🌍', answer: 'EARTH' }, { clue: '🔥', answer: 'FIRE' }, { clue: '💧', answer: 'WATER' }, { clue: '❄️', answer: 'SNOW' }, { clue: '🌈', answer: 'RAINBOW' }, { clue: '💻', answer: 'COMPUTER' }, { clue: '📱', answer: 'PHONE' }, { clue: '💡', answer: 'LIGHT' },
    ];

    const difficultySettings = {
        easy: { gridSize: 10, maxWords: 6 },
        medium: { gridSize: 15, maxWords: 10 },
        hard: { gridSize: 20, maxWords: 15 },
    };

    // --- DOM Elements ---
    const gridContainer = document.getElementById('grid-container');
    const cluesAcrossList = document.querySelector('#clues-across ul');
    const cluesDownList = document.querySelector('#clues-down ul');
    const generateBtn = document.getElementById('generate-btn');
    const checkBtn = document.getElementById('check-btn');
    const revealBtn = document.getElementById('reveal-btn');
    const loadingOverlay = document.getElementById('loading-overlay');
    const difficultyButtons = document.querySelectorAll('.difficulty-btn');
    
    // --- Application State ---
    let currentDifficulty = 'easy';
    let placedWords = [];
    let grid = [];

    // --- Core Algorithm ---
    function generateCrossword() {
        loadingOverlay.classList.remove('hidden');
        // Use a timeout to allow the loading overlay to render before the heavy computation starts
        setTimeout(() => {
            const { gridSize, maxWords } = difficultySettings[currentDifficulty];
            grid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(null));
            placedWords = [];
            
            const words = [...wordList].sort((a, b) => b.answer.length - a.answer.length);
            let clueCounter = 1;

            // Place first word
            const firstWord = words.shift();
            const startCol = Math.floor((gridSize - firstWord.answer.length) / 2);
            placeWord(firstWord, 0, startCol, 'across', clueCounter++);

            // Try to place other words
            let attempts = 0;
            while (placedWords.length < maxWords && attempts < words.length * 20) {
                const wordToPlace = words[Math.floor(Math.random() * words.length)];
                let placed = false;
                
                for (const placedWord of placedWords) {
                    for (let i = 0; i < placedWord.answer.length; i++) {
                        for (let j = 0; j < wordToPlace.answer.length; j++) {
                            const intersectionChar = wordToPlace.answer[j];
                            if (placedWord.answer[i] === intersectionChar) {
                                let row, col;
                                let direction = placedWord.direction === 'across' ? 'down' : 'across';
                                
                                if (placedWord.direction === 'across') {
                                    row = placedWord.row - j;
                                    col = placedWord.col + i;
                                } else {
                                    row = placedWord.row + i;
                                    col = placedWord.col - j;
                                }

                                if (canPlaceWord(wordToPlace.answer, row, col, direction)) {
                                    placeWord(wordToPlace, row, col, direction, clueCounter++);
                                    placed = true;
                                    break;
                                }
                            }
                        }
                        if (placed) break;
                    }
                    if (placed) break;
                }
                attempts++;
            }

            renderGrid();
            renderClues();
            loadingOverlay.classList.add('hidden');
        }, 50);
    }

    function canPlaceWord(word, row, col, direction) {
        const len = word.length;
        const gridSize = grid.length;

        for (let i = 0; i < len; i++) {
            let r = row, c = col;
            if (direction === 'across') c += i; else r += i;

            if (r < 0 || r >= gridSize || c < 0 || c >= gridSize) return false;
            
            const intersectingCell = grid[r][c];
            if (intersectingCell && intersectingCell.char !== word[i]) return false;
            
            // Check neighbors to avoid parallel words
            if (direction === 'across') {
                if (grid[r][c-1] && i === 0) return false;
                if (grid[r][c+1] && i === len - 1) return false;
                if ((grid[r-1]?.[c] || grid[r+1]?.[c]) && (!intersectingCell || intersectingCell.char !== word[i])) return false;
            } else {
                 if (grid[r-1]?.[c] && i === 0) return false;
                 if (grid[r+1]?.[c] && i === len-1) return false;
                 if ((grid[r][c-1] || grid[r][c+1]) && (!intersectingCell || intersectingCell.char !== word[i])) return false;
            }
        }
        return true;
    }

    function placeWord(wordObj, row, col, direction, number) {
        for (let i = 0; i < wordObj.answer.length; i++) {
            let r = row, c = col;
            if (direction === 'across') c += i; else r += i;
            grid[r][c] = { char: wordObj.answer[i], clueNumber: (i === 0) ? number : null, wordNumber: number };
        }
        placedWords.push({ ...wordObj, row, col, direction, number });
    }

    // --- Rendering ---
    function renderGrid() {
        gridContainer.innerHTML = '';
        const gridSize = grid.length;
        gridContainer.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;

        for (let r = 0; r < gridSize; r++) {
            for (let c = 0; c < gridSize; c++) {
                const cellData = grid[r][c];
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                
                if (cellData) {
                    cell.dataset.row = r;
                    cell.dataset.col = c;
                    cell.dataset.wordNumber = cellData.wordNumber;

                    if (cellData.clueNumber) {
                        const numberSpan = document.createElement('span');
                        numberSpan.className = 'clue-number';
                        numberSpan.textContent = cellData.clueNumber;
                        cell.appendChild(numberSpan);
                    }
                    const input = document.createElement('input');
                    input.type = 'text';
                    input.maxLength = 1;
                    input.className = 'cell-input';
                    input.dataset.row = r;
                    input.dataset.col = c;
                    cell.appendChild(input);
                } else {
                    cell.classList.add('blank');
                }
                gridContainer.appendChild(cell);
            }
        }
    }

    function renderClues() {
        cluesAcrossList.innerHTML = '';
        cluesDownList.innerHTML = '';
        
        placedWords.sort((a,b) => a.number - b.number).forEach(word => {
            const li = document.createElement('li');
            li.className = 'clue-item';
            li.dataset.wordNumber = word.number;
            li.innerHTML = `<span>${word.number}.</span> <span class="clue-emoji">${word.clue}</span>`;
            
            if (word.direction === 'across') {
                cluesAcrossList.appendChild(li);
            } else {
                cluesDownList.appendChild(li);
            }
        });
    }

    // --- Interactivity ---
    function highlightWord(wordNumber) {
        document.querySelectorAll('.grid-cell.highlighted, .clue-item.highlighted').forEach(el => el.classList.remove('highlighted'));
        if (!wordNumber) return;
        document.querySelectorAll(`[data-word-number="${wordNumber}"]`).forEach(el => el.classList.add('highlighted'));
    }

    function handleGridInteraction(e) {
        const target = e.target;
        if (target.classList.contains('cell-input')) {
            const wordNumber = target.closest('.grid-cell').dataset.wordNumber;
            highlightWord(wordNumber);
        }
    }

    function handleClueClick(e) {
        const target = e.target.closest('.clue-item');
        if (target) {
            const wordNumber = target.dataset.wordNumber;
            highlightWord(wordNumber);
            const firstCell = document.querySelector(`.grid-cell[data-word-number="${wordNumber}"] .cell-input`);
            if (firstCell) firstCell.focus();
        }
    }

    function handleInputNavigation(e) {
        if (e.target.tagName !== 'INPUT' || e.target.value.length < 1) return;
        const row = parseInt(e.target.dataset.row);
        const col = parseInt(e.target.dataset.col);
        const wordNumber = e.target.closest('.grid-cell').dataset.wordNumber;
        const word = placedWords.find(w => w.number == wordNumber);

        if (word.direction === 'across') {
            const nextCell = document.querySelector(`input[data-row="${row}"][data-col="${col + 1}"]`);
            if (nextCell) nextCell.focus();
        } else {
            const nextCell = document.querySelector(`input[data-row="${row + 1}"][data-col="${col}"]`);
            if (nextCell) nextCell.focus();
        }
    }

    function checkPuzzle() {
        document.querySelectorAll('.cell-input').forEach(input => {
            const r = parseInt(input.dataset.row);
            const c = parseInt(input.dataset.col);
            if(input.value.toUpperCase() === grid[r][c].char) {
                input.classList.remove('incorrect');
                input.classList.add('correct');
            } else if (input.value !== '') {
                input.classList.remove('correct');
                input.classList.add('incorrect');
            }
        });
    }

    function revealPuzzle() {
        document.querySelectorAll('.cell-input').forEach(input => {
            const r = parseInt(input.dataset.row);
            const c = parseInt(input.dataset.col);
            input.value = grid[r][c].char;
            input.classList.remove('incorrect', 'correct');
        });
    }

    // --- Event Listeners ---
    generateBtn.addEventListener('click', generateCrossword);
    difficultyButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            difficultyButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentDifficulty = btn.dataset.difficulty;
            generateCrossword();
        });
    });
    gridContainer.addEventListener('focusin', handleGridInteraction);
    gridContainer.addEventListener('input', handleInputNavigation);
    cluesAcrossList.addEventListener('click', handleClueClick);
    cluesDownList.addEventListener('click', handleClueClick);
    checkBtn.addEventListener('click', checkPuzzle);
    revealBtn.addEventListener('click', revealPuzzle);

    // --- Initial Load ---
    generateCrossword();
});