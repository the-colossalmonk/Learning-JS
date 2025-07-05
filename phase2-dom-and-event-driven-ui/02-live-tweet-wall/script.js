document.addEventListener('DOMContentLoaded', () => {

    // --- MOCK DATA ---
    const mockTweets = [
        { user: 'JS Dev', handle: '@js_fan', avatar: 'https://i.pravatar.cc/50?u=js', text: 'Just learned about the new CSS :has() selector! It’s a game-changer for parent element styling. #CSS #WebDev' },
        { user: 'React Queen', handle: '@react_guru', avatar: 'https://i.pravatar.cc/50?u=react', text: 'Server components in Next.js 14 are incredibly powerful. The performance gains are real! #React #NextJS' },
        { user: 'Vue Vanguard', handle: '@vue_master', avatar: 'https://i.pravatar.cc/50?u=vue', text: 'Excited for the new features in Vue 3. The composition API has made my code so much cleaner. #VueJS' },
        { user: 'CodeNewbie', handle: '@coder_in_progress', avatar: 'https://i.pravatar.cc/50?u=newbie', text: 'Finally understood async/await in JavaScript. It feels like unlocking a superpower! #100DaysOfCode' },
        { user: 'CSS Wizard', handle: '@css_tricks', avatar: 'https://i.pravatar.cc/50?u=css', text: 'Container Queries are finally here! This is the most significant CSS update in years. So many new responsive possibilities. #CSS' },
        { user: 'Node.js Ninja', handle: '@node_expert', avatar: 'https://i.pravatar.cc/50?u=node', text: 'Building a new backend with Bun. The speed is just astonishing. #JavaScript #Backend' },
        { user: 'Svelte Enthusiast', handle: '@svelte_dev', avatar: 'https://i.pravatar.cc/50?u=svelte', text: 'Svelte 5 Runes are looking amazing. The reactivity model is so intuitive. Can’t wait to refactor my projects. #Svelte' },
        { user: 'TypeScript Titan', handle: '@ts_lover', avatar: 'https://i.pravatar.cc/50?u=ts', text: 'Generics in TypeScript are tricky but so worth it for creating reusable, type-safe components. #TypeScript' },
    ];

    // --- DOM Elements ---
    const tweetWall = document.getElementById('tweet-wall');
    const filterInput = document.getElementById('filter-input');
    const pausePlayBtn = document.getElementById('pause-play-btn');

    // --- Application State ---
    let tweetInterval;
    let isPaused = false;
    
    // --- Functions ---
    
    /**
     * Creates an HTML element for a single tweet.
     * @param {object} tweetData - The data for the tweet.
     * @returns {HTMLElement} The created tweet card element.
     */
    function createTweetElement(tweetData) {
        const tweetCard = document.createElement('div');
        tweetCard.className = 'tweet-card new-tweet';
        
        // Add a timeout to remove the animation class after it finishes
        setTimeout(() => tweetCard.classList.remove('new-tweet'), 600);
        
        tweetCard.innerHTML = `
            <div class="tweet-header">
                <img src="${tweetData.avatar}" alt="avatar" class="avatar">
                <div class="user-info">
                    <span class="user-name">${tweetData.user}</span>
                    <span class="user-handle">${tweetData.handle}</span>
                </div>
            </div>
            <p class="tweet-text">${tweetData.text}</p>
            <div class="tweet-footer">
                <div class="tweet-action like-btn">
                    <svg fill="currentColor" viewBox="0 0 24 24"><g><path d="M12 21.638h-.014C9.403 21.59 1.95 14.856 1.95 8.478c0-3.064 2.525-5.754 5.403-5.754 2.29 0 3.83 1.58 4.646 2.73.814-1.148 2.354-2.73 4.645-2.73 2.88 0 5.404 2.69 5.404 5.755 0 6.376-7.454 13.11-10.037 13.157H12z"></path></g></svg>
                    <span class="like-count">0</span>
                </div>
                <div class="tweet-action retweet-btn">
                    <svg fill="currentColor" viewBox="0 0 24 24"><g><path d="M23.77 15.67c-.292-.293-.767-.293-1.06 0l-2.22 2.22V7.65c0-2.068-1.683-3.75-3.75-3.75h-5.85c-.414 0-.75.336-.75.75s.336.75.75.75h5.85c1.24 0 2.25 1.01 2.25 2.25v10.24l-2.22-2.22c-.293-.293-.768-.293-1.06 0s-.294.768 0 1.06l3.5 3.5c.145.147.337.22.53.22s.383-.072.53-.22l3.5-3.5c.294-.292.294-.767 0-1.06zm-10.66 3.28H7.26c-1.24 0-2.25-1.01-2.25-2.25V6.46l2.22 2.22c.293.293.768.293 1.06 0s.294-.768 0-1.06l-3.5-3.5c-.145-.147-.337-.22-.53-.22s-.383.072-.53.22l-3.5 3.5c-.294.292-.294.767 0 1.06s.767.293 1.06 0l2.22-2.22V16.7c0 2.068 1.683 3.75 3.75 3.75h5.85c.414 0 .75-.336.75-.75s-.336-.75-.75-.75z"></path></g></svg>
                    <span class="retweet-count">0</span>
                </div>
            </div>
        `;
        return tweetCard;
    }

    /**
     * Adds a new random tweet to the wall.
     */
    function addNewTweet() {
        const randomTweetData = mockTweets[Math.floor(Math.random() * mockTweets.length)];
        const tweetElement = createTweetElement(randomTweetData);
        tweetWall.prepend(tweetElement);
    }
    
    /**
     * Starts the interval to add new tweets.
     */
    function startFeed() {
        if (!tweetInterval) {
            tweetInterval = setInterval(addNewTweet, 3000);
        }
    }
    
    /**
     * Stops the interval.
     */
    function stopFeed() {
        clearInterval(tweetInterval);
        tweetInterval = null;
    }

    // --- Event Handlers ---

    // Use event delegation for like/retweet buttons
    tweetWall.addEventListener('click', (e) => {
const actionButton = e.target.closest('.tweet-action');
        if (!actionButton) return;

        // Apply pulse animation on any action click
        actionButton.classList.add('pulse');
        actionButton.addEventListener('animationend', () => {
            actionButton.classList.remove('pulse');
        }, { once: true }); // Important: remove listener after it runs once

        const isLiked = actionButton.classList.contains('like-btn');
        const isRetweeted = actionButton.classList.contains('retweet-btn');

        if (isLiked && !actionButton.classList.contains('liked')) {
            actionButton.classList.add('liked');
            const countSpan = actionButton.querySelector('.like-count');
            countSpan.textContent = parseInt(countSpan.textContent) + 1;
        }

        if (isRetweeted && !actionButton.classList.contains('retweeted')) {
            actionButton.classList.add('retweeted');
            const countSpan = actionButton.querySelector('.retweet-count');
            countSpan.textContent = parseInt(countSpan.textContent) + 1;
        }
    });

    filterInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        document.querySelectorAll('.tweet-card').forEach(card => {
            const tweetText = card.querySelector('.tweet-text').textContent.toLowerCase();
            if (tweetText.includes(searchTerm)) {
                card.classList.remove('hidden');
            } else {
                card.classList.add('hidden');
            }
        });
    });

    pausePlayBtn.addEventListener('click', () => {
        isPaused = !isPaused;
        if (isPaused) {
            stopFeed();
            pausePlayBtn.textContent = 'Play';
        } else {
            startFeed();
            pausePlayBtn.textContent = 'Pause';
        }
    });

    // --- Initial Load ---
    // Pre-fill the wall with some tweets
    for (let i = 0; i < 9; i++) {
        addNewTweet();
    }
    startFeed();
});