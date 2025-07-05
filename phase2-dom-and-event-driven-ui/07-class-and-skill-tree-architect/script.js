document.addEventListener('DOMContentLoaded', () => {

    // --- DATA ---
    const skills = {
        'slash': { name: 'Slash', icon: '⚔️', cost: 1, position: { x: 50, y: 150 } },
        'power-slash': { name: 'Power Slash', icon: '💥', cost: 2, requires: ['slash'], position: { x: 200, y: 50 } },
        'dual-wield': { name: 'Dual Wield', icon: '⚔️⚔️', cost: 3, requires: ['slash'], position: { x: 200, y: 250 } },
        'heavy-armor': { name: 'Heavy Armor', icon: '🛡️', cost: 2, position: { x: 50, y: 400 } },
        'fireball': { name: 'Fireball', icon: '🔥', cost: 1, position: { x: 500, y: 150 } },
        'ice-storm': { name: 'Ice Storm', icon: '❄️', cost: 2, requires: ['fireball'], position: { x: 650, y: 50 } },
        'heal': { name: 'Heal', icon: '❤️‍🩹', cost: 2, position: { x: 500, y: 400 } },
    };

    const actions = [
        { name: 'Perform a basic sword slash', skill: 'slash' },
        { name: 'Unleash a devastating power slash', skill: 'power-slash' },
        { name: 'Equip a weapon in each hand', skill: 'dual-wield' },
        { name: 'Equip heavy plate armor', skill: 'heavy-armor' },
        { name: 'Hurl a fiery projectile', skill: 'fireball' },
        { name: 'Summon a blizzard', skill: 'ice-storm' },
        { name: 'Mend minor wounds', skill: 'heal' }
    ];

    let classes = {
        'Warrior': { unlockedSkills: ['slash'], inherits: null, skillPoints: 10, position: {x: 50, y: 50} },
        'Mage': { unlockedSkills: ['fireball'], inherits: null, skillPoints: 10, position: {x: 50, y: 150} }
    };
    
    // --- DOM Elements ---
    const classHierarchy = document.getElementById('class-hierarchy');
    const skillTree = document.getElementById('skill-tree');
    const hierarchySvg = document.getElementById('hierarchy-svg');
    const skillTreeSvg = document.getElementById('skill-tree-svg');
    const addClassBtn = document.getElementById('add-class-btn');
    const newClassNameInput = document.getElementById('new-class-name');
    const skillPointDisplay = document.getElementById('skill-point-display');
    const simClassName = document.getElementById('sim-class-name');
    const simActionsList = document.getElementById('simulation-actions');
    const classNodeTemplate = document.getElementById('class-node-template');
    const skillNodeTemplate = document.getElementById('skill-node-template');

    // --- State ---
    let selectedClass = null;
    let draggedElement = null;

    // --- Core Logic ---
    function getTotalSkills(className) {
        if (!classes[className]) return new Set();
        let allSkills = new Set(classes[className].unlockedSkills);
        let currentClass = className;
        while (classes[currentClass] && classes[currentClass].inherits) {
            currentClass = classes[currentClass].inherits;
            classes[currentClass].unlockedSkills.forEach(skill => allSkills.add(skill));
        }
        return allSkills;
    }
    
    // --- Rendering Functions ---
    function renderAll() {
        renderClassHierarchy();
        renderSkillTree();
        renderSimulation();
        drawAllConnectors();
    }
    
    function renderClassHierarchy() {
        classHierarchy.innerHTML = '';
        for (const className in classes) {
            const classData = classes[className];
            const node = classNodeTemplate.content.cloneNode(true).firstElementChild;
            node.dataset.className = className;
            node.style.left = `${classData.position.x}px`;
            node.style.top = `${classData.position.y}px`;
            node.querySelector('.class-name').textContent = className;
            node.querySelector('.skill-points-info').textContent = `SP: ${classData.skillPoints}`;
            if (className === selectedClass) node.classList.add('selected');
            classHierarchy.appendChild(node);
        }
    }
    
    function renderSkillTree() {
        skillTree.innerHTML = '';
        const totalSkillsForSelected = selectedClass ? getTotalSkills(selectedClass) : new Set();
        const directSkillsForSelected = selectedClass ? new Set(classes[selectedClass].unlockedSkills) : new Set();

        for (const skillId in skills) {
            const skill = skills[skillId];
            const node = skillNodeTemplate.content.cloneNode(true).firstElementChild;
            node.dataset.skillId = skillId;
            node.style.left = `${skill.position.x}px`;
            node.style.top = `${skill.position.y}px`;
            node.querySelector('.skill-icon').textContent = skill.icon;
            node.querySelector('.skill-name').textContent = skill.name;
            node.querySelector('.skill-cost').textContent = skill.cost;

            if (directSkillsForSelected.has(skillId)) {
                node.classList.add('unlocked');
            } else if (totalSkillsForSelected.has(skillId)) {
                node.classList.add('inherited');
            } else {
                const canUnlock = !skill.requires || skill.requires.every(req => totalSkillsForSelected.has(req));
                if (canUnlock) {
                    node.classList.add('can-unlock');
                }
            }
            skillTree.appendChild(node);
        }
        
        // Update skill point display
        if(selectedClass) {
            skillPointDisplay.classList.remove('hidden');
            skillPointDisplay.querySelector('#skill-points').textContent = classes[selectedClass].skillPoints;
        } else {
            skillPointDisplay.classList.add('hidden');
        }
    }

    function renderSimulation() {
        simClassName.textContent = selectedClass || 'No Class';
        const availableSkills = selectedClass ? getTotalSkills(selectedClass) : new Set();
        simActionsList.innerHTML = actions.map(action => `
            <li class="action-item ${availableSkills.has(action.skill) ? 'enabled' : ''}">
                <span class="action-icon">${skills[action.skill].icon}</span>
                <span>${action.name}</span>
            </li>
        `).join('');
    }

    function drawAllConnectors() {
        hierarchySvg.innerHTML = '';
        skillTreeSvg.innerHTML = '';
        // Draw hierarchy connectors
        for (const className in classes) {
            if (classes[className].inherits) {
                const childEl = document.querySelector(`.class-node[data-class-name="${className}"]`);
                const parentEl = document.querySelector(`.class-node[data-class-name="${classes[className].inherits}"]`);
                drawConnector(hierarchySvg, parentEl, childEl, 'hierarchy');
            }
        }
        // Draw skill tree connectors
        const totalSkills = selectedClass ? getTotalSkills(selectedClass) : new Set();
        for (const skillId in skills) {
            if (skills[skillId].requires) {
                skills[skillId].requires.forEach(reqId => {
                    const childEl = document.querySelector(`.skill-node[data-skill-id="${skillId}"]`);
                    const parentEl = document.querySelector(`.skill-node[data-skill-id="${reqId}"]`);
                    const isUnlocked = totalSkills.has(skillId) && totalSkills.has(reqId);
                    const isInherited = isUnlocked && !classes[selectedClass]?.unlockedSkills.includes(skillId);
                    drawConnector(skillTreeSvg, parentEl, childEl, 'skill', isUnlocked, isInherited);
                });
            }
        }
    }

    function drawConnector(svg, el1, el2, type, isUnlocked, isInherited) {
        if (!el1 || !el2) return;
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        const rect1 = el1.getBoundingClientRect();
        const rect2 = el2.getBoundingClientRect();
        const svgRect = svg.getBoundingClientRect();

        const x1 = rect1.left + rect1.width / 2 - svgRect.left;
        const y1 = rect1.top + rect1.height / 2 - svgRect.top;
        const x2 = rect2.left + rect2.width / 2 - svgRect.left;
        const y2 = rect2.top + rect2.height / 2 - svgRect.top;
        
        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
        line.classList.add('connector');
        
        if (type === 'skill') {
            if (isUnlocked) line.classList.add('unlocked');
            if (isInherited) line.classList.add('inherited');
        }
        svg.appendChild(line);
    }
    
    // --- Event Handlers ---
    addClassBtn.addEventListener('click', () => {
        const name = newClassNameInput.value.trim();
        if (name && !classes[name]) {
            classes[name] = {
                unlockedSkills: [],
                inherits: null,
                skillPoints: 10,
                position: {x: 50, y: 50 + Object.keys(classes).length * 100}
            };
            newClassNameInput.value = '';
            renderAll();
        }
    });

    classHierarchy.addEventListener('click', (e) => {
        const targetNode = e.target.closest('.class-node');
        if (targetNode) {
            selectedClass = targetNode.dataset.className;
            renderAll();
        }
    });
    
    // Drag and Drop for Inheritance
    classHierarchy.addEventListener('dragstart', (e) => {
        draggedElement = e.target.closest('.class-node');
        e.dataTransfer.setData('text/plain', draggedElement.dataset.className);
    });
    classHierarchy.addEventListener('dragover', (e) => {
        e.preventDefault();
        const targetNode = e.target.closest('.class-node');
        if (targetNode && targetNode !== draggedElement) {
            targetNode.classList.add('drag-over');
        }
    });
    classHierarchy.addEventListener('dragleave', (e) => {
        e.target.closest('.class-node')?.classList.remove('drag-over');
    });
    classHierarchy.addEventListener('drop', (e) => {
        e.preventDefault();
        const targetNode = e.target.closest('.class-node');
        targetNode?.classList.remove('drag-over');
        const childName = e.dataTransfer.getData('text/plain');
        const parentName = targetNode?.dataset.className;

        if (childName && parentName && childName !== parentName) {
            classes[childName].inherits = parentName;
            renderAll();
        }
    });

    skillTree.addEventListener('click', (e) => {
        const targetNode = e.target.closest('.skill-node.can-unlock');
        if (targetNode && selectedClass) {
            const skillId = targetNode.dataset.skillId;
            const skill = skills[skillId];
            const currentClass = classes[selectedClass];
            if (currentClass.skillPoints >= skill.cost) {
                currentClass.unlockedSkills.push(skillId);
                currentClass.skillPoints -= skill.cost;
                renderAll();
            } else {
                alert('Not enough skill points!');
            }
        }
    });

    // --- Initial Load ---
    renderAll();
});