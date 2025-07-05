document.addEventListener('DOMContentLoaded', () => {

    // --- DATA ---
    const characters = [
        { id: 'aurora', name: 'Aurora', class: 'Starlight Mage', avatar: 'https://i.pravatar.cc/150?u=aurora',
            stats: { strength: 40, agility: 70, intellect: 95 },
            backstory: 'A gifted mage from the celestial peaks, Aurora commands the power of stars to protect the innocent.',
            abilities: [
                { name: 'Cosmic Flare', icon: '✨', description: 'Unleashes a blinding flash of starlight, disorienting all nearby enemies.' },
                { name: 'Gravity Well', icon: '🌀', description: 'Creates a vortex that pulls enemies together, slowing them down.' }
            ]
        },
        { id: 'kain', name: 'Kain', class: 'Shadowblade Rogue', avatar: 'https://i.pravatar.cc/150?u=kain',
            stats: { strength: 60, agility: 95, intellect: 50 },
            backstory: 'An orphan raised by the thieves\' guild, Kain moves unseen and strikes with lethal precision from the shadows.',
            abilities: [
                { name: 'Shadow Step', icon: '💨', description: 'Instantly teleport behind a target from the shadows.' },
                { name: 'Venom Strike', icon: '🐍', description: 'Coats blades in a deadly toxin, dealing damage over time.' }
            ]
        },
        { id: 'bjorne', name: 'Bjorne', class: 'Earthguard Warden', avatar: 'https://i.pravatar.cc/150?u=bjorne',
            stats: { strength: 95, agility: 30, intellect: 60 },
            backstory: 'A stoic guardian of the ancient forests, Bjorne can command the earth itself to defend his allies.',
            abilities: [
                { name: 'Stone Form', icon: '🗿', description: 'Turns skin to stone, massively increasing defense for a short period.' },
                { name: 'Earthen Grasp', icon: '✊', description: 'Summons roots from the ground to immobilize a target.' }
            ]
        }
    ];

    // --- DOM Elements ---
    const appContainer = document.getElementById('app-container');
    const characterSelect = document.getElementById('character-select');
    const sheetContainer = document.getElementById('character-sheet-container');
    const layoutToggle = document.getElementById('layout-toggle-checkbox');
    const modal = document.getElementById('ability-modal');
    const modalCloseBtn = document.getElementById('modal-close-btn');

    // --- State ---
    let tabs = [];
    let panels = [];

    // --- Functions ---
    function setupTabs() {
        characters.forEach((char, index) => {
            // Create Tab (Portrait)
            const tab = document.createElement('button');
            tab.className = 'character-tab';
            tab.id = `tab-${char.id}`;
            tab.setAttribute('role', 'tab');
            tab.setAttribute('aria-controls', `panel-${char.id}`);
            tab.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
            tab.innerHTML = `<img src="${char.avatar}" alt="${char.name}">`;
            characterSelect.appendChild(tab);
            tabs.push(tab);

            // Create Panel (Character Sheet)
            const panel = document.createElement('div');
            panel.className = 'character-sheet';
            panel.id = `panel-${char.id}`;
            panel.setAttribute('role', 'tabpanel');
            panel.setAttribute('aria-labelledby', `tab-${char.id}`);
            if (index !== 0) panel.hidden = true;
            sheetContainer.appendChild(panel);
            panels.push(panel);
        });
    }

    function renderCharacterSheet(character) {
        return `
            <div class="sheet-header">
                <img src="${character.avatar}" alt="${character.name}" class="sheet-avatar">
                <div class="sheet-title">
                    <h2>${character.name}</h2>
                    <span class="class-name">${character.class}</span>
                </div>
            </div>
            <div class="sheet-content">
                <div class="sheet-section">
                    <h3>Backstory</h3>
                    <p class="backstory">${character.backstory}</p>
                </div>
                <div class="sheet-section">
                    <h3>Stats</h3>
                    <div class="stats-list">
                        ${Object.entries(character.stats).map(([stat, value]) => `
                            <div class="stat">
                                <span class="stat-name">${stat.charAt(0).toUpperCase() + stat.slice(1)}</span>
                                <div class="stat-bar"><div class="stat-level" style="width: ${value}%;"></div></div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="sheet-section abilities-section">
                    <h3>Abilities</h3>
                    <div class="abilities-list">
                        ${character.abilities.map((ability, index) => `
                            <button class="ability-btn" data-ability-index="${index}">${ability.name}</button>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    function activateTab(tab) {
        const targetPanel = document.getElementById(tab.getAttribute('aria-controls'));

        // Deactivate all others
        tabs.forEach(t => t.setAttribute('aria-selected', 'false'));
        panels.forEach(p => p.hidden = true);

        // Activate the target
        tab.setAttribute('aria-selected', 'true');
        targetPanel.hidden = false;
        
        // Render content into the now-visible panel
        const characterData = characters.find(c => `tab-${c.id}` === tab.id);
        if (characterData && targetPanel.innerHTML === '') {
            targetPanel.innerHTML = renderCharacterSheet(characterData);
        }
        
        // Update URL hash
        window.history.pushState(null, '', `#${characterData.id}`);
    }
    
    // --- Event Handlers ---
    characterSelect.addEventListener('click', (e) => {
        const tab = e.target.closest('.character-tab');
        if (tab) {
            activateTab(tab);
        }
    });

    characterSelect.addEventListener('keydown', (e) => {
        const currentTab = document.activeElement;
        let currentIndex = tabs.indexOf(currentTab);
        if(currentIndex === -1) return;

        let nextIndex = currentIndex;
        const isVertical = appContainer.classList.contains('vertical-layout');

        if ((isVertical && e.key === 'ArrowDown') || (!isVertical && e.key === 'ArrowRight')) {
            nextIndex = (currentIndex + 1) % tabs.length;
        } else if ((isVertical && e.key === 'ArrowUp') || (!isVertical && e.key === 'ArrowLeft')) {
            nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
        } else if (e.key === 'Home') {
            nextIndex = 0;
        } else if (e.key === 'End') {
            nextIndex = tabs.length - 1;
        } else {
            return; // Not a navigation key
        }

        e.preventDefault();
        tabs[nextIndex].focus();
        activateTab(tabs[nextIndex]);
    });

    layoutToggle.addEventListener('change', () => {
        appContainer.classList.toggle('vertical-layout');
    });

    // Modal Handling
    sheetContainer.addEventListener('click', e => {
        const abilityBtn = e.target.closest('.ability-btn');
        if(abilityBtn) {
            const panel = abilityBtn.closest('.character-sheet');
            const characterId = panel.id.replace('panel-', '');
            const character = characters.find(c => c.id === characterId);
            const abilityIndex = abilityBtn.dataset.abilityIndex;
            const ability = character.abilities[abilityIndex];
            
            openModal(ability);
        }
    });

    function openModal(ability) {
        document.getElementById('modal-title').textContent = ability.name;
        document.getElementById('modal-description').textContent = ability.description;
        document.getElementById('modal-icon').textContent = ability.icon;
        modal.classList.remove('hidden');
        modalCloseBtn.focus();
    }
    
    function closeModal() {
        modal.classList.add('hidden');
    }

    modalCloseBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => { if(e.target === modal) closeModal(); });
    document.addEventListener('keydown', (e) => { if(e.key === 'Escape' && !modal.classList.contains('hidden')) closeModal(); });


    // --- Initial Load ---
    function init() {
        setupTabs();
        const initialHash = window.location.hash.replace('#', '');
        const initialTab = document.getElementById(`tab-${initialHash}`) || tabs[0];
        activateTab(initialTab);
    }

    init();
});