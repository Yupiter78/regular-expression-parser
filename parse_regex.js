function parseRegex(regex) {
    const tokens = [];
    let index = 0;

    while (index < regex.length) {
        const char = regex[index];

        if (char === '.') {
            tokens.push({ type: 'any' });
        } else if (char === '*') {
            tokens.push({ type: 'zeroOrMore' });
        } else if (char === '+') {
            tokens.push({ type: 'oneOrMore' });
        } else if (char === '?') {
            tokens.push({ type: 'zeroOrOne' });
        } else if (char === '(') {
            tokens.push({ type: 'groupStart' });
        } else if (char === ')') {
            tokens.push({ type: 'groupEnd' });
        } else if (char === '\\') {
            const nextChar = regex[index + 1];

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