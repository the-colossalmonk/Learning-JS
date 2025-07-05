document.addEventListener('DOMContentLoaded', () => {

    // --- DATA ---
    const fullDeck = [
        { front: 'Hello', back: 'Hola', status: 'new' },
        { front: 'Goodbye', back: 'Adiós', status: 'new' },
        { front: 'Please', back: 'Por favor', status: 'new' },
        { front: 'Thank you', back: 'Gracias', status: 'new' },
        { front: 'Yes', back: 'Sí', status: 'new' },
        { front: 'No', back: 'No', status: 'new' },
        { front: 'Friend', back: 'Amigo/Amiga', status: 'new' },
        { front: 'Water', back: 'Agua', status: 'new' },
        { front: 'Food', back: 'Comida', status: 'new' },
        { front: 'House', back: 'Casa', status: 'new' },
    ];

    // --- DOM Elements ---
    const card = document.getElementById('flashcard');
    const cardFrontText = document.getElementById('card-front-text');
    const cardBackText = document.getElementById('card-back-text');
    const progressIndicator = document.getElementById('progress-indicator');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const reviewModeToggle = document.getElementById('review-mode-toggle');
    const navigationControls = document.getElementById('navigation-controls');
    const assessmentControls = document.getElementById('assessment-controls');
    const reviewBtn = document.getElementById('review-btn');
    const knownBtn = document.getElementById('known-btn');

    // --- Application State ---
    let currentDeck = [];
    let currentCardIndex = 0;
    let isReviewMode = false;

    // --- Functions ---
    
    /**
     * Filters the deck based on the current mode (full or review).
     */
    function filterDeck() {
        if (isReviewMode) {
            currentDeck = fullDeck.filter(card => card.status === 'review');
        } else {
            currentDeck = [...fullDeck];
        }
        // If the review deck is empty, switch back to normal mode
        if (currentDeck.length === 0 && isReviewMode) {
            alert("No cards to review! Switching back to normal mode.");
            reviewModeToggle.checked = false;
            isReviewMode = false;
            currentDeck = [...fullDeck];
        }
        currentCardIndex = 0;
    }

    /**
     * Displays the current card and updates the UI.
     */
    function displayCard() {
        if (currentDeck.length === 0) {
            cardFrontText.textContent = "Deck is empty!";
            cardBackText.textContent = "Add more cards.";
            progressIndicator.textContent = "0 / 0";
            return;
        }

        const cardData = currentDeck[currentCardIndex];
        cardFrontText.textContent = cardData.front;
        cardBackText.textContent = cardData.back;
        progressIndicator.textContent = `${currentCardIndex + 1} / ${currentDeck.length}`;

        // Reset card state
        card.classList.remove('is-flipped');
        navigationControls.classList.remove('hidden');
        assessmentControls.classList.add('hidden');
    }

    /**
     * Flips the current flashcard.
     */
    function flipCard() {
        if (currentDeck.length === 0) return;
        card.classList.toggle('is-flipped');
        
        if(card.classList.contains('is-flipped')) {
            navigationControls.classList.add('hidden');
            assessmentControls.classList.remove('hidden');
        } else {
            navigationControls.classList.remove('hidden');
            assessmentControls.classList.add('hidden');
        }
    }

    /**
     * Navigates to the next card in the deck.
     */
    function nextCard() {
        if (currentDeck.length === 0) return;
        currentCardIndex = (currentCardIndex + 1) % currentDeck.length;
        displayCard();
    }

    /**
     * Navigates to the previous card in the deck.
     */
    function prevCard() {
        if (currentDeck.length === 0) return;
        currentCardIndex = (currentCardIndex - 1 + currentDeck.length) % currentDeck.length;
        displayCard();
    }
    
    /**
     * Marks the current card with a status ('known' or 'review') and moves to the next card.
     * @param {string} status - The status to set for the card.
     */
    function assessCard(status) {
        const originalIndex = fullDeck.findIndex(c => c.front === currentDeck[currentCardIndex].front);
        if (originalIndex !== -1) {
            fullDeck[originalIndex].status = status;
        }
        nextCard();
    }
    
    /**
     * Handles keyboard events for navigation and flipping.
     */
    function handleKeyDown(e) {
        if (e.code === 'ArrowRight') nextCard();
        else if (e.code === 'ArrowLeft') prevCard();
        else if (e.code === 'Space') {
            e.preventDefault(); // Prevent page scroll
            flipCard();
        }
    }

    // --- Event Listeners ---
    card.addEventListener('click', flipCard);
    nextBtn.addEventListener('click', nextCard);
    prevBtn.addEventListener('click', prevCard);
    
    knownBtn.addEventListener('click', () => assessCard('known'));
    reviewBtn.addEventListener('click', () => assessCard('review'));
    
    reviewModeToggle.addEventListener('change', (e) => {
        isReviewMode = e.target.checked;
        filterDeck();
        displayCard();
    });

    document.addEventListener('keydown', handleKeyDown);

    // --- Initial Load ---
    filterDeck();
    displayCard();
});