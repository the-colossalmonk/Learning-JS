document.addEventListener('DOMContentLoaded', () => {

    // --- DATA ---
    const skillsData = [
        { name: 'JavaScript (ES6+)', level: 95 }, { name: 'HTML5 & CSS3', level: 90 },
        { name: 'React', level: 85 }, { name: 'Node.js', level: 75 },
        { name: 'UI/UX Design', level: 80 }, { name: 'Problem Solving', level: 90 },
    ];
    const projectsData = [
        { title: 'Interactive Canvas', description: 'A FigJam-like tool for collaborative brainstorming.', tags: ['JS', 'CSS', 'HTML'], link: '#' },
        { title: 'Live Tweet Wall', description: 'Simulates a live feed of tweets with dynamic animations.', tags: ['JS', 'CSS'], link: '#' },
        { title: 'Habit Tracker', description: 'A daily habit tracker with a calendar view and streak calculation.', tags: ['JS', 'HTML'], link: '#' },
        { title: 'Regex Tester', description: 'A real-time tool for testing and debugging regular expressions.', tags: ['JS'], link: '#' },
        { title: 'E-commerce Platform', description: 'Full-stack online store built with the MERN stack.', tags: ['React', 'Node.js'], link: '#' },
        { title: 'Portfolio Website', description: 'A personal portfolio showcasing web development projects.', tags: ['React', 'CSS'], link: '#' }
    ];
    const experienceData = [
        { company: 'Tech Solutions Inc.', role: 'Senior Frontend Developer', dates: '2020 - Present', details: ['Led the development of a new client-facing dashboard using React, resulting in a 20% increase in user engagement.', 'Mentored junior developers and conducted code reviews to maintain high code quality.', 'Collaborated with the design team to implement pixel-perfect, responsive UIs.'] },
        { company: 'Web Innovators LLC', role: 'Frontend Developer', dates: '2018 - 2020', details: ['Developed and maintained client websites using JavaScript, HTML, and CSS.', 'Improved website performance by 30% through code optimization and asset bundling.', 'Worked in an Agile environment to deliver features on a bi-weekly schedule.'] }
    ];

    // --- DOM Elements ---
    const skillsGrid = document.querySelector('.skills-grid');
    const projectGrid = document.getElementById('project-grid');
    const projectFilters = document.getElementById('project-filters');
    const experienceList = document.getElementById('experience-list');
    const terminalOutput = document.getElementById('terminal-output');
    const terminalInput = document.getElementById('terminal-input');
    const themeToggle = document.getElementById('theme-toggle');

    // --- RENDER FUNCTIONS ---
    function renderSkills() {
        skillsGrid.innerHTML = skillsData.map(skill => `
            <div class="skill">
                <div class="skill-name"><span>${skill.name}</span><span>${skill.level}%</span></div>
                <div class="skill-bar"><div class="skill-level" data-level="${skill.level}"></div></div>
            </div>
        `).join('');
    }

    function renderProjects(filter = 'All') {
        const filteredProjects = filter === 'All' ? projectsData : projectsData.filter(p => p.tags.includes(filter));
        projectGrid.innerHTML = filteredProjects.map(project => `
            <div class="project-card" data-tags="${project.tags.join(',')}">
                <h3>${project.title}</h3>
                <p>${project.description}</p>
                <div class="project-tags">${project.tags.map(tag => `<span class="project-tag">${tag}</span>`).join('')}</div>
                <a href="${project.link}" target="_blank" class="project-link">View Project →</a>
            </div>
        `).join('');
    }

    function renderProjectFilters() {
        const allTags = new Set(projectsData.flatMap(p => p.tags));
        const filters = ['All', ...allTags];
        projectFilters.innerHTML = filters.map(tag => `<button class="filter-btn ${tag === 'All' ? 'active' : ''}" data-filter="${tag}">${tag}</button>`).join('');
    }

    function renderExperience() {
        experienceList.innerHTML = experienceData.map(job => `
            <div class="experience-item">
                <div class="experience-header">
                    <div>
                        <h3>${job.company}</h3>
                        <span class="role">${job.role}</span>
                    </div>
                    <span>${job.dates}</span>
                </div>
                <div class="experience-details">
                    <ul>${job.details.map(d => `<li>${d}</li>`).join('')}</ul>
                </div>
            </div>
        `).join('');
    }
    
    // --- EVENT HANDLERS & LOGIC ---

    // Project Filtering
    projectFilters.addEventListener('click', (e) => {
        if (e.target.classList.contains('filter-btn')) {
            document.querySelector('.filter-btn.active').classList.remove('active');
            e.target.classList.add('active');
            renderProjects(e.target.dataset.filter);
        }
    });

    // Experience Accordion
    experienceList.addEventListener('click', (e) => {
        const item = e.target.closest('.experience-item');
        if (item) {
            item.classList.toggle('expanded');
        }
    });

    // Theme Switcher
    themeToggle.addEventListener('change', () => {
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
    });
    
    function loadTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-mode');
            themeToggle.checked = true;
        }
    }
    
    // Skill Bar Animation on Scroll
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const skillLevel = entry.target;
                skillLevel.style.width = `${skillLevel.dataset.level}%`;
                observer.unobserve(skillLevel); // Animate only once
            }
        });
    }, { threshold: 0.5 });
    
    function observeSkillBars() {
        document.querySelectorAll('.skill-level').forEach(bar => {
            observer.observe(bar);
        });
    }

    // Terminal Logic
    terminalInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const command = terminalInput.value.trim();
            handleCommand(command);
            terminalInput.value = '';
        }
    });
    
    function handleCommand(command) {
        const output = document.createElement('div');
        output.innerHTML = `<div class="command-line"><span class="prompt">></span> <span class="command">${command}</span></div>`;
        
        const response = document.createElement('div');
        response.className = 'response-line';

        switch(command.toLowerCase()) {
            case 'help':
                response.textContent = `Available commands:\n- about\n- skills --all\n- contact\n- projects\n- clear`;
                break;
            case 'about':
                response.textContent = 'Jane Doe is a creative frontend developer with a passion for building beautiful and functional web applications. With 5+ years of experience, she excels at turning complex problems into elegant, user-friendly solutions.';
                break;
            case 'skills --all':
                response.textContent = skillsData.map(s => `${s.name} (${s.level}%)`).join('\n');
                break;
            case 'contact':
                response.innerHTML = `You can reach me at:\nEmail: <a href="mailto:jane.doe@example.com">jane.doe@example.com</a>\nLinkedIn: <a href="#" target="_blank">linkedin.com/in/janedoe</a>`;
                break;
            case 'projects':
                response.textContent = projectsData.map(p => `- ${p.title}: ${p.description}`).join('\n');
                break;
            case 'clear':
                terminalOutput.innerHTML = '';
                return; // Don't append anything
            default:
                response.textContent = `Command not found: ${command}. Type 'help' for a list of commands.`;
        }
        output.appendChild(response);
        terminalOutput.appendChild(output);
        terminalOutput.scrollTop = terminalOutput.scrollHeight;
    }

    // --- INITIALIZATION ---
    function init() {
        loadTheme();
        renderSkills();
        renderProjects();
        renderProjectFilters();
        renderExperience();
        observeSkillBars();
        handleCommand('help'); // Initial help command
    }
    
    init();
});