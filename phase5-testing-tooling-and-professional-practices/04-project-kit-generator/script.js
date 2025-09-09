document.addEventListener('DOMContentLoaded', () => {

    // --- DOM Elements ---
    const generatorForm = document.getElementById('generator-form');
    const projectNameInput = document.getElementById('project-name');
    const filePreviewContainer = document.getElementById('file-preview-container');
    const shareBtn = document.getElementById('share-btn');
    const presetsGroup = document.querySelector('.presets-group');
    const installModal = document.getElementById('install-modal');
    const terminalOutput = document.getElementById('terminal-output');
    const downloadBtn = document.getElementById('download-btn');
    const languageFieldset = document.getElementById('language-fieldset');
    const featuresFieldset = document.getElementById('features-fieldset');

    // --- State ---
    let currentZipBlob = null;

    // --- File Templates ---
    const templates = {
        gitignore: `# Dependencies\n/node_modules\n\n# Build artifacts\n/dist\n.DS_Store\n\n# Environment variables\n.env\n.env.local`,
        prettierrc: JSON.stringify({ semi: true, singleQuote: true, trailingComma: "es5", tabWidth: 2, printWidth: 80 }, null, 2),
        
        // Vanilla JS
        vanillaHtml: (title) => `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>${title}</title>\n  <link rel="stylesheet" href="css/style.css">\n</head>\n<body>\n  <h1>Hello, ${title}!</h1>\n  <script src="js/main.js"></script>\n</body>\n</html>`,
        vanillaJs: `console.log('Hello, world!');`,
        vanillaCss: `body {\n  font-family: sans-serif;\n  background-color: #f0f0f0;\n  padding: 2rem;\n}`,
        vanillaResetCss: `*,*::before,*::after{box-sizing:border-box}body,h1,h2,h3,h4,p,figure,blockquote,dl,dd{margin:0}ul[role="list"],ol[role="list"]{list-style:none}html:focus-within{scroll-behavior:smooth}body{min-height:100vh;text-rendering:optimizeSpeed;line-height:1.5}a:not([class]){text-decoration-skip-ink:auto}img,picture{max-width:100%;display:block}input,button,textarea,select{font:inherit}@media(prefers-reduced-motion:reduce){html:focus-within{scroll-behavior:auto}*,*::before,*::after{animation-duration:.01ms !important;animation-iteration-count:1 !important;transition-duration:.01ms !important;scroll-behavior:auto !important}}`,

        // React
        reactViteConfig: `import { defineConfig } from 'vite'\nimport react from '@vitejs/plugin-react'\n\n// https://vitejs.dev/config/\nexport default defineConfig({\n  plugins: [react()],\n})`,
        reactHtml: (title) => `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>${title}</title>\n</head>\n<body>\n  <div id="root"></div>\n  <script type="module" src="/src/main.jsx"></script>\n</body>\n</html>`,
        reactJsx: `import React from 'react';\nimport ReactDOM from 'react-dom/client';\nimport App from './App.jsx';\nimport './index.css';\n\nReactDOM.createRoot(document.getElementById('root')).render(\n  <React.StrictMode>\n    <App />\n  </React.StrictMode>,\n)`,
        reactTsx: `import React from 'react';\nimport ReactDOM from 'react-dom/client';\nimport App from './App.tsx';\nimport './index.css';\n\nReactDOM.createRoot(document.getElementById('root')!).render(\n  <React.StrictMode>\n    <App />\n  </React.StrictMode>,\n)`,
        reactAppJsx: `import './App.css';\n\nfunction App() {\n  return (\n    <div className="App">\n      <h1>Hello, React!</h1>\n    </div>\n  );\n}\n\nexport default App;`,
        reactAppTsx: `import './App.css';\n\nfunction App(): JSX.Element {\n  return (\n    <div className="App">\n      <h1>Hello, React!</h1>\n    </div>\n  );\n}\n\nexport default App;`,
        reactAppCss: `.App { text-align: center; margin-top: 4rem; }`,
        
        // Three.js
        threeHtml: (title) => `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>${title}</title>\n  <link rel="stylesheet" href="style.css">\n</head>\n<body>\n  <script type="module" src="main.js"></script>\n</body>\n</html>`,
        threeJs: `import * as THREE from 'three';\n\n// Scene, Camera, Renderer\nconst scene = new THREE.Scene();\nconst camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);\nconst renderer = new THREE.WebGLRenderer();\nrenderer.setSize(window.innerWidth, window.innerHeight);\ndocument.body.appendChild(renderer.domElement);\n\n// Cube\nconst geometry = new THREE.BoxGeometry(1, 1, 1);\nconst material = new THREE.MeshNormalMaterial();\nconst cube = new THREE.Mesh(geometry, material);\nscene.add(cube);\n\ncamera.position.z = 5;\n\nfunction animate() {\n\trequestAnimationFrame(animate);\n\tcube.rotation.x += 0.01;\n\tcube.rotation.y += 0.01;\n\trenderer.render(scene, camera);\n}\n\nanimate();`,
        threeCss: `body { margin: 0; }\ncanvas { display: block; }`,

        // Configs
        tailwindConfig: `/** @type {import('tailwindcss').Config} */\nexport default {\n  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],\n  theme: {\n    extend: {},\n  },\n  plugins: [],\n}`,
        postcssConfig: `export default {\n  plugins: {\n    tailwindcss: {},\n    autoprefixer: {},\n  },\n}`,
        tailwindCss: `@tailwind base;\n@tailwind components;\n@tailwind utilities;`,
        tsconfig: JSON.stringify({ compilerOptions: { target: "ES2020", useDefineForClassFields: true, lib: ["ES2020", "DOM", "DOM.Iterable"], module: "ESNext", skipLibCheck: true, moduleResolution: "bundler", allowImportingTsExtensions: true, resolveJsonModule: true, isolatedModules: true, noEmit: true, jsx: "react-jsx", strict: true, noUnusedLocals: true, noUnusedParameters: true, noFallthroughCasesInSwitch: true }, include: ["src"] }, null, 2),
    };

    const dependencies = {
        react: { "react": "^18.2.0", "react-dom": "^18.2.0" },
        reactDev: { "@types/react": "^18.2.15", "@types/react-dom": "^18.2.7", "@vitejs/plugin-react": "^4.0.3" },
        typescript: { "typescript": "^5.0.2" },
        vite: { "vite": "^4.4.5" },
        tailwind: { "tailwindcss": "^3.3.3", "postcss": "^8.4.29", "autoprefixer": "^10.4.15" },
        three: { "three": "^0.156.1" }
    };
    
    // --- Core Functions ---
    
    function getFormConfig() {
        const formData = new FormData(generatorForm);
        const features = formData.getAll('features');
        return {
            projectName: formData.get('projectName'),
            framework: formData.get('framework'),
            language: formData.get('language'),
            features: new Set(features),
        };
    }
    
    function getDependencies(config) {
        let deps = {}, devDeps = {};
        
        // Base dev dependency
        Object.assign(devDeps, dependencies.vite);
        
        if (config.framework === 'react') {
            Object.assign(deps, dependencies.react);
            Object.assign(devDeps, dependencies.reactDev);
        }
        if (config.framework === 'three') {
            Object.assign(deps, dependencies.three);
        }
        if (config.features.has('tailwind')) {
            Object.assign(devDeps, dependencies.tailwind);
        }
        if (config.language === 'ts') {
            Object.assign(devDeps, dependencies.typescript);
        }
        return { dependencies: deps, devDependencies: devDeps };
    }

    function generatePackageJson(config) {
        const { dependencies, devDependencies } = getDependencies(config);
        const packageJson = {
            name: config.projectName.toLowerCase().replace(/\s+/g, '-'),
            private: true, version: "0.0.0", type: "module",
            scripts: { dev: "vite", build: "vite build", preview: "vite preview" },
            dependencies, devDependencies,
        };
        return JSON.stringify(packageJson, null, 2);
    }
    
    async function generateZip(config) {
        const zip = new JSZip();
        
        if (config.features.has('gitignore')) zip.file('.gitignore', templates.gitignore);
        if (config.features.has('prettier')) zip.file('.prettierrc', templates.prettierrc);

        zip.file('package.json', generatePackageJson(config));

        if (config.framework === 'react') {
            const isTs = config.language === 'ts';
            const mainExt = isTs ? 'tsx' : 'jsx';
            const appExt = isTs ? 'tsx' : 'jsx';

            zip.file('index.html', templates.reactHtml(config.projectName));
            zip.file('vite.config.js', templates.reactViteConfig);
            const src = zip.folder('src');
            src.file(`main.${mainExt}`, isTs ? templates.reactTsx : templates.reactJsx);
            src.file(`App.${appExt}`, isTs ? templates.reactAppTsx : templates.reactAppJsx);
            src.file('App.css', templates.reactAppCss);
            src.file('index.css', config.features.has('tailwind') ? templates.tailwindCss : '');
            
            if (isTs) zip.file('tsconfig.json', templates.tsconfig);
            if (config.features.has('tailwind')) {
                zip.file('tailwind.config.js', templates.tailwindConfig);
                zip.file('postcss.config.js', templates.postcssConfig);
            }
        } else if (config.framework === 'three') {
            zip.file('index.html', templates.threeHtml(config.projectName));
            zip.file('main.js', templates.threeJs);
            zip.file('style.css', templates.threeCss);
        } else { // Vanilla
            zip.file('index.html', templates.vanillaHtml(config.projectName));
            zip.file('main.js', templates.vanillaJs);
            const cssFolder = zip.folder('css');
            cssFolder.file('style.css', templates.vanillaCss);
            if(config.features.has('css-reset')) cssFolder.file('reset.css', templates.vanillaResetCss);
        }
        
        const content = await zip.generateAsync({ type: 'blob' });
        return { name: `${config.projectName}.zip`, content };
    }
    
    function updateFilePreview() {
        const config = getFormConfig();
        let structure = '<ul>';
        const add = (name, depth = 0, isFolder = false) => `<li class="${isFolder ? 'tree-folder':'tree-item'}" style="padding-left: ${depth * 1.5}rem;">${name}</li>`;
        
        structure += add('package.json');
        if (config.features.has('gitignore')) structure += add('.gitignore');
        if (config.features.has('prettier')) structure += add('.prettierrc');
        
        if (config.framework === 'react') {
            const isTs = config.language === 'ts';
            structure += add('index.html');
            structure += add('vite.config.js');
            if (isTs) structure += add('tsconfig.json');
            if (config.features.has('tailwind')) {
                structure += add('tailwind.config.js');
                structure += add('postcss.config.js');
            }
            structure += add('src', 0, true);
            structure += add(`main.${isTs ? 'tsx' : 'jsx'}`, 1);
            structure += add(`App.${isTs ? 'tsx' : 'jsx'}`, 1);
            structure += add('App.css', 1);
            structure += add('index.css', 1);
        } else if (config.framework === 'three') {
            structure += add('index.html');
            structure += add('main.js');
            structure += add('style.css');
        } else {
            structure += add('index.html');
            structure += add('main.js');
            structure += add('css', 0, true);
            structure += add('style.css', 1);
            if (config.features.has('css-reset')) structure += add('reset.css', 1);
        }
        
        structure += '</ul>';
        filePreviewContainer.innerHTML = structure;
        
        // Conditional UI logic
        const isReact = config.framework === 'react';
        languageFieldset.style.display = isReact ? 'block' : 'none';
        featuresFieldset.style.display = isReact ? 'block' : 'none';
        if (config.framework === 'vanilla') {
             document.querySelector('label[for="features"][value="css-reset"]')?.parentElement.classList.remove('hidden');
        } else {
             document.querySelector('label[for="features"][value="css-reset"]')?.parentElement.classList.add('hidden');
        }
    }

    function downloadBlob(blob, name) {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    }
    
    function applyPreset(presetName) {
        const presets = {
            'react-ts-tailwind': { framework: 'react', language: 'ts', features: ['tailwind', 'prettier', 'gitignore'] },
            'vanilla': { framework: 'vanilla', language: 'js', features: ['prettier', 'gitignore'] },
            'three': { framework: 'three', language: 'js', features: ['gitignore'] }
        };
        const preset = presets[presetName];
        if(!preset) return;
        
        document.querySelector(`input[name="framework"][value="${preset.framework}"]`).checked = true;
        document.querySelector(`input[name="language"][value="${preset.language}"]`).checked = true;
        document.querySelectorAll('input[name="features"]').forEach(cb => {
            cb.checked = preset.features.includes(cb.value);
        });
        updateFilePreview();
    }
    
    async function simulateInstallation(config) {
        const { dependencies, devDependencies } = getDependencies(config);
        const allDeps = {...dependencies, ...devDependencies};
        const depCount = Object.keys(allDeps).length;
        
        terminalOutput.innerHTML = '';
        downloadBtn.classList.add('hidden');

        const log = (msg, className = '') => {
            const p = document.createElement('p');
            p.textContent = msg;
            if(className) p.className = className;
            terminalOutput.appendChild(p);
            terminalOutput.scrollTop = terminalOutput.scrollHeight;
        };

        log(`> npm install`, 'command');
        await new Promise(r => setTimeout(r, 500));
        
        for (const [name, version] of Object.entries(allDeps)) {
            log(`+ ${name}@${version}`);
            await new Promise(r => setTimeout(r, 50 + Math.random() * 50));
        }

        await new Promise(r => setTimeout(r, 500));
        log(`\nadded ${depCount} packages in ${(Math.random() * 3 + 2).toFixed(2)}s`, 'success');
        downloadBtn.classList.remove('hidden');
    }
    
    function updateFromUrlParams() {
        const params = new URLSearchParams(window.location.search);
        if (params.has('projectName')) projectNameInput.value = params.get('projectName');
        if (params.has('framework')) {
            document.querySelector(`input[name="framework"][value="${params.get('framework')}"]`).checked = true;
        }
        if (params.has('language')) {
            document.querySelector(`input[name="language"][value="${params.get('language')}"]`).checked = true;
        }
        const features = params.getAll('features');
        if (features.length > 0) {
            document.querySelectorAll('input[name="features"]').forEach(checkbox => {
                checkbox.checked = features.includes(checkbox.value);
            });
        }
    }

    // --- Event Handlers ---
    generatorForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        installModal.classList.remove('hidden');
        const config = getFormConfig();
        const { content } = await generateZip(config);
        currentZipBlob = content;
        await simulateInstallation(config);
    });

    shareBtn.addEventListener('click', () => {
        const config = getFormConfig();
        const params = new URLSearchParams({
            projectName: config.projectName,
            framework: config.framework,
        });
        if(config.framework === 'react') params.set('language', config.language);
        config.features.forEach(feature => params.append('features', feature));
        
        const shareUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
        navigator.clipboard.writeText(shareUrl).then(() => {
            shareBtn.textContent = 'Link Copied!';
            setTimeout(() => shareBtn.textContent = 'Copy Share Link', 2000);
        });
    });

    generatorForm.addEventListener('change', updateFilePreview);
    presetsGroup.addEventListener('click', (e) => {
        if(e.target.classList.contains('preset-btn')) {
            applyPreset(e.target.dataset.preset);
        }
    });
    downloadBtn.addEventListener('click', () => {
        const config = getFormConfig();
        if(currentZipBlob) {
            downloadBlob(currentZipBlob, `${config.projectName}.zip`);
        }
        installModal.classList.add('hidden');
    });

    // --- Initial Load ---
    updateFromUrlParams();
    updateFilePreview();
});