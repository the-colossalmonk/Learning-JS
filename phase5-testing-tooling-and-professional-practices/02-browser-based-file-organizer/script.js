document.addEventListener('DOMContentLoaded', () => {

    // --- DOM Elements ---
    const step1 = document.getElementById('step-1');
    const step2 = document.getElementById('step-2');
    const selectFolderBtn = document.getElementById('select-folder-btn');
    const changeFolderBtn = document.getElementById('change-folder-btn');
    const settingsBtn = document.getElementById('settings-btn');
    const dropZone = document.getElementById('drop-zone');
    const folderNameEl = document.getElementById('folder-name');
    const fileGridContainer = document.getElementById('file-grid-container');
    const planListEl = document.getElementById('plan-list');
    const organizeBtn = document.getElementById('organize-btn');
    const undoBtn = document.getElementById('undo-btn');
    const logListEl = document.getElementById('log-list');
    const recursiveToggle = document.getElementById('recursive-toggle');
    const fileCardTemplate = document.getElementById('file-card-template');
    const planView = document.getElementById('plan-view');
    const previewView = document.getElementById('preview-view');
    const filePreviewContent = document.getElementById('file-preview-content');
    const settingsModal = document.getElementById('settings-modal');
    const settingsCloseBtn = document.getElementById('settings-close-btn');
    const rulesContainer = document.getElementById('rules-container');
    const addRuleForm = document.getElementById('add-rule-form');
    const conflictModal = document.getElementById('conflict-modal');
    
    // --- State ---
    let rootDirectoryHandle = null;
    let organizationPlan = [];
    let undoHistory = [];
    let organizationRules = {};
    let fileHandlesCache = [];

    const defaultRules = {
        '.jpg, .jpeg, .png, .gif, .webp': 'Images',
        '.pdf, .docx, .txt, .md': 'Documents',
        '.zip, .rar, .7z': 'Archives',
        '.mp4, .mov, .avi, .mkv': 'Videos',
        '.mp3, .wav, .flac': 'Audio',
    };
    
    // --- Core Functions ---
    function loadRules() {
        const savedRules = localStorage.getItem('organizerRules');
        organizationRules = savedRules ? JSON.parse(savedRules) : defaultRules;
    }
    
    function saveRules() {
        localStorage.setItem('organizerRules', JSON.stringify(organizationRules));
    }

    async function selectFolder(handle) {
        if (!handle) return;
        rootDirectoryHandle = handle;
        step1.classList.add('hidden');
        step2.classList.remove('hidden');
        folderNameEl.textContent = rootDirectoryHandle.name;
        log('Folder selected.', 'info');
        await processFolder();
    }
    
    async function processFolder() {
        showPlanView();
        log('Scanning files...', 'info');
        fileGridContainer.innerHTML = '';
        planListEl.innerHTML = '';
        organizationPlan = [];
        undoHistory = [];
        fileHandlesCache = [];
        
        const files = await getFiles(rootDirectoryHandle);
        fileHandlesCache = files;
        
        renderFileCards(files);
        await generatePlan(files);
    }

    async function getFiles(dirHandle, currentPath = '') {
        let files = [];
        try {
            for await (const entry of dirHandle.values()) {
                const entryPath = currentPath ? `${currentPath}/${entry.name}` : entry.name;
                if (entry.kind === 'file') {
                    files.push({ handle: entry, path: entryPath, parentHandle: dirHandle });
                } else if (entry.kind === 'directory' && recursiveToggle.checked) {
                    files = files.concat(await getFiles(entry, entryPath));
                }
            }
        } catch (error) {
            log(`Could not read directory: ${currentPath || dirHandle.name}. Permission may have been revoked.`, 'error');
        }
        return files;
    }

    async function generatePlan(files) {
        organizationPlan = [];
        for (const file of files) {
            const extension = `.${file.handle.name.split('.').pop()?.toLowerCase()}`;
            const destinationFolder = Object.keys(organizationRules).find(key => 
                key.split(', ').map(s => s.trim()).includes(extension)
            ) ? organizationRules[Object.keys(organizationRules).find(key => key.split(', ').map(s => s.trim()).includes(extension))] : null;

            if (destinationFolder) {
                organizationPlan.push({ file, destinationFolder });
            }
        }
        planListEl.innerHTML = organizationPlan.map(p => `<li>Move <code>${p.file.handle.name}</code> to <span class="folder">${p.destinationFolder}</span></li>`).join('');
        log(`Plan generated. ${organizationPlan.length} file(s) to be moved.`, 'info');
        organizeBtn.disabled = organizationPlan.length === 0;
    }

    async function executePlan() {
        organizeBtn.disabled = true;
        let currentUndoBatch = [];

        for (const action of organizationPlan) {
            try {
                const { file, destinationFolder } = action;
                const destDirHandle = await rootDirectoryHandle.getDirectoryHandle(destinationFolder, { create: true });
                
                let newFileName = file.handle.name;
                let conflictResolved = false;
                while (!conflictResolved) {
                    try {
                        await destDirHandle.getFileHandle(newFileName);
                        const resolution = await promptForConflict(newFileName);
                        if (resolution === 'skip') {
                            log(`Skipped moving ${file.handle.name}.`, 'info');
                            newFileName = null; break;
                        } else if (resolution === 'overwrite') {
                             break;
                        } else if (resolution === 'rename') {
                            const nameParts = newFileName.split('.');
                            const ext = nameParts.pop();
                            newFileName = `${nameParts.join('.')}(1).${ext}`;
                        }
                    } catch (e) {
                        conflictResolved = true;
                    }
                }

                if (newFileName) {
                    await file.handle.move(destDirHandle, newFileName);
                    currentUndoBatch.push({ newFileName, sourceDirHandle: file.parentHandle, destDirHandle });
                    log(`Moved ${file.handle.name} to ${destinationFolder}`, 'success');
                }
            } catch (error) {
                log(`Failed to move a file: ${error.message}`, 'error');
            }
        }

        if (currentUndoBatch.length > 0) {
            undoHistory.push(currentUndoBatch);
            undoBtn.disabled = false;
        }
        log('Organization complete.', 'success');
        await processFolder();
    }
    
    async function undoLastAction() {
        if (undoHistory.length === 0) return;
        undoBtn.disabled = true;
        const lastBatch = undoHistory.pop();
        log('Undoing last action...', 'info');
        for (const action of lastBatch.reverse()) { // Reverse to avoid potential move conflicts
            try {
                const fileHandle = await action.destDirHandle.getFileHandle(action.newFileName);
                await fileHandle.move(action.sourceDirHandle);
                log(`Moved ${action.newFileName} back.`, 'success');
            } catch (error) {
                log(`Failed to undo move: ${error.message}`, 'error');
            }
        }
        log('Undo complete.', 'success');
        await processFolder();
    }
    
    // --- UI & Rendering ---
    function renderFileCards(files) {
        fileGridContainer.innerHTML = '';
        if (files.length === 0) {
            fileGridContainer.innerHTML = '<p class="empty-message">No files found.</p>';
            return;
        }
        files.forEach((file, index) => {
            const card = fileCardTemplate.content.cloneNode(true).firstElementChild;
            card.dataset.fileIndex = index;
            card.querySelector('.file-name').textContent = file.handle.name;
            card.querySelector('.file-icon').textContent = getFileIcon(file.handle.name);
            file.handle.getFile().then(f => {
                card.querySelector('.file-size').textContent = formatBytes(f.size);
            });
            fileGridContainer.appendChild(card);
        });
    }

    function showPlanView() {
        planView.classList.remove('hidden');
        previewView.classList.add('hidden');
        document.querySelectorAll('.file-card.active').forEach(c => c.classList.remove('active'));
    }
    
    async function showPreview(fileIndex) {
        planView.classList.add('hidden');
        previewView.classList.remove('hidden');
        
        const fileData = fileHandlesCache[fileIndex];
        if (!fileData) return;

        const file = await fileData.handle.getFile();
        const type = file.type;
        
        filePreviewContent.innerHTML = '';
        
        if (type.startsWith('image/')) {
            const url = URL.createObjectURL(file);
            filePreviewContent.innerHTML = `<img src="${url}" alt="File preview" onload="URL.revokeObjectURL(this.src)">`;
        } else if (type.startsWith('text/')) {
            const text = await file.text();
            filePreviewContent.innerHTML = `<pre>${text.substring(0, 2000)}</pre>`;
        } else {
            filePreviewContent.innerHTML = `<div class="generic-preview"><div class="file-icon">${getFileIcon(file.name)}</div><p>No preview available for this file type.</p></div>`;
        }
    }
    
    // --- Event Handlers ---
    selectFolderBtn.addEventListener('click', async () => selectFolder(await window.showDirectoryPicker().catch(err=>log(err.message, 'error'))));
    changeFolderBtn.addEventListener('click', async () => selectFolder(await window.showDirectoryPicker().catch(err=>log(err.message, 'error'))));
    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('drag-over'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
    dropZone.addEventListener('drop', async (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        const handle = await e.dataTransfer.items[0].getAsFileSystemHandle();
        if (handle.kind === 'directory') selectFolder(handle);
    });
    
    recursiveToggle.addEventListener('change', processFolder);
    organizeBtn.addEventListener('click', executePlan);
    undoBtn.addEventListener('click', undoLastAction);
    
    fileGridContainer.addEventListener('click', (e) => {
        const card = e.target.closest('.file-card');
        if (card) {
            document.querySelectorAll('.file-card.active').forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            showPreview(card.dataset.fileIndex);
        }
    });
    
    settingsBtn.addEventListener('click', () => { renderRules(); settingsModal.classList.remove('hidden'); });
    settingsCloseBtn.addEventListener('click', () => settingsModal.classList.add('hidden'));
    addRuleForm.addEventListener('submit', (e) => { e.preventDefault(); const exts = document.getElementById('rule-extension').value.trim(); const folder = document.getElementById('rule-folder').value.trim(); if (exts && folder) { organizationRules[exts] = folder; saveRules(); renderRules(); addRuleForm.reset(); } });
    rulesContainer.addEventListener('click', (e) => { if (e.target.classList.contains('delete-rule-btn')) { const exts = e.target.dataset.exts; delete organizationRules[exts]; saveRules(); renderRules(); } });

    async function promptForConflict(fileName) {
        return new Promise(resolve => {
            document.getElementById('conflict-message').textContent = `A file named "${fileName}" already exists.`;
            conflictModal.classList.remove('hidden');
            const resolver = (e) => {
                if (e.target.dataset.resolution) {
                    conflictModal.removeEventListener('click', resolver);
                    conflictModal.classList.add('hidden');
                    resolve(e.target.dataset.resolution);
                }
            };
            conflictModal.addEventListener('click', resolver);
        });
    }

    function log(message, type = 'info') {
        const li = document.createElement('li');
        li.className = type;
        li.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
        logListEl.prepend(li);
    }

    // --- Utility Functions ---
    function formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }
    
    function getFileIcon(fileName) {
        const ext = `.${fileName.split('.').pop()?.toLowerCase()}`;
        const iconMap = {
            'image': '🖼️', 'document': '📄', 'archive': '📦', 'video': '🎬', 'audio': '🎵'
        };
        for(const ruleExts in organizationRules) {
            const folder = organizationRules[ruleExts].toLowerCase();
            if(ruleExts.split(', ').includes(ext)) {
                if(folder.includes('image')) return iconMap.image;
                if(folder.includes('document')) return iconMap.document;
                if(folder.includes('archive')) return iconMap.archive;
                if(folder.includes('video')) return iconMap.video;
                if(folder.includes('audio')) return iconMap.audio;
            }
        }
        return '❓';
    }
    
    // --- Initial Load ---
    loadRules();
});