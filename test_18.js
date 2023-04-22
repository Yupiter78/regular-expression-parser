const Normal = char => {
    return {
        type: "Normal",
        char
    };
};

const Any = () => {
    return {
        type: "Any"
    };
};

const ZeroOrMore = regexp => {
    return {
        type: "ZeroOrMore",
        regexp
    };
};

const Or = (left, right) => {
    return {
        type: "Or",
        left,
        right
    };
};

const Str = regexpList => {
    return {
        type: "Str",
        regexpList
    };
};

const parseRegExp = str => {
    const stack = [];
    let i = 0;

    while (i < str.length) {
        const char = str[i];

        if (char === "(") {
            const closingParenIndex = findMatchingClosingParenIndex(str, i);
            if (closingParenIndex === null) {
                return null;
            }
            const subexpr = parseRegExp(str.slice(i + 1, closingParenIndex));
            if (subexpr === null) {
                return null;
            }
            stack.push(subexpr);
            i = closingParenIndex + 1;
        } else if (char === "|") {
            if (stack.length === 0) {
                return null;
            }
            const left = stack.pop();
            const right = parseRegExp(str.slice(i + 1));
            if (right === null) {
                return null;
            }
            return { type: "Or", left, right };
        } else if (char === "*") {
            if (stack.length === 0) {
                return null;
            }
            stack.push({ type: "ZeroOrMore", regexp: stack.pop() });
            i++;
        } else if (char === ".") {
            stack.push({ type: "any" });
            i++;
        } else {
            let j = i;
            while (j < str.length && !isSpecialCharacter(str[j])) {
                j++;
            }
            stack.push({ type: "Str", regexpList: [...str.slice(i, j)] });
            i = j;
        }
    }

    if (stack.length === 0 || stack.length > 1) {
        return null;
    }

    return stack[0];
};


const isSpecialCharacter = char => {
    return "()|.".includes(char);
};

const isInvalidSyntax = stack => {
    return stack.length === 0 || stack[stack.length - 1].type === "Or";
};

const parseSequence = str => {
    let i = 0;

    while (i < str.length && !isSpecialCharacter(str[i])) {
        i++;
    }

    return str.slice(0, i);
};

const findMatchingClosingParenIndex = (str, startIndex = 0) => {
    let numOpenParens = 1;

    for (let i = startIndex + 1; i < str.length; i++) {
        if (str[i] === "(") {
            numOpenParens++;
        } else if (str[i] === ")") {
            numOpenParens--;

            if (numOpenParens === 0) {
                return i;
            }
        }
    }

    return null;
};


console.log(parseRegExp("a|b")); // {type: "Or", left: {type: "Normal", char: "a"}, right: {type: "Normal", char: "b"}}
console.log(parseRegExp("(a)b|c")); // {type: "Or", left: {type: "Str", regexpList: [{type: "Normal", char: "a"}, {type: "Normal", char: "b"}]} , right: {type: "Normal", char: "c"}}
console.log(parseRegExp("a*")); // {type: "ZeroOrMore", regexp: {type: "Normal", char: "a"}}
console.log(parseRegExp(".")); // {type: "Any"}
console.log(parseRegExp("")); // null