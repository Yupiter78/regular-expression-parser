const SPECIAL_CHARS = "()|*.";
const OR_CHAR = "|";

function isSpecialCharacter(char) {
    return SPECIAL_CHARS.includes(char);
}

function isInvalidSyntax(stack) {
    return stack.length === 0 || stack[stack.length - 1].type === "Or";
}

function parseSequence(str) {
    let i = 0;
    while (i < str.length && !isSpecialCharacter(str[i])) {
        i++;
    }
    return str.substring(0, i);
}

function findMatchingClosingParenIndex(str, startIndex = 0) {
    let parenCount = 1;
    for (let i = startIndex + 1; i < str.length; i++) {
        if (str[i] === "(") {
            parenCount++;
        } else if (str[i] === ")") {
            parenCount--;
            if (parenCount === 0) {
                return i;
            }
        }
    }
    return null;
}

function parseRegExp(str) {
    const stack = [];
    let i = 0;
    while (i < str.length) {
        const char = str[i];
        if (char === "(") {
            const closingParenIndex = findMatchingClosingParenIndex(str, i);
            if (closingParenIndex === null) {
                return null; // Invalid syntax
            }
            const subexpr = str.substring(i + 1, closingParenIndex);
            stack.push(parseRegExp(subexpr));
            i = closingParenIndex + 1;
        } else if (char === OR_CHAR) {
            if (isInvalidSyntax(stack)) {
                return null; // Invalid syntax
            }
            const right = parseRegExp(str.substring(i + 1));
            const left = stack.pop();
            stack.push(Or(left, right));
            i = str.length; // Stop parsing; remaining string is for right-hand side
        } else if (char === "*") {
            if (stack.length === 0) {
                return null; // Invalid syntax
            }
            const regexp = stack.pop();
            stack.push(ZeroOrMore(regexp));
            i++;
        } else if (char === ".") {
            stack.push(Any());
            i++;
        } else {
            const sequence = parseSequence(str.substring(i));
            for (let j = 0; j < sequence.length; j++) {
                stack.push(Normal(sequence[j]));
            }
            i += sequence.length;
        }
    }
    if (isInvalidSyntax(stack)) {
        return null; // Invalid syntax
    } else if (stack.length === 1) {
        return stack[0];
    } else {
        return Str(stack);
    }
}

function Normal(char) {
    return { type: "Normal", char };
}

function Any() {
    return { type: "any" };
}

function ZeroOrMore(regexp) {
    return { type: "ZeroOrMore", regexp };
}

function Or(left, right) {
    return { type: "Or", left, right };
}

function Str(regexpList) {
    return { type: "Str", regexpList };
}

console.log(parseRegExp("a|b")); // {type: "Or", left: {type: "Normal", char: "a"}, right: {type: "Normal", char: "b"}}
console.log(parseRegExp("(a)b|c")); // {type: "Or", left: {type: "Str", regexpList: [{type: "Normal", char: "a"}, {type: "Normal", char: "b"}]} , right: {type: "Normal", char: "c"}}
console.log(parseRegExp("a*")); // {type: "ZeroOrMore", regexp: {type: "Normal", char: "a"}}
console.log(parseRegExp(".")); // {type: "any"}
console.log(parseRegExp("")); // null
