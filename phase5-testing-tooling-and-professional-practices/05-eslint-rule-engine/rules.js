// --- rules.js ---

export const defaultRules = {
    'no-console-log': {
        meta: {
            description: 'Disallow the use of console.log.',
            fixable: false,
            good_code: `// Use a proper logging library or remove for production.\nlogger.info('User logged in');`,
            bad_code: `console.log('Some debug value');`
        },
        create: function(context) {
            return {
                CallExpression(node) {
                    const callee = node.callee;
                    if (callee.type === 'MemberExpression' &&
                        callee.object.type === 'Identifier' &&
                        callee.object.name === 'console' &&
                        callee.property.type === 'Identifier' &&
                        (callee.property.name === 'log' || callee.property.name === 'warn' || callee.property.name === 'error')) {
                        context.report({ node, message: `\`console.${callee.property.name}\` is not allowed.` });
                    }
                }
            };
        }
    },
    'no-var': {
        meta: {
            description: 'Require `let` or `const` instead of `var`.',
            fixable: true,
            good_code: `const x = 10;\nlet y = 20;`,
            bad_code: `var x = 10;`
        },
        create: function(context) {
            return {
                VariableDeclaration(node) {
                    if (node.kind === 'var') {
                        context.report({
                            node, message: 'Use `let` or `const` instead of `var`.',
                            fix(fixer) {
                                return fixer.replaceTextRange([node.start, node.start + 3], 'let');
                            }
                        });
                    }
                }
            };
        }
    },
    'use-strict-equals': {
        meta: {
            description: 'Require `===` and `!==` instead of `==` and `!=`.',
            fixable: true,
            good_code: `if (x === 10) {\n  // ...\n}`,
            bad_code: `if (x == 10) {\n  // ...\n}`
        },
        create: function(context) {
            return {
                BinaryExpression(node) {
                    const badOperators = { '==': '===', '!=': '!==' };
                    if (badOperators[node.operator]) {
                        context.report({
                            node, message: `Use '${badOperators[node.operator]}' instead of '${node.operator}'.`,
                            fix(fixer) {
                                const operatorToken = context.getSourceCode().getTokenAfter(node.left, node.operator);
                                if (operatorToken) return fixer.replaceTextRange(operatorToken.range, badOperators[node.operator]);
                            }
                        });
                    }
                }
            };
        }
    }
};