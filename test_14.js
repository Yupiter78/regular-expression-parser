const Normal = char => ({ type: "Normal", char });

const Any = () => ({ type: "Any" });

const ZeroOrMore = regexp => ({ type: "ZeroOrMore", regexp });

const Or = (left, right) => ({ type: "Or", left, right });

const Str = regexpList => ({ type: "Str", regexpList });


// Define parsing helper functions

const isSpecialCharacter = char => "()|*.".includes(char);

const isInvalidSyntax = stack => stack.length === 0 || stack[stack.length - 1].type === "Or";

const parseSequence = str => {
    let endIndex = 0;
    while (endIndex < str.length && !isSpecialCharacter(str.charAt(endIndex))) {
        endIndex++;
    }
    return str.slice(0, endIndex);
};

const findMatchingClosingParenIndex = (str, startIndex = 0) => {
    let openCount = 1;
    let i = startIndex + 1;
    while (i < str.length && openCount !== 0) {
        if (str.charAt(i) === "(") {
            openCount++;
        } else if (str.charAt(i) === ")") {
            openCount--;
        }
        i++;
    }
    return openCount === 0 ? i - 1 : null;
};

const parseRegExp = str => {
    const parseRecursive = (stack, i) => {
        if (i >= str.length) {
            return stack;
        }
        const char = str.charAt(i);

        if (char === "(") {
            const endIndex = findMatchingClosingParenIndex(str, i);
            if (endIndex === null) {
                return null; // invalid syntax
            }
            const subexpression = parseRecursive([], i + 1);
            if (subexpression === null) {
                return null; // subexpression is invalid
            }
            return parseRecursive([...stack, subexpression], endIndex + 1);
        } else if (char === "|") {
            if (isInvalidSyntax(stack)) {
                return null;
            }
            const left = stack.pop();
            const rightSequence = parseSequence(str.slice(i + 1));
            const right = parseRegExp(rightSequence);
            if (right === null || isInvalidSyntax([left, right])) {
                return null;
            }
            return parseRecursive([...stack, Str([left, Or(left, right)])], i + rightSequence.length + 1);
        } else if (char === "*") {
            if (isInvalidSyntax(stack)) {
                return null;
            }
            const prev = stack.pop();
            return parseRecursive([...stack, ZeroOrMore(prev)], i + 1);
        } else if (char === ".") {
            return parseRecursive([...stack, Any()], i + 1);
        } else {
            const sequence = parseSequence(str.slice(i));
            if (sequence.length === 0) {
                return null; // no valid sequence found
            }
            const regexpList = Array.from(sequence).map(char => Normal(char));
            return parseRecursive([...stack, Str(regexpList)], i + sequence.length);
        }
    };

    const resultStack = parseRecursive([], 0);
    return resultStack !== null && resultStack.length === 1 ? resultStack[0] : null;
};

console.log(parseRegExp("a|b")); // {type: "Or", left: {type: "Normal", char: "a"}, right: {type: "Normal", char: "b"}}
console.log(parseRegExp("(a)b|c")); // {type: "Or", left: {type: "Str", regexpList: [{type: "Normal", char: "a"}, {type: "Normal", char: "b"}]} , right: {type: "Normal", char: "c"}}
console.log(parseRegExp("a*")); // {type: "ZeroOrMore", regexp: {type: "Normal", char: "a"}}
console.log(parseRegExp(".")); // {type: "Any"}
console.log(parseRegExp("")); // null