document.addEventListener('DOMContentLoaded', () => {

    // --- DATA ---
    const regexPresets = [
        { name: "Email Address", pattern: `^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$`, explanation: "Checks for a standard email format. It looks for characters, an '@' symbol, a domain, a dot, and a top-level domain." },
        { name: "URL (http/https)", pattern: `https?://(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)`, explanation: "Matches standard web URLs. It looks for 'http://' or 'https://', an optional 'www.', a domain name, and an optional path." },
        { name: "IPv4 Address", pattern: `^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$`, explanation: "Validates a 4-part IP address where each part is a number from 0 to 255." },
        { name: "Date (YYYY-MM-DD)", pattern: `^\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$`, explanation: "Matches a date in YYYY-MM-DD format, with basic validation for month and day values." },
        { name: "Time (HH:MM 24hr)", pattern: `^([01]?[0-9]|2[0-3]):[0-5][0-9]$`, explanation: "Matches time in a 24-hour format from 00:00 to 23:59." },
        { name: "Hex Color Code", pattern: `^#?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$`, explanation: "Finds CSS hex color codes, either 3 or 6 digits long, with an optional '#' prefix." },
        { name: "Username (alphanum, 3-16 chars)", pattern: `^[a-zA-Z0-9_]{3,16}$`, explanation: "A common username format: must be 3-16 characters long and can only contain letters, numbers, and underscores." },
        { name: "Password (strong)", pattern: `^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z\\d]{8,}$`, explanation: "Enforces a strong password: at least 8 characters, one uppercase letter, one lowercase letter, and one number." },
        { name: "Find Markdown Links", pattern: `\\[([^\\]]+)\\]\\(([^\\)]+)\\)`, explanation: "Extracts the text (Group 1) and URL (Group 2) from a Markdown-style link." },
        { name: "Custom", pattern: "", explanation: "Select this option to write your own custom regular expression in the input box below." }
    ];

    const cheatSheetData = {
        "Character Classes": [ { token: ".", desc: "Any character (except newline)" }, { token: "\\d", desc: "Any digit (0-9)" }, { token: "\\D", desc: "Any non-digit" }, { token: "\\w", desc: "Word character (a-z, A-Z, 0-9, _)" }, { token: "\\W", desc: "Non-word character" }, { token: "\\s", desc: "Whitespace character" }, { token: "\\S", desc: "Non-whitespace character" }, ],
        "Anchors": [ { token: "^", desc: "Start of string" }, { token: "$", desc: "End of string" }, { token: "\\b", desc: "Word boundary" }, { token: "\\B", desc: "Non-word boundary" }, ],
        "Quantifiers": [ { token: "*", desc: "0 or more" }, { token: "+", desc: "1 or more" }, { token: "?", desc: "0 or 1 (optional)" }, { token: "{n}", desc: "Exactly n times" }, { token: "{n,}", desc: "n or more times" }, { token: "{n,m}", desc: "Between n and m times" }, { token: "*?", desc: "Lazy match" } ],
        "Groups & Ranges": [ { token: "(...)", desc: "Capture group" }, { token: "(?:...)", desc: "Non-capture group" }, { token: "[abc]", desc: "Match a, b, or c" }, { token: "[^abc]", desc: "Match any character except a, b, or c" }, { token: "[a-z]", desc: "Any character from a to z" }, ],
        "Lookarounds": [ { token: "(?=...)", desc: "Positive lookahead" }, { token: "(?!...)", desc: "Negative lookahead" } ],
        "Special Characters": [ { token: "\\", desc: "Escape character" }, { token: "|", desc: "Alternation (OR)" } ],
    };

    // --- DOM Elements ---
    const presetsSelect = document.getElementById('regex-presets');
    const customRegexContainer = document.getElementById('custom-regex-container');
    const customRegexInput = document.getElementById('custom-regex-input');
    const flagsInput = document.getElementById('regex-flags-input');
    const testStringInput = document.getElementById('test-string-input');
    const highlightedOutput = document.getElementById('highlighted-output');
    const regexError = document.getElementById('regex-error');
    const matchInfoContainer = document.getElementById('match-info-container');
    const cheatsheetTrigger = document.getElementById('cheatsheet-trigger');
    const cheatsheetPanel = document.getElementById('cheatsheet-panel');
    const cheatsheetContent = document.getElementById('cheatsheet-content');
    const presetInfoIcon = document.getElementById('preset-info-icon');
    const presetTooltip = document.getElementById('preset-tooltip');


    // --- Initialization ---
    function populatePresets() {
        regexPresets.forEach(preset => {
            const option = document.createElement('option');
            option.value = preset.pattern;
            option.textContent = preset.name;
            presetsSelect.appendChild(option);
        });
    }

    function populateCheatSheet() {
        for (const category in cheatSheetData) {
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'cheatsheet-category';
            const title = document.createElement('h3');
            title.textContent = category;
            categoryDiv.appendChild(title);
            const list = document.createElement('ul');
            list.className = 'cheatsheet-list';
            cheatSheetData[category].forEach(item => {
                const listItem = document.createElement('li');
                listItem.className = 'cheatsheet-item';
                listItem.innerHTML = `<span class="cheatsheet-token">${item.token}</span><span class="cheatsheet-desc">${item.desc}</span>`;
                list.appendChild(listItem);
            });
            categoryDiv.appendChild(list);
            cheatsheetContent.appendChild(categoryDiv);
        }
    }

    // --- Core Logic ---
    function runRegexTest() {
        let pattern = presetsSelect.value;
        if (presetsSelect.options[presetsSelect.selectedIndex].text === 'Custom') {
            pattern = customRegexInput.value;
        }
        
        const flags = flagsInput.value;
        const testString = testStringInput.value;
        
        regexError.textContent = '';
        highlightedOutput.innerHTML = '';
        matchInfoContainer.innerHTML = '<p class="no-matches">No matches found.</p>';

        if (!pattern) return;

        try {
            const regex = new RegExp(pattern, flags);
            highlightedOutput.innerHTML = testString.replace(/</g, "<").replace(/>/g, ">").replace(regex, match => `<span class="highlight">${match}</span>`);

            const matches = [];
            let match;
            const execRegex = new RegExp(pattern, flags);
            while ((match = execRegex.exec(testString)) !== null) {
                matches.push(match);
                if (execRegex.lastIndex === match.index) execRegex.lastIndex++;
            }

            if (matches.length > 0) {
                matchInfoContainer.innerHTML = '';
                matches.forEach((m, index) => {
                    let groupsHTML = '';
                    if (m.length > 1) {
                        const groups = m.slice(1).map((group, groupIndex) => {
                            if (group !== undefined) {
                                return `<div>Group ${groupIndex + 1}: <span class="group-text">"${group}"</span></div>`;
                            }
                            return null;
                        }).filter(g => g !== null);
                        if (groups.length > 0) {
                            groupsHTML = `<div class="match-groups">${groups.join('')}</div>`;
                        }
                    }
                    const matchItem = document.createElement('div');
                    matchItem.className = 'match-item';
                    matchItem.innerHTML = `<div class="match-header">Match ${index + 1} @ index ${m.index}: "${m[0]}"</div>${groupsHTML}`;
                    matchInfoContainer.appendChild(matchItem);
                });
            }
        } catch (e) {
            regexError.textContent = e.message;
        }
    }

    // --- Event Handlers ---
    function handlePresetChange() {
        const selectedIndex = presetsSelect.selectedIndex;
        const selectedOption = presetsSelect.options[selectedIndex];
        const presetData = regexPresets[selectedIndex];

        if (selectedOption.text === 'Custom') {
            customRegexContainer.classList.remove('hidden');
            customRegexInput.focus();
        } else {
            customRegexContainer.classList.add('hidden');
        }
        
        presetTooltip.textContent = presetData.explanation;
        runRegexTest();
    }
    
    function handleCheatSheetClick(e) {
        if (e.target.classList.contains('cheatsheet-token')) {
            const token = e.target.textContent;
            presetsSelect.value = "";
            handlePresetChange();
            customRegexInput.value += token;
            customRegexInput.focus();
            runRegexTest();
        }
    }

    // --- Event Listeners Setup ---
    [customRegexInput, flagsInput, testStringInput].forEach(el => el.addEventListener('input', runRegexTest));
    testStringInput.addEventListener('scroll', () => highlightedOutput.scrollTop = testStringInput.scrollTop);
    presetsSelect.addEventListener('change', handlePresetChange);
    cheatsheetTrigger.addEventListener('mouseenter', () => cheatsheetPanel.classList.add('visible'));
    cheatsheetPanel.addEventListener('mouseleave', () => cheatsheetPanel.classList.remove('visible'));
    presetInfoIcon.addEventListener('mouseenter', () => presetTooltip.classList.add('visible'));
    presetInfoIcon.addEventListener('mouseleave', () => presetTooltip.classList.remove('visible'));

    // --- Initial Call ---
    populatePresets();
    populateCheatSheet();
    handlePresetChange();
    runRegexTest();
});