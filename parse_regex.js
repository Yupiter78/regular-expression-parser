function parseRegex(regex) {
    //In this example, we define a parseRegex function that takes a regular expression
    // as an argument and returns an array of tokens.
    // We loop through each character in the regular expression string and push a
    // token object to the tokens array based on the character:
    const tokens = [];
    let index = 0;

    while (index < regex.length) {
        const char = regex[index];

        if (char === '.') {
            tokens.push({ type: 'any' }); // - If the character is a dot (.), we push a token object with a type of any.
        } else if (char === '*') {
            tokens.push({ type: 'zeroOrMore' }); // - If the character is an asterisk (*),
            // we push a token object with a type of zeroOrMore.
        } else if (char === '+') {
            tokens.push({ type: 'oneOrMore' }); // - If the character is a plus (+),
            // we push a token object with a type of oneOrMore.
        } else if (char === '?') {
            tokens.push({ type: 'zeroOrOne' }); // - If the character is a question mark (?),
            // we push a token object with a type of zeroOrOne.
        } else if (char === '(') {
            tokens.push({ type: 'groupStart' }); // - If the character is an opening parenthesis ((),
            // we push a token object with a type of groupStart.
        } else if (char === ')') {
            tokens.push({ type: 'groupEnd' }); // - If the character is a closing parenthesis ()),
            // we push a token object with a type of groupEnd.
        } else if (char === '\\') {
            const nextChar = regex[index + 1]; // - If the character is a backslash (\), we look ahead to the next character
            // to determine the type of token to push (digit, word, whitespace, or literal).
            // - If none of the above conditions are met, we push a token object with a type of literal
            // and a value equal to the character.
            if (nextChar === 'd') {
                tokens.push({ type: 'digit' });
                index++;
            } else if (nextChar === 'w') {
                tokens.push({ type: 'word' });
                index++;
            } else if (nextChar === 's') {
                tokens.push({ type: 'whitespace' });
                index++;
            } else {
                tokens.push({ type: 'literal', value: nextChar });
                index++;
            }
        } else {
            tokens.push({ type: 'literal', value: char });
        }

        index++;
    }

    return tokens;
}

const regex = "a(b|c)*";

const ast = parseRegex(regex);

console.log(ast);