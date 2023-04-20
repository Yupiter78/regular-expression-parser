const Normal = (char) => ({
    type: "Normal",
    char: char,
});

// Create an object representing the meta-character "."
const Any = () => ({
    type: "Any",
});

// Create an object representing the meta-character "*"
const ZeroOrMore = (regexp) => ({
    type: "ZeroOrMore",
    regexp: regexp,
});

// Create an object representing the meta-character "|"
const Or = (left, right) => ({
    type: "Or",
    left: left,
    right: right,
});

// Create an object representing a sequence of regular expressions
const Str = (regexpList) => ({
    type: "Str",
    regexpList: regexpList,
});

// Checks if a character is special in the regex syntax
const isSpecialCharacter = (char) => /[\(\)\|\*\.\+]/.test(char);

// Checks if the stack represents an invalid state in parsing
const isInvalidSyntax = (stack) =>
    stack.length === 0 || stack[stack.length - 1].type === "Or";

// Find the largest sequence of normal characters at the start of a string
const parseSequence = (str) => {
    let i = 0;
    while (i < str.length && !isSpecialCharacter(str.charAt(i))) {
        i++;
    }
    return str.substring(0, i);
};

// Find index of matching closing parentheses
const findMatchingClosingParenIndex = (str, startIndex = 0) => {
    let stack = 1;
    for (let i = startIndex + 1; i < str.length; i++) {
        if (str.charAt(i) === "(") {
            stack++;
        } else if (str.charAt(i) === ")") {
            stack--;
            if (stack === 0) {
                return i;
            }
        }
    }
    return null;
};

// Parse input string into regular expression object
const parseRegExp = (str) => {
    let stack = [];

    for (let i = 0; i < str.length; i++) {
        if (isSpecialCharacter(str.charAt(i))) {
            if (str.charAt(i) === "(") {
                // Find matching closing parentheses
                const closingIndex = findMatchingClosingParenIndex(str, i);
                if (closingIndex === null) {
                    // Unbalanced parentheses
                    return null;
                }
                const inner = parseRegExp(str.substring(i + 1, closingIndex));
                if (inner === null) {
                    // Invalid syntax within parentheses
                    return null;
                }
                i = closingIndex;
                stack.push(inner);
            } else if (str.charAt(i) === "|") {
                if (isInvalidSyntax(stack)) {
                    // Invalid syntax before "|"
                    return null;
                }
                const left = stack.pop();
                const right = parseRegExp(str.substring(i + 1));
                if (right === null) {
                    // Invalid syntax after "|"
                    return null;
                }
                stack.push(Or(left, right));
                break;
            } else if (str.charAt(i) === ".") {
                stack.push(Any());
            } else if (str.charAt(i) === "*") {
                if (isInvalidSyntax(stack)) {
                    // Invalid syntax before "*"
                    return null;
                }
                const prevRegExp = stack.pop();
                stack.push(ZeroOrMore(prevRegExp));
            } else {
                // Should never happen
                return null;
            }
        } else {
            // Parse sequence of normal characters
            const sequence = parseSequence(str.substring(i));
            i += sequence.length - 1;
            stack.push(Str(sequence.split("").map((char) => Normal(char))));
        }
    }

    if (stack.length !== 1) {
        return null;
    }
    return stack.pop();
};

console.log(parseRegExp("a|b")); // {type: "Or", left: {type: "Normal", char: "a"}, right: {type: "Normal", char: "b"}}
console.log(parseRegExp("(a)b|c")); // {type: "Or", left: {type: "Str", regexpList: [{type: "Normal", char: "a"}, {type: "Normal", char: "b"}]} , right: {type: "Normal", char: "c"}}
console.log(parseRegExp("a*")); // {type: "ZeroOrMore", regexp: {type: "Normal", char: "a"}}
console.log(parseRegExp(".")); // {type: "Any"}
console.log(parseRegExp("")); // null