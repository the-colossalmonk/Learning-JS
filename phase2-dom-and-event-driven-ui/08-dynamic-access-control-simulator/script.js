document.addEventListener('DOMContentLoaded', () => {

    // --- DATA MODEL (Single Source of Truth) ---
    let state = {
        roles: {
            'Admin': { permissions: ['all'] },
            'Editor': { permissions: ['MOVE_TO_VAULT_1', 'MOVE_TO_VAULT_2', 'MOVE_FROM_UNSECURED', 'CREATE_FILES', 'DELETE_FILES'] },
            'Viewer': { permissions: ['VIEW_FILES'] }
        },
        files: [
            { id: 1, name: 'Project-Alpha.docx', location: 'unsecured-files', icon: '📄' },
            { id: 2, name: 'Financials.xlsx', location: 'unsecured-files', icon: '📈' },
            { id: 3, name: 'Marketing-Plan.pdf', location: 'unsecured-files', icon: '📑' },
        ],
        allPermissions: ['MOVE_TO_VAULT_1', 'MOVE_TO_VAULT_2', 'MOVE_TO_VAULT_3', 'MOVE_FROM_UNSECURED', 'CREATE_FILES', 'DELETE_FILES', 'VIEW_FILES'],
        selectedRoleForEditing: 'Admin',
        currentLoginRole: 'Admin', // The role we are simulating
        nextFileId: 4
    };
    
    // --- DOM Elements ---
    const rolesList = document.getElementById('roles-list');
    const addRoleForm = document.getElementById('add-role-form');
    const newRoleNameInput = document.getElementById('new-role-name');
    const permissionsContainer = document.getElementById('permissions-container');
    const permissionsList = document.getElementById('permissions-list');
    const selectedRoleNameSpan = document.getElementById('selected-role-name');
    const userSelect = document.getElementById('user-select');
    const activityLog = document.getElementById('activity-log');
    const fileTemplate = document.getElementById('file-template');
    const addFileForm = document.getElementById('add-file-form');
    const newFileNameInput = document.getElementById('new-file-name');
    const simulationPanel = document.querySelector('.simulation-panel');

    // --- State Management ---
    function loadState() {
        const savedState = localStorage.getItem('accessControlState');
        if (savedState) {
            state = JSON.parse(savedState);
        }
    }
    function saveState() {
        localStorage.setItem('accessControlState', JSON.stringify(state));
    }

    // --- Rendering Functions ---
    function renderAll() {
        renderRoles();
        renderPermissions();
        renderLoginDropdown();
        renderFiles();
        updateSimulationView();
    }
    
    function renderRoles() {
        rolesList.innerHTML = '';
        Object.keys(state.roles).forEach(roleName => {
            const li = document.createElement('li');
            li.className = 'role-item';
            li.dataset.roleName = roleName;
            if(roleName === state.selectedRoleForEditing) li.classList.add('active');
            const nameSpan = document.createElement('span');
            nameSpan.textContent = roleName;
            li.appendChild(nameSpan);
            if (roleName !== 'Admin') {
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'delete-role-btn';
                deleteBtn.innerHTML = '×';
                li.appendChild(deleteBtn);
            }
            rolesList.appendChild(li);
        });
    }

    function renderPermissions() {
        if (!state.selectedRoleForEditing) {
            permissionsContainer.classList.add('hidden');
            return;
        }
        permissionsContainer.classList.remove('hidden');
        selectedRoleNameSpan.textContent = state.selectedRoleForEditing;
        permissionsList.innerHTML = '';
        const rolePermissions = state.roles[state.selectedRoleForEditing].permissions;
        state.allPermissions.forEach(permission => {
            const isChecked = rolePermissions.includes('all') || rolePermissions.includes(permission);
            const label = document.createElement('label');
            label.className = 'permission-item';
            label.innerHTML = `<input type="checkbox" data-permission="${permission}" ${isChecked ? 'checked' : ''} ${state.selectedRoleForEditing === 'Admin' ? 'disabled' : ''}><span>${permission.replace(/_/g, ' ').toLowerCase()}</span>`;
            permissionsList.appendChild(label);
        });
    }

    // UPDATED: Now renders roles instead of users
    function renderLoginDropdown() {
        userSelect.innerHTML = '';
        Object.keys(state.roles).forEach(roleName => {
            const option = document.createElement('option');
            option.value = roleName;
            option.textContent = roleName;
            if (roleName === state.currentLoginRole) option.selected = true;
            userSelect.appendChild(option);
        });
    }
    
    function renderFiles() {
        document.querySelectorAll('.file-area').forEach(area => {
            const title = area.querySelector('.area-title');
            area.innerHTML = '';
            if(title) area.appendChild(title);
        });
        state.files.forEach(file => {
            const fileEl = fileTemplate.content.cloneNode(true).firstElementChild;
            fileEl.dataset.fileId = file.id;
            fileEl.querySelector('.file-icon').textContent = file.icon;
            fileEl.querySelector('.file-name').textContent = file.name;
            document.getElementById(file.location)?.appendChild(fileEl);
        });
    }

    // --- Core Logic & Simulation ---
    // UPDATED: Now gets permissions directly for a role
    function getRolePermissions(roleName) {
        const role = state.roles[roleName];
        if (!role) return new Set();
        
        const permissions = new Set(role.permissions);
        
        if (permissions.has('all')) {
            return new Set(state.allPermissions);
        }
        return permissions;
    }
    
    function updateSimulationView() {
        const permissions = getRolePermissions(state.currentLoginRole);
        document.querySelectorAll('.file-area').forEach(area => {
            const requiredPermission = area.dataset.permissionRequired;
            if(permissions.has(requiredPermission)) area.classList.add('accessible');
            else area.classList.remove('accessible');
        });
    }

    function logActivity(message, status = 'info') {
        const li = document.createElement('li');
        li.className = `log-entry ${status}`;
        const timestamp = new Date().toLocaleTimeString();
        li.innerHTML = `<span class="timestamp">[${timestamp}]</span> ${message}`;
        activityLog.prepend(li);
    }
    
    // --- Event Handlers ---
    rolesList.addEventListener('click', (e) => {
        const roleItem = e.target.closest('.role-item');
        if (e.target.classList.contains('delete-role-btn')) {
            const roleName = roleItem.dataset.roleName;
            delete state.roles[roleName];
            if(state.selectedRoleForEditing === roleName) state.selectedRoleForEditing = 'Admin';
            if(state.currentLoginRole === roleName) state.currentLoginRole = 'Admin';
        } else if (roleItem) {
            state.selectedRoleForEditing = roleItem.dataset.roleName;
        }
        saveState();
        renderAll();
    });

    addRoleForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const roleName = newRoleNameInput.value.trim();
        if (roleName && !state.roles[roleName]) {
            state.roles[roleName] = { permissions: ['VIEW_FILES'] };
            newRoleNameInput.value = '';
            saveState(); renderAll();
        }
    });
    
    permissionsList.addEventListener('change', (e) => {
        const permission = e.target.dataset.permission;
        const role = state.roles[state.selectedRoleForEditing];
        if (e.target.checked) !role.permissions.includes(permission) && role.permissions.push(permission);
        else role.permissions = role.permissions.filter(p => p !== permission);
        saveState(); updateSimulationView();
        logActivity(`Permissions updated for role: ${state.selectedRoleForEditing}`);
    });
    
    userSelect.addEventListener('change', (e) => {
        state.currentLoginRole = e.target.value;
        saveState(); updateSimulationView();
        logActivity(`Simulating as role: ${state.currentLoginRole}`, 'info');
    });

    addFileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const permissions = getRolePermissions(state.currentLoginRole);
        if(!permissions.has('CREATE_FILES')) {
            logActivity(`ACCESS DENIED: Role "${state.currentLoginRole}" cannot create files.`, 'denied');
            return;
        }
        const fileName = newFileNameInput.value.trim();
        if(fileName) {
            const newFile = { id: state.nextFileId++, name: fileName, location: 'unsecured-files', icon: '📄' };
            state.files.push(newFile);
            newFileNameInput.value = '';
            saveState(); renderFiles();
            logActivity(`File "${fileName}" created by role ${state.currentLoginRole}.`, 'success');
        }
    });

    simulationPanel.addEventListener('click', (e) => {
        if(e.target.classList.contains('delete-file-btn')) {
            const permissions = getRolePermissions(state.currentLoginRole);
            if(!permissions.has('DELETE_FILES')) {
                logActivity(`ACCESS DENIED: Role "${state.currentLoginRole}" cannot delete files.`, 'denied');
                return;
            }
            const fileEl = e.target.closest('.file');
            const fileId = parseInt(fileEl.dataset.fileId);
            const file = state.files.find(f => f.id === fileId);
            state.files = state.files.filter(f => f.id !== fileId);
            saveState(); renderFiles();
            logActivity(`File "${file.name}" deleted by role ${state.currentLoginRole}.`, 'success');
        }
    });

    // Drag and Drop
    let draggedFileId = null;
    document.addEventListener('dragstart', (e) => { if (e.target.classList.contains('file')) { draggedFileId = e.target.dataset.fileId; e.target.classList.add('dragging'); } });
    document.addEventListener('dragend', (e) => { if (e.target.classList.contains('file')) e.target.classList.remove('dragging'); });
    document.querySelectorAll('.file-area').forEach(area => {
        area.addEventListener('dragover', e => { e.preventDefault(); if(area.classList.contains('accessible')) area.classList.add('drag-over'); });
        area.addEventListener('dragleave', () => area.classList.remove('drag-over'));
        area.addEventListener('drop', e => {
            e.preventDefault();
            area.classList.remove('drag-over');
            const permissions = getRolePermissions(state.currentLoginRole);
            const requiredPermission = area.dataset.permissionRequired;

            if(permissions.has(requiredPermission)) {
                const file = state.files.find(f => f.id == draggedFileId);
                file.location = area.id;
                logActivity(`File "${file.name}" moved to ${area.querySelector('.area-title').textContent} by ${state.currentLoginRole}.`, 'success');
                saveState(); renderFiles();
            } else {
                area.classList.add('denied-flash');
                setTimeout(() => area.classList.remove('denied-flash'), 500);
                logActivity(`ACCESS DENIED: Role "${state.currentLoginRole}" to ${area.querySelector('.area-title').textContent}.`, 'denied');
            }
        });
    });

    // --- Initial Load ---
    loadState();
    renderAll();
    logActivity("System Initialized. Select a role to begin simulation.");
});