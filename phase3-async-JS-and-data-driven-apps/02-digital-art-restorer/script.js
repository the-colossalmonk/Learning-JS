document.addEventListener('DOMContentLoaded', () => {

    // --- CONFIG & DATA ---
    const gallery = document.getElementById('gallery');
    const resetAllBtn = document.getElementById('reset-all-btn');
    const galleryItemTemplate = document.getElementById('gallery-item-template');
    
    const IMAGE_URLS = Array.from({ length: 12 }, (_, i) => `https://picsum.photos/id/${i + 20}/400/500`);
    const MAX_RETRIES = 3;
    const CONCURRENCY_LIMIT = 3;
    const FAILURE_CHANCE = 0.3;

    // --- STATE ---
    let imageStates = [];
    let loadManager;

    // --- CORE ASYNC LOGIC ---
    const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    
    function loadImage(url, signal) {
        return new Promise((resolve, reject) => {
            if (signal.aborted) return reject({ name: 'AbortError' });
            const img = new Image();
            const cleanup = () => { img.onload = null; img.onerror = null; };
            const abortHandler = () => { cleanup(); reject({ name: 'AbortError' }); };
            signal.addEventListener('abort', abortHandler, { once: true });
            img.onload = () => { cleanup(); signal.removeEventListener('abort', abortHandler); resolve(img); };
            img.onerror = () => { cleanup(); signal.removeEventListener('abort', abortHandler); reject(new Error(`Failed to load image.`)); };
            const delay = Math.random() * 3000 + 1000;
            setTimeout(() => {
                if (signal.aborted) return;
                if (Math.random() < FAILURE_CHANCE) img.onerror();
                else img.src = url;
            }, delay);
        });
    }
    
    async function loadImageWithRetry(imageState) {
        let delay = 1000;
        for (let i = 0; i <= MAX_RETRIES; i++) {
            if (imageState.abortController.signal.aborted) {
                resetSingleCard(imageState);
                return;
            }
            try {
                imageState.status = 'restoring';
                imageState.retryCount = i;
                updateItemStatus(imageState);
                const img = await loadImage(imageState.url, imageState.abortController.signal);
                imageState.status = 'success';
                imageState.imageElement = img;
                updateItemStatus(imageState);
                return;
            } catch (error) {
                if (error.name === 'AbortError') {
                    resetSingleCard(imageState);
                    return;
                }
                if(i < MAX_RETRIES) await wait(delay);
                delay *= 2;
            }
        }
        imageState.status = 'failed';
        updateItemStatus(imageState);
    }
    
    class LoadManager {
        constructor(limit) {
            this.limit = limit;
            this.queue = [];
            this.activeCount = 0;
        }
        addJob(job) {
            if(job.status === 'restoring') return;
            this.queue.push(job);
            this.tryStartNext();
        }
        tryStartNext() {
            while (this.activeCount < this.limit && this.queue.length > 0) {
                const job = this.queue.shift();
                this.activeCount++;
                loadImageWithRetry(job).finally(() => {
                    this.activeCount--;
                    this.tryStartNext();
                });
            }
        }
    }
    
    // --- DOM MANIPULATION & UI ---
    
    function createGalleryItem(imageState) {
        const item = galleryItemTemplate.content.cloneNode(true).firstElementChild;
        item.dataset.id = imageState.id;
        const placeholder = item.querySelector('.canvas-placeholder');
        placeholder.style.backgroundImage = `url(${imageState.url.replace('/400/500', '/20/25')})`;
        item.querySelector('.btn-action').dataset.id = imageState.id;
        gallery.appendChild(item);
        return item;
    }

    function resetSingleCard(imageState) {
        // Reset the state object
        imageState.status = 'pending';
        imageState.retryCount = 0;
        imageState.imageElement = null;
        imageState.abortController = new AbortController();

        // Reset the DOM element
        const item = document.querySelector(`.gallery-item[data-id="${imageState.id}"]`);
        if (item) {
            const imgContainer = item.querySelector('.image-container');
            imgContainer.innerHTML = ''; // Remove the old successful image
        }
        updateItemStatus(imageState);
    }
    
    function updateItemStatus(imageState) {
        const item = document.querySelector(`.gallery-item[data-id="${imageState.id}"]`);
        if (!item) return;

        item.className = `gallery-item ${imageState.status}`;
        const statusText = item.querySelector('.status-text');
        const actionButton = item.querySelector('.btn-action');
        
        switch(imageState.status) {
            case 'pending':
                statusText.textContent = 'Pending';
                actionButton.textContent = 'Restore';
                actionButton.dataset.action = 'restore';
                actionButton.style.display = '';
                break;
            case 'restoring':
                statusText.textContent = ``; // Hide text while spinner is active
                actionButton.textContent = 'Cancel';
                actionButton.dataset.action = 'cancel';
                actionButton.style.display = '';
                break;
            case 'success':
                if (item.querySelector('.image-container') && imageState.imageElement) {
                    item.querySelector('.image-container').appendChild(imageState.imageElement);
                }
                statusText.textContent = 'Restored';
                actionButton.textContent = 'Restore Again';
                actionButton.dataset.action = 'restore';
                actionButton.style.display = '';
                break;
            case 'failed':
                statusText.textContent = `Restoration Failed`;
                actionButton.textContent = 'Retry';
                actionButton.dataset.action = 'restore';
                actionButton.style.display = '';
                break;
        }
    }

    // --- EVENT HANDLERS ---
    
    gallery.addEventListener('click', (e) => {
        const target = e.target;
        if (!target.classList.contains('btn-action')) return;
        
        const id = target.dataset.id;
        const imageState = imageStates.find(s => s.id == id);
        if (!imageState) return;
        
        const action = target.dataset.action;
        if(action === 'restore') {
            if (imageState.status === 'success') {
                resetSingleCard(imageState);
            }
            loadManager.addJob(imageState);
        } else if(action === 'cancel') {
            imageState.abortController.abort();
        }
    });
    
    resetAllBtn.addEventListener('click', initializeGallery);
    
    // --- INITIALIZATION ---
    function initializeGallery() {
        gallery.innerHTML = '';
        loadManager = new LoadManager(CONCURRENCY_LIMIT);

        imageStates = IMAGE_URLS.map((url, i) => {
            const state = {
                id: i,
                url,
                status: 'pending',
                retryCount: 0,
                abortController: new AbortController()
            };
            createGalleryItem(state);
            updateItemStatus(state);
            return state;
        });

        // Automatically restore all images after reset
        imageStates.forEach(state => {
            loadManager.addJob(state);
        });
    }

    initializeGallery();
});