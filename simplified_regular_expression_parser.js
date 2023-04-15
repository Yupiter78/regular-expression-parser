const grammar = {
    // Define the base case of a regular expression
    regex: [
        { type: 'concat', value: 'expr' }
    ],

    // Define the expression constructs
    expr: [
        { type: 'or', value: ['term', 'expr'] },
        { type: 'term', value: ['term'] }
    ],

    // Define the term constructs
    term: [
        { type: 'zeroOrMore', value: ['factor'] },
        { type: 'oneOrMore', value: ['factor'] },
        { type: 'zeroOrOne', value: ['factor'] },
        { type: 'group', value: ['expr'] },
        { type: 'literal', value: ['char'] }
    ],

    // Define the factor constructs
    factor: [
        { type: 'any' },
        { type: 'digit' },
        { type: 'word' },
        { type: 'whitespace' },
        { type: 'literal', value: ['char'] }
    ]
};

// Define the tokenizer
function tokenize(regex) {
    let index = 0;
    const tokens = [];

    while (index < regex.length) {
        const char = regex[index];

        // Match any character
        if (char === '.') {
            tokens.push({ type: 'any' });
        }

        // Match zero or more occurrences
        else if (char === '*') {
            const prevToken = tokens.pop();
            tokens.push({ type: 'zeroOrMore', value: [prevToken] });
        }

        // Match one or more occurrences
        else if (char === '+') {
            const prevToken = tokens.pop();
            tokens.push({ type: 'oneOrMore', value: [prevToken] });
        }

        // Match zero or one occurrence
        else if (char === '?') {
            const prevToken = tokens.pop();
            tokens.push({ type: 'zeroOrOne', value: [prevToken] });
        }

        // Match a group of expressions
        else if (char === '(') {
            const subExprTokens = [];
            let subIndex = index + 1;

            while (subIndex < regex.length && regex[subIndex] !== ')') {
                // Tokenize the subexpression
                const subExprToken = tokenize(regex.substring(subIndex, regex.indexOf(')', subIndex)))[0];
                subExprTokens.push(subExprToken);

                subIndex += subExprToken.value.join('').length;
            }

            // Create a subexpression token
            const subExprToken = { type: 'group', value: subExprTokens };
            tokens.push(subExprToken);

            index = subIndex;
        }

        // Match a literal character
        else {
            tokens.push({ type: 'literal', value: char });
        }

        index++;
    }

    return tokens;
}

// Define the parser
function parse(tokens, grammar) {
    const stack = [];
    console.log("grammar:", grammar);

    tokens.forEach(token => {
        console.log("grammar[token.type]:", grammar[token.type]);
        const rule = grammar[token.type]?.find(r => r.value.join('') === token.value.join(''));
        if (rule) {
            const args = stack.splice(-rule.value.length);
            stack.push({ type: rule.type, args });
        } else {
            console.log("rule:", rule);
            throw new Error('Invalid token: ' + JSON.stringify(token));
        }
    });

    return stack[0];
}


// Define the evaluator
function evaluate(ast) {
    function match(input) {
        if (ast.type === 'concat') {
            // Concatenate the matches of the subexpressions
            let remainingInput = input;
            for (const arg of ast.args) {
                const matchResult = match(remainingInput);
                if (!matchResult) {
                    return false;
                }
                remainingInput = matchResult;
            }
            return remainingInput;
        } else if (ast.type === 'or') {
            // Try to match each subexpression in order until one succeeds
            for (const arg of ast.args) {
                const matchResult = match(input);
                if (matchResult) {
                    return matchResult;
                }
            }
            return false;
        } else if (ast.type === 'zeroOrMore') {
            // Match the subexpression zero or more times
            let remainingInput = input;
            while (true) {
                const matchResult = match(remainingInput);
                if (!matchResult) {
                    break;
                }
                remainingInput = matchResult;
            }
            return remainingInput;
        } else if (ast.type === 'oneOrMore') {
            // Match the subexpression one or more times
            let remainingInput = input;
            let matchResult = match(remainingInput);
            if (!matchResult) {
                return false;
            }
            remainingInput = matchResult;
            while (true) {
                matchResult = match(remainingInput);
                if (!matchResult || matchResult === remainingInput) {
                    break;
                }
                remainingInput = matchResult;
            }
            return remainingInput;
        } else if (ast.type === 'zeroOrOne') {
            // Match the subexpression zero or one times
            const matchResult = match(input);
            return matchResult ? matchResult : input;
        } else if (ast.type === 'group') {
            // Match the subexpression as a group
            const matchResult = match(input);
            return matchResult ? matchResult : false;
        } else if (ast.type === 'literal') {
            // Match a literal character
            const firstChar = input[0];
            return firstChar === ast.args[0] ? input.slice(1) : false;
        } else if (ast.type === 'any') {
            // Match any single character
            return input.slice(1);
        } else if (ast.type === 'digit') {
            // Match any digit character
            const firstChar = input[0];
            return firstChar && /[0-9]/.test(firstChar) ? input.slice(1) : false;
        } else if (ast.type === 'word') {
            // Match any word character
            const firstChar = input[0];
            return firstChar && /\w/.test(firstChar) ? input.slice(1) : false;
        } else if (ast.type === 'whitespace') {
            // Match any whitespace character
            const firstChar = input[0];
            return firstChar && /\s/.test(firstChar) ? input.slice(1) : false;
        }
    }

    return match;
}

// Example usage
const regex = 'a(bc)?d.*';
const tokens = tokenize(regex);
const ast = parse(tokens, grammar);
const matcherFn = evaluate(ast);

console.log(matcherFn('ad')); // false
console.log(matcherFn('abcd')); // true
console.log(matcherFn('abccd')); // true
console.log(matcherFn('ade')); // true
console.log(matcherFn('abcdef')); // true