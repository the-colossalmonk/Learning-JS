// --- linter-worker.js ---

// Import external scripts into the worker's scope
importScripts("https://unpkg.com/acorn@8.10.0/dist/acorn.js");

// A simple AST traversal utility (recursive "walk")
function walk(node, visitors) {
    if (!node) return;
    if (visitors[node.type]) {
        visitors[node.type](node);
    }
    for (const key in node) {
        if (Object.prototype.hasOwnProperty.call(node, key)) {
            const child = node[key];
            if (Array.isArray(child)) {
                child.forEach(c => { if(c && c.type) walk(c, visitors) });
            } else if (typeof child === 'object' && child !== null && child.type) {
                walk(child, visitors);
            }
        }
    }
}

function runLinter(code, availableRules, activeRuleIds) {
    const errors = [];
    let ast;
    let tokens = [];

    try {
        ast = acorn.parse(code, { ecmaVersion: 2022, locations: true, ranges: true, onToken: tokens });
    } catch (e) {
        errors.push({ message: `Syntax Error: ${e.message}`, line: e.loc.line, column: e.loc.column, fixable: false });
        return { errors, ast: null };
    }
    
    let currentRuleId = null;
    const context = {
        getSourceCode: () => ({
            getText: (node) => code.substring(node.start, node.end),
            getTokenAfter: (node, operator) => {
                const nodeEnd = node.range[1];
                return tokens.find(t => t.start >= nodeEnd && t.value === operator);
            }
        }),
        report: ({ node, message, fix }) => {
            const fixFnString = fix ? fix.toString() : null;
            errors.push({
                ruleId: currentRuleId,
                message,
                line: node.loc.start.line,
                column: node.loc.start.column,
                fixFnString,
                node,
                fixable: !!fix
            });
        }
    };
    
    const visitors = {};
    activeRuleIds.forEach(ruleId => {
        currentRuleId = ruleId;
        const rule = availableRules[ruleId];
        if (rule) {
            const create = eval(`(${rule.createFnString})`);
            const ruleVisitors = create(context);
            for (const nodeType in ruleVisitors) {
                if (!visitors[nodeType]) visitors[nodeType] = [];
                visitors[nodeType].push(ruleVisitors[nodeType]);
            }
        }
    });

    const combinedVisitors = {};
    for(const nodeType in visitors) {
        combinedVisitors[nodeType] = (node) => visitors[nodeType].forEach(visitor => visitor(node));
    }
    
    walk(ast, combinedVisitors);
    
    return { errors, ast };
}

self.onmessage = function(e) {
    const { code, availableRules, activeRuleIds } = e.data;
    const result = runLinter(code, availableRules, activeRuleIds);
    self.postMessage(result);
}