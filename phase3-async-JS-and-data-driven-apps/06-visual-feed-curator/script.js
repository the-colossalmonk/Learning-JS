document.addEventListener('DOMContentLoaded', () => {

    // --- DOM Elements ---
    const dashboard = document.getElementById('dashboard');
    const addFeedBtn = document.getElementById('add-feed-btn');
    const modal = document.getElementById('add-feed-modal');
    const modalForm = document.getElementById('add-feed-form');
    const modalCancelBtn = document.getElementById('modal-cancel-btn');
    const feedUrlInput = document.getElementById('feed-url');
    const modalError = document.getElementById('modal-error');
    const storyCardTemplate = document.getElementById('story-card-template');
    const themeToggle = document.getElementById('theme-toggle');
    
    // --- State & Config ---
    const CORS_PROXY = 'https://api.allorigins.win/raw?url=';
    let feeds = [];

    // --- Core Functions ---
    function loadState() {
        const savedFeeds = localStorage.getItem('rssFeeds');
        feeds = savedFeeds ? JSON.parse(savedFeeds) : [
            { url: 'https://www.theverge.com/rss/index.xml', title: 'The Verge', id: 'the-verge' },
            { url: 'https://www.wired.com/feed/rss', title: 'Wired', id: 'wired' }
        ];
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-mode');
            themeToggle.checked = true;
        }
    }
    
    function saveState() {
        localStorage.setItem('rssFeeds', JSON.stringify(feeds));
    }

    // UPDATED: Now includes retry logic
    async function fetchAndParseFeed(feedUrl, maxRetries = 3) {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const response = await fetch(`${CORS_PROXY}${encodeURIComponent(feedUrl)}`);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                
                const text = await response.text();
                const parser = new DOMParser();
                const doc = parser.parseFromString(text, "application/xml");
                
                const errorNode = doc.querySelector("parsererror");
                if (errorNode) throw new Error("Failed to parse RSS feed.");

                const feedTitle = doc.querySelector('channel > title')?.textContent || 'Untitled Feed';
                const items = Array.from(doc.querySelectorAll('item, entry')).map(item => {
                    const title = item.querySelector('title')?.textContent || '';
                    const link = item.querySelector('link')?.textContent || item.querySelector('link')?.getAttribute('href') || '';
                    const description = item.querySelector('description')?.textContent || item.querySelector('summary')?.textContent || '';
                    const pubDate = item.querySelector('pubDate')?.textContent || item.querySelector('published')?.textContent || new Date().toISOString();
                    const docParser = new DOMParser();
                    const descriptionDoc = docParser.parseFromString(description, 'text/html');
                    const firstImage = descriptionDoc.querySelector('img');
                    const imageUrl = firstImage ? firstImage.src : (item.querySelector('media\\:content, content')?.getAttribute('url') || null);
                    return { title, link, description, pubDate, imageUrl };
                }).slice(0, 15);

                return { feedTitle, items }; // Success!
            } catch (error) {
                console.error(`Attempt ${attempt} failed for ${feedUrl}:`, error);
                if (attempt === maxRetries) {
                    throw error; // All retries failed, re-throw the final error
                }
                // Wait before retrying
                await new Promise(res => setTimeout(res, attempt * 1000));
            }
        }
    }

    // --- Rendering ---
    function renderDashboard() {
        dashboard.innerHTML = '';
        feeds.forEach(feed => {
            const column = document.createElement('div');
            column.className = 'feed-column';
            column.dataset.feedUrl = feed.url;
            column.draggable = true;
            column.innerHTML = `
                <div class="column-header">
                    <h2 class="column-title">${feed.title}</h2>
                    <button class="remove-feed-btn">×</button>
                </div>
                <div class="column-stories">
                    <p class="status-message">Loading...</p>
                </div>
            `;
            dashboard.appendChild(column);
            loadStoriesForColumn(column, feed.url);
        });
    }

    async function loadStoriesForColumn(column, url) {
        const storiesContainer = column.querySelector('.column-stories');
        const statusMessage = storiesContainer.querySelector('.status-message');
        try {
            for (let attempt = 1; attempt <= 3; attempt++) {
                try {
                    statusMessage.textContent = attempt > 1 ? `Retrying... (${attempt})` : 'Loading...';
                    const { items } = await fetchAndParseFeed(url);
                    storiesContainer.innerHTML = '';
                    items.forEach(item => {
                        const card = storyCardTemplate.content.cloneNode(true).firstElementChild;
                        if (item.imageUrl) {
                            card.querySelector('.card-image').src = item.imageUrl;
                        } else {
                            card.querySelector('.card-image-container').style.display = 'none';
                        }
                        card.href = item.link;
                        card.querySelector('.card-title').textContent = item.title;
                        card.querySelector('.card-snippet').textContent = item.description.replace(/<[^>]+>/g, '').substring(0, 100) + '...';
                        card.querySelector('.card-date').textContent = new Date(item.pubDate).toLocaleDateString();
                        storiesContainer.appendChild(card);
                    });
                    return; // Exit on success
                } catch (error) {
                    if (attempt === 3) throw error;
                    await new Promise(res => setTimeout(res, attempt * 1500));
                }
            }
        } catch (error) {
            storiesContainer.innerHTML = `<p class="status-message" style="color: red;">Failed to load feed.</p>`;
        }
    }

    // --- Event Handlers ---
    addFeedBtn.addEventListener('click', () => modal.classList.remove('hidden'));
    modalCancelBtn.addEventListener('click', () => modal.classList.add('hidden'));
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.add('hidden'); });

    modalForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const url = feedUrlInput.value.trim();
        modalError.classList.add('hidden');
        if (feeds.some(feed => feed.url === url)) {
            modalError.textContent = 'This feed has already been added.';
            modalError.classList.remove('hidden');
            return;
        }
        try {
            const { feedTitle } = await fetchAndParseFeed(url);
            feeds.push({ url, title: feedTitle, id: `feed-${Date.now()}` });
            saveState();
            renderDashboard();
            modal.classList.add('hidden');
            feedUrlInput.value = '';
        } catch (error) {
            modalError.textContent = 'Could not fetch or parse this feed URL.';
            modalError.classList.remove('hidden');
        }
    });

    themeToggle.addEventListener('change', () => {
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
    });

    dashboard.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-feed-btn')) {
            const column = e.target.closest('.feed-column');
            const urlToRemove = column.dataset.feedUrl;
            feeds = feeds.filter(feed => feed.url !== urlToRemove);
            saveState();
            renderDashboard();
        }
    });

    // UPDATED: Drag and Drop for Grid Layout
    let draggedColumn = null;
    dashboard.addEventListener('dragstart', (e) => {
        draggedColumn = e.target.closest('.feed-column');
        if(draggedColumn) setTimeout(() => draggedColumn.classList.add('dragging'), 0);
    });
    dashboard.addEventListener('dragend', () => {
        if(draggedColumn) draggedColumn.classList.remove('dragging');
        draggedColumn = null;
        const newOrder = Array.from(dashboard.querySelectorAll('.feed-column')).map(col => col.dataset.feedUrl);
        feeds.sort((a,b) => newOrder.indexOf(a.url) - newOrder.indexOf(b.url));
        saveState();
    });
    dashboard.addEventListener('dragover', (e) => {
        e.preventDefault();
        const afterElement = getDragAfterElement(dashboard, e.clientX);
        const currentDragged = document.querySelector('.dragging');
        if (currentDragged) {
            if (afterElement == null) dashboard.appendChild(currentDragged);
            else dashboard.insertBefore(currentDragged, afterElement);
        }
    });

    function getDragAfterElement(container, x) {
        const draggableElements = [...container.querySelectorAll('.feed-column:not(.dragging)')];
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = x - box.left - box.width / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    // --- Initial Load ---
    loadState();
    renderDashboard();
});