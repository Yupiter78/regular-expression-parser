const SPECIAL_CHARS = "()|*.";
const TYPE_NORMAL = "Normal";
const TYPE_ANY = "Any";
const TYPE_ZERO_OR_MORE = "ZeroOrMore";
const TYPE_OR = "Or";
const TYPE_STR = "Str";

function isSpecialCharacter(char) {
    return SPECIAL_CHARS.includes(char);
}

function isInvalidSyntax(stack) {
    if (stack.length === 0) {
        return true;
    }
    const top = stack[stack.length - 1];
    return top.type === TYPE_OR && !top.left;
}

function parseSequence(str) {
    let i = 0;
    while (i < str.length && !isSpecialCharacter(str[i])) {
        i++;
    }
    return str.slice(0, i);
}

function findMatchingClosingParenIndex(str, startIndex = 0) {
    let count = 1;
    for (let i = startIndex + 1; i < str.length; i++) {
        if (str[i] === "(") {
            count++;
        } else if (str[i] === ")") {
            count--;
            if (count === 0) {
                return i;
            }
        }
    }
    return null;
}

function parseNormal(str) {
    return { type: TYPE_NORMAL, char: str[0] };
}

function parseAny() {
    return { type: TYPE_ANY };
}

function parseZeroOrMore(regexp) {
    return { type: TYPE_ZERO_OR_MORE, regexp };
}

function parseOr(left, right) {
    return { type: TYPE_OR, left, right };
}

function parseStr(regexpList) {
    return { type: TYPE_STR, regexpList };
}

function parseRegExp(str) {
    const stack = [];
    let i = 0;

    while (i < str.length) {
        const char = str[i];

        if (char === "(") {
            const closingIndex = findMatchingClosingParenIndex(str, i);
            if (closingIndex === null) {
                return null;
            } else {
                const innerStr = str.slice(i + 1, closingIndex);
                const innerRegexp = parseRegExp(innerStr);
                if (innerRegexp === null) {
                    return null;
                } else {
                    stack.push(innerRegexp);
                    i = closingIndex + 1;
                }
            }
        } else if (char === "|") {
            if (isInvalidSyntax(stack)) {
                return null;
            } else {
                const left = stack.pop();
                const rightSequence = str.slice(i + 1);
                const rightRegexp = parseRegExp(rightSequence);
                if (rightRegexp === null) {
                    return null;
                } else {
                    const orRegexp = parseOr(left, rightRegexp);
                    stack.push(orRegexp);
                    break;
                }
            }
        } else if (char === "*") {
            if (isInvalidSyntax(stack)) {
                return null;
            } else {
                const prev = stack.pop();
                const zeroOrMoreRegexp = parseZeroOrMore(prev);
                stack.push(zeroOrMoreRegexp);
                i++;
            }
        } else if (char === ".") {
            const anyRegexp = parseAny();
            stack.push(anyRegexp);
            i++;
        } else if (!isSpecialCharacter(char)) {
            const sequence = parseSequence(str.slice(i));
            const normalRegexp = parseNormal(sequence);
            stack.push(normalRegexp);
            i += sequence.length;
        } else {
            return null;
        }
    }

    if (stack.length === 0 || stack.length > 1) {
        return null;
    } else {
        return stack.pop();
    }
}

console.log(parseRegExp("a|b")); // {type: "Or", left: {type: "Normal", char: "a"}, right: {type: "Normal", char: "b"}}
console.log(parseRegExp("(a)b|c")); // {type: "Or", left: {type: "Str", regexpList: [{type: "Normal", char: "a"}, {type: "Normal", char: "b"}]} , right: {type: "Normal", char: "c"}}
console.log(parseRegExp("a*")); // {type: "ZeroOrMore", regexp: {type: "Normal", char: "a"}}
console.log(parseRegExp(".")); // {type: "any"}
console.log(parseRegExp("")); // null