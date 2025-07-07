document.addEventListener('DOMContentLoaded', () => {

    // --- DATA ---
    const storyData = {
        'fantasy': {
            settings: ['in a forgotten elven city', 'atop a dragon\'s peak', 'within a cursed forest', 'in a bustling dwarven mine'],
            plots: ['discovered a legendary artifact', 'was betrayed by their closest ally', 'had to unite warring kingdoms', 'sought revenge against a powerful sorcerer']
        },
        'sci-fi': {
            settings: ['on a derelict space station', 'in a neon-drenched cyberpunk metropolis', 'on a newly colonized alien planet', 'inside a rogue AI\'s virtual reality'],
            plots: ['had to smuggle sentient data', 'discovered a corporate conspiracy', 'were the last survivor of a terraforming project', 'awoke from cryo-sleep with amnesia']
        },
        'mystery': {
            settings: ['at a secluded victorian manor', 'in a rain-soaked city alley', 'on a luxurious transcontinental train', 'at a high-stakes poker game'],
            plots: ['was framed for a crime they didn\'t commit', 'had to solve their own murder', 'uncovered a secret society', 'found a cryptic note at a crime scene']
        }
    };
    
    // --- DOM Elements ---
    const generateBtn = document.getElementById('generate-btn');
    const genreSelect = document.getElementById('genre-select');
    const savedStoriesList = document.getElementById('saved-stories-list');
    const savedStoryTemplate = document.getElementById('saved-story-template');
    const initialState = document.getElementById('initial-state');
    const loadingState = document.getElementById('loading-state');
    const storyDisplay = document.getElementById('story-display');
    const characterAvatar = document.getElementById('character-avatar');
    const characterName = document.getElementById('character-name');
    const storyTextEl = document.getElementById('story-text');
    const saveBtn = document.getElementById('save-btn');
    
    // --- STATE ---
    let savedStories = [];
    let currentStory = null;

    // --- ASYNC HELPER FUNCTIONS ---
    const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
    
    async function fetchCharacter() {
        const response = await fetch('https://randomuser.me/api/?inc=name,picture');
        if (!response.ok) throw new Error('Failed to fetch character data.');
        const data = await response.json();
        const user = data.results[0];
        return {
            name: `${user.name.first} ${user.name.last}`,
            avatar: user.picture.large
        };
    }
    
    async function fetchSetting(genre) {
        await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 200));
        return getRandomItem(storyData[genre].settings);
    }
    
    async function fetchPlot(genre) {
        await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 200));
        return getRandomItem(storyData[genre].plots);
    }

    // --- CORE LOGIC ---
    async function generateStory() {
        switchState('loading');
        
        try {
            const selectedGenre = genreSelect.value;
            const [character, setting, plot] = await Promise.all([
                fetchCharacter(),
                fetchSetting(selectedGenre),
                fetchPlot(selectedGenre)
            ]);
            
            // NEW: Dynamic story templates
            const storyTemplates = [
                `The legend of ${character.name} began ${setting}, the day they ${plot}.`,
                `Few people knew that ${setting} was where ${character.name} ${plot}.`,
                `It was a day like any other, until ${character.name}, while ${setting}, suddenly ${plot}.`,
                `Everyone talks about the time ${character.name} ${plot}, but they always forget it happened ${setting}.`
            ];

            const storyText = getRandomItem(storyTemplates);

            currentStory = {
                character,
                setting,
                plot,
                text: storyText,
                id: Date.now()
            };
            
            displayStory(currentStory);
            
        } catch(error) {
            console.error("Error generating story:", error);
            switchState('initial');
            alert('Failed to generate story. The spirits may be angry. Please try again.');
        }
    }
    
    // --- UI & Rendering ---
    function switchState(state) {
        initialState.classList.add('hidden');
        loadingState.classList.add('hidden');
        storyDisplay.classList.add('hidden');
        
        if(state === 'initial') initialState.classList.remove('hidden');
        if(state === 'loading') loadingState.classList.remove('hidden');
        if(state === 'display') storyDisplay.classList.remove('hidden');
    }

    function displayStory(story) {
        characterName.textContent = story.character.name;
        characterAvatar.src = story.character.avatar;
        storyTextEl.textContent = '';
        storyTextEl.classList.remove('finished');
        typewriterEffect(story.text, storyTextEl);
        switchState('display');
    }
    
    function typewriterEffect(text, element) {
        let i = 0;
        function type() {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(type, 30);
            } else {
                element.classList.add('finished');
            }
        }
        type();
    }
    
    function renderSavedStories() {
        savedStoriesList.innerHTML = '';
        savedStories.forEach(story => {
            const item = savedStoryTemplate.content.cloneNode(true).firstElementChild;
            item.querySelector('.saved-story-title').textContent = `${story.character.name}'s Tale`;
            item.querySelector('.view-btn').dataset.id = story.id;
            item.querySelector('.delete-btn').dataset.id = story.id;
            savedStoriesList.appendChild(item);
        });
    }

    // --- Event Handlers ---
    generateBtn.addEventListener('click', generateStory);
    
    saveBtn.addEventListener('click', () => {
        if (currentStory && !savedStories.some(s => s.id === currentStory.id)) {
            savedStories.push(currentStory);
            saveState();
            renderSavedStories();
            alert('Story saved!');
        } else if (currentStory) {
            alert('This story is already saved.');
        }
    });

    savedStoriesList.addEventListener('click', (e) => {
        const id = parseInt(e.target.dataset.id);
        if (e.target.classList.contains('view-btn')) {
            const story = savedStories.find(s => s.id === id);
            if(story) {
                currentStory = story;
                displayStory(story);
            }
        }
        if (e.target.classList.contains('delete-btn')) {
            if (confirm('Are you sure you want to delete this story?')) {
                savedStories = savedStories.filter(s => s.id !== id);
                saveState();
                renderSavedStories();
            }
        }
    });

    // --- Local Storage ---
    function loadState() {
        const storedStories = localStorage.getItem('asyncStories');
        if(storedStories) {
            savedStories = JSON.parse(storedStories);
        }
    }
    
    function saveState() {
        localStorage.setItem('asyncStories', JSON.stringify(savedStories));
    }

    // --- INITIALIZATION ---
    loadState();
    renderSavedStories();
    switchState('initial');
});