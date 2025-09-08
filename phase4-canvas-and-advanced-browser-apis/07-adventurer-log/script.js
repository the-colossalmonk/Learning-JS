document.addEventListener('DOMContentLoaded', () => {

    // --- DOM Elements ---
    const addEntryBtn = document.getElementById('add-entry-btn');
    const journalEntriesEl = document.getElementById('journal-entries');
    const mapContainer = document.getElementById('map-container');
    const mapCanvas = document.getElementById('map-canvas');
    const fogCanvas = document.getElementById('fog-canvas');
    const mapInstruction = document.getElementById('map-instruction');
    const resetMapBtn = document.getElementById('reset-map-btn');
    // Entry Modal
    const entryModal = document.getElementById('entry-modal');
    const entryForm = document.getElementById('entry-form');
    const modalCancelBtn = document.getElementById('modal-cancel-btn');
    const pinSelect = document.getElementById('pin-select');
    // View Modal
    const viewModal = document.getElementById('view-modal');
    const viewModalCloseBtn = document.getElementById('view-modal-close-btn');
    const viewModalDisplayArea = document.getElementById('view-modal-display-area');
    const viewModalEditArea = document.getElementById('view-modal-edit-area');
    const viewModalTitle = document.getElementById('view-modal-title');
    const viewModalDate = document.getElementById('view-modal-date');
    const viewModalImage = document.getElementById('view-modal-image');
    const viewModalText = document.getElementById('view-modal-text');
    const editTitleInput = document.getElementById('edit-title');
    const editTextInput = document.getElementById('edit-text');
    const viewModalDeleteBtn = document.getElementById('view-modal-delete-btn');
    const viewModalEditBtn = document.getElementById('view-modal-edit-btn');
    const viewModalSaveBtn = document.getElementById('view-modal-save-btn');

    // --- Canvas Contexts ---
    const mapCtx = mapCanvas.getContext('2d');
    const fogCtx = fogCanvas.getContext('2d');

    // --- State & Config ---
    let journalEntries = [];
    let isPinMode = false;
    let nextEntryCoords = null;
    let activeEntryId = null;
    const mapImage = new Image();
    mapImage.src = 'fantasy-map.png';

    const PINS = {
        '🏰': { name: 'City/Castle' }, '⚔️': { name: 'Battle' },
        '🌲': { name: 'Forest' }, '⛰️': { name: 'Mountain' },
        '❓': { name: 'Discovery' }, '💎': { name: 'Treasure' }
    };
    
    // --- Core Functions ---
    function loadState() {
        const savedEntries = localStorage.getItem('adventurersLog');
        journalEntries = savedEntries ? JSON.parse(savedEntries) : [];
    }
    function saveState() {
        localStorage.setItem('adventurersLog', JSON.stringify(journalEntries));
    }
    
    function resizeCanvases() {
        mapCanvas.width = fogCanvas.width = mapContainer.clientWidth;
        mapCanvas.height = fogCanvas.height = mapContainer.clientHeight;
        renderAll();
    }
    
    // --- Rendering ---
    function renderAll() {
        renderMap();
        renderJournalEntries();
    }
    
    function renderMap() {
        if (!mapImage.complete || mapImage.naturalWidth === 0) {
             mapCtx.fillStyle = '#2d3748';
             mapCtx.fillRect(0, 0, mapCanvas.width, mapCanvas.height);
             mapCtx.fillStyle = 'white';
             mapCtx.textAlign = 'center';
             mapCtx.fillText("Map image 'fantasy-map.png' not found.", mapCanvas.width / 2, mapCanvas.height / 2);
             return;
        }
        
        mapCtx.clearRect(0, 0, mapCanvas.width, mapCanvas.height);
        fogCtx.clearRect(0, 0, fogCanvas.width, fogCanvas.height);
        
        mapCtx.drawImage(mapImage, 0, 0, mapCanvas.width, mapCanvas.height);
        drawJourneyPath();
        
        journalEntries.forEach(entry => drawPin(entry, entry.id === activeEntryId));

        drawFogOfWar();
    }
    
    function drawPin(entry, isActive = false) {
        const { coords, pin } = entry;
        if (isActive) {
            mapCtx.beginPath();
            mapCtx.arc(coords.x, coords.y, 20, 0, Math.PI * 2);
            mapCtx.fillStyle = 'rgba(139, 0, 0, 0.5)';
            mapCtx.strokeStyle = '#8b0000';
            mapCtx.lineWidth = 2;
            mapCtx.fill();
            mapCtx.stroke();
        }
        mapCtx.font = '24px sans-serif';
        mapCtx.textAlign = 'center';
        mapCtx.textBaseline = 'middle';
        mapCtx.fillText(pin, coords.x, coords.y);
    }
    
    function drawJourneyPath() {
        if (journalEntries.length < 2) return;
        mapCtx.beginPath();
        mapCtx.strokeStyle = 'rgba(90, 72, 58, 0.7)';
        mapCtx.lineWidth = 2;
        mapCtx.setLineDash([5, 5]);
        const sortedEntries = [...journalEntries].sort((a,b) => a.timestamp - b.timestamp);
        mapCtx.moveTo(sortedEntries[0].coords.x, sortedEntries[0].coords.y);
        for(let i = 1; i < sortedEntries.length; i++) { mapCtx.lineTo(sortedEntries[i].coords.x, sortedEntries[i].coords.y); }
        mapCtx.stroke();
        mapCtx.setLineDash([]);
    }

    function drawFogOfWar() {
        fogCtx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        fogCtx.fillRect(0, 0, fogCanvas.width, fogCanvas.height);
        if (journalEntries.length === 0) return;
        fogCtx.globalCompositeOperation = 'destination-out';
        journalEntries.forEach(entry => {
            const radius = Math.min(fogCanvas.width, fogCanvas.height) * 0.15;
            const gradient = fogCtx.createRadialGradient(entry.coords.x, entry.coords.y, radius * 0.25, entry.coords.x, entry.coords.y, radius);
            gradient.addColorStop(0, 'rgba(0,0,0,1)');
            gradient.addColorStop(1, 'rgba(0,0,0,0)');
            fogCtx.fillStyle = gradient;
            fogCtx.beginPath();
            fogCtx.arc(entry.coords.x, entry.coords.y, radius, 0, Math.PI * 2);
            fogCtx.fill();
        });
        fogCtx.globalCompositeOperation = 'source-over';
    }

    function renderJournalEntries() {
        if(journalEntries.length === 0) {
            journalEntriesEl.innerHTML = '<p class="no-entries-message">Your journey has not yet been chronicled. Click \'New Log Entry\' to begin.</p>';
            return;
        }
        journalEntriesEl.innerHTML = '';
        const sortedEntries = [...journalEntries].sort((a,b) => b.timestamp - a.timestamp);
        sortedEntries.forEach(entry => {
            const entryEl = document.createElement('div');
            entryEl.className = 'journal-entry';
            if (entry.id === activeEntryId) {
                entryEl.classList.add('active');
            }
            entryEl.dataset.entryId = entry.id;
            const date = new Date(entry.timestamp).toLocaleDateString();
            entryEl.innerHTML = `<div class="entry-header">${entry.pin} ${entry.title}</div><div class="entry-date">${date}</div>`;
            journalEntriesEl.appendChild(entryEl);
        });
    }

    // --- Event Handlers & Logic ---
    function handleAddEntryClick() {
        isPinMode = true;
        mapContainer.classList.add('pin-mode');
        mapInstruction.classList.remove('hidden');
    }

    function handleMapClick(e) {
        if (!isPinMode) return;
        const rect = mapCanvas.getBoundingClientRect();
        nextEntryCoords = { x: e.clientX - rect.left, y: e.clientY - rect.top };
        isPinMode = false;
        mapContainer.classList.remove('pin-mode');
        mapInstruction.classList.add('hidden');
        openModal();
    }
    
    function handleJournalClick(e) {
        const targetEntry = e.target.closest('.journal-entry');
        if (targetEntry) {
            const entryId = parseInt(targetEntry.dataset.entryId);
            activeEntryId = entryId;
            renderAll();
            const entryData = journalEntries.find(entry => entry.id === entryId);
            if (entryData) {
                showEntryDetailModal(entryData);
            }
        }
    }

    function openModal() {
        entryForm.reset();
        document.querySelector('.pin-option.selected')?.classList.remove('selected');
        document.querySelector('.pin-option:first-child')?.classList.add('selected');
        entryModal.classList.remove('hidden');
    }
    
    function closeModal() {
        entryModal.classList.add('hidden');
        nextEntryCoords = null;
    }

    async function handleFormSubmit(e) {
        e.preventDefault();
        const title = document.getElementById('entry-title').value;
        const text = document.getElementById('entry-text').value;
        const imageFile = document.getElementById('entry-image').files[0];
        const selectedPin = document.querySelector('.pin-option.selected').dataset.pin;
        let imageDataUrl = null;
        if(imageFile) {
            imageDataUrl = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(imageFile);
            });
        }
        const newEntry = { id: Date.now(), title, text, imageDataUrl, timestamp: Date.now(), coords: nextEntryCoords, pin: selectedPin };
        journalEntries.push(newEntry);
        activeEntryId = newEntry.id;
        saveState();
        renderAll();
        closeModal();
    }
    
    function showEntryDetailModal(entry) {
        viewModalTitle.textContent = entry.title;
        viewModalDate.textContent = `Chronicled on: ${new Date(entry.timestamp).toDateString()}`;
        viewModalText.textContent = entry.text;
        if (entry.imageDataUrl) {
            viewModalImage.src = entry.imageDataUrl;
            viewModalImage.style.display = 'block';
        } else {
            viewModalImage.style.display = 'none';
        }
        viewModalDisplayArea.classList.remove('hidden');
        viewModalEditArea.classList.add('hidden');
        viewModalEditBtn.classList.remove('hidden');
        viewModalDeleteBtn.classList.remove('hidden');
        viewModalSaveBtn.classList.add('hidden');
        viewModal.classList.remove('hidden');
    }
    
    function closeViewModal() {
        viewModal.classList.add('hidden');
    }
    
    function toggleEditMode() {
        const entry = journalEntries.find(e => e.id === activeEntryId);
        if (!entry) return;
        editTitleInput.value = entry.title;
        editTextInput.value = entry.text;
        viewModalDisplayArea.classList.add('hidden');
        viewModalEditArea.classList.remove('hidden');
        viewModalEditBtn.classList.add('hidden');
        viewModalDeleteBtn.classList.add('hidden');
        viewModalSaveBtn.classList.remove('hidden');
    }

    function saveEntryChanges() {
        const entryIndex = journalEntries.findIndex(e => e.id === activeEntryId);
        if (entryIndex === -1) return;
        
        journalEntries[entryIndex].title = editTitleInput.value;
        journalEntries[entryIndex].text = editTextInput.value;
        
        saveState();
        renderAll();
        closeViewModal();
    }

    function deleteEntry() {
        if (!activeEntryId) return;
        if (confirm('Are you sure you want to delete this log entry forever?')) {
            journalEntries = journalEntries.filter(e => e.id !== activeEntryId);
            activeEntryId = null;
            saveState();
            renderAll();
            closeViewModal();
        }
    }

    function resetJournal() {
        if (confirm('Are you sure you want to erase your entire journal? This cannot be undone.')) {
            journalEntries = [];
            activeEntryId = null;
            saveState();
            renderAll();
        }
    }
    
    function setupPinSelector() {
        for(const pin in PINS) {
            const pinEl = document.createElement('div');
            pinEl.className = 'pin-option';
            pinEl.dataset.pin = pin;
            pinEl.textContent = pin;
            pinEl.title = PINS[pin].name;
            pinSelect.appendChild(pinEl);
        }
        pinSelect.querySelector(':first-child')?.classList.add('selected');
        pinSelect.addEventListener('click', (e) => {
            const target = e.target.closest('.pin-option');
            if(target) {
                pinSelect.querySelector('.selected')?.classList.remove('selected');
                target.classList.add('selected');
            }
        });
    }

    // --- Initialization ---
    function init() {
        loadState();
        setupPinSelector();
        mapImage.onload = () => resizeCanvases();
        // Handle case where map image fails to load
        mapImage.onerror = () => {
            console.error("Failed to load map image: 'fantasy-map.png'. Make sure it's in the same folder.");
            resizeCanvases(); // Still render to show the error message
        }
        window.addEventListener('resize', resizeCanvases);
        addEntryBtn.addEventListener('click', handleAddEntryClick);
        mapContainer.addEventListener('click', handleMapClick);
        modalCancelBtn.addEventListener('click', closeModal);
        entryForm.addEventListener('submit', handleFormSubmit);
        journalEntriesEl.addEventListener('click', handleJournalClick);
        viewModalCloseBtn.addEventListener('click', closeViewModal);
        viewModal.addEventListener('click', (e) => { if (e.target === viewModal) closeViewModal(); });
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !viewModal.classList.contains('hidden')) closeViewModal(); });
        viewModalEditBtn.addEventListener('click', toggleEditMode);
        viewModalSaveBtn.addEventListener('click', saveEntryChanges);
        viewModalDeleteBtn.addEventListener('click', deleteEntry);
        resetMapBtn.addEventListener('click', resetJournal);
    }
    
    init();
});