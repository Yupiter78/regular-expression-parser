const SPECIAL_CHARACTERS = "()|*.";

const isSpecialCharacter = (char) => {
    return SPECIAL_CHARACTERS.includes(char);
}

const isInvalidSyntax = (stack) => {
    return stack.length === 0 || stack[stack.length - 1].type === "Or";
}

const parseSequence = (str) => {
    let sequence = "";
    let i = 0;
    while (i < str.length && !isSpecialCharacter(str[i])) {
        sequence += str[i];
        i++;
    }
    return sequence || null;
}
/*const parseSequence = (str) => {
    let sequence = "";
    let i = 0;
    let parenCount = 0; // keep track of parentheses
    while (i < str.length) {
        if (isSpecialCharacter(str[i])) {
            if (str[i] === "(") {
                if (parenCount === 0) {
                    // start of a subsequence
                    let closingParenIndex = findMatchingClosingParenIndex(str, i);
                    if (closingParenIndex === null) {
                        return ""; // mismatched parentheses
                    }
                    sequence += str.slice(i, closingParenIndex + 1);
                    i = closingParenIndex + 1;
                } else {
                    // within a subsequence
                    sequence += str[i];
                    parenCount++;
                }
            } else if (str[i] === ")") {
                if (parenCount > 0) {
                    sequence += str[i];
                    parenCount--;
                } else {
                    return ""; // mismatched parentheses
                }
            } else {
                // end of the sequence
                break;
            }
        } else {
            // a normal character in the sequence
            sequence += str[i];
        }
        i++;
    }
    if (parenCount !== 0) {
        return ""; // mismatched parentheses
    }
    return sequence;
}*/

const findMatchingClosingParenIndex = (str, startIndex = 0) => {
    let stack = 1;
    for (let i = startIndex + 1; i < str.length; i++) {
        if (str[i] === "(") {
            stack++;
        } else if (str[i] === ")") {
            stack--;
            if (stack === 0) {
                return i;
            }
        }
    }
    return null;
}

const parseRegExp = (str) => {
    if (str === "") {
        return null;
    }

    let stack = [];

    let i = 0;
    while (i < str.length) {
        let newObject = null;
        let char = str[i];

        if (isSpecialCharacter(char)) {
            if (char === "(") {
                let closingParenIndex = findMatchingClosingParenIndex(str, i);
                if (closingParenIndex === null) {
                    return null;
                }
                let subexpression = str.slice(i + 1, closingParenIndex);
                newObject = parseRegExp(subexpression);
                i = closingParenIndex + 1;
            } else if (char === ")") {
                return null;
            } else if (char === "|") {
                if (isInvalidSyntax(stack)) {
                    return null;
                }
                let left = stack.pop();
                let right = parseRegExp(str.slice(i+1));
                if (right === null) {
                    return null;
                }
                newObject = {type: "Or", left: left, right: right};
                i += right.length + 1;
            } else if (char === "*") {
                if (stack.length === 0) {
                    return null;
                }
                let regexp = stack.pop();
                newObject = {type: "ZeroOrMore", regexp: regexp};
                i++;
            } else if (char === ".") {
                newObject = {type: "Any"};
                i++;
            }
        } else {
            let sequence = parseSequence(str.slice(i));
            if (sequence === null) {
                return null;
            }
            if (sequence.length > 1) {
                let regexpList = [];
                for (let j = 0; j < sequence.length; j++) {
                    regexpList.push({type: "Normal", char: sequence[j]});
                }
                newObject = {type: "Str", regexpList: regexpList};
            } else {
                newObject = {type: "Normal", char: sequence};
            }
            i += sequence.length;
        }

        stack.push(newObject);
    }

    if (stack.length !== 1) {
        return null;
    }

    return stack[0];
}


console.log(parseRegExp("a|b")); // {type: "Or", left: {type: "Normal", char: "a"}, right: {type: "Normal", char: "b"}}
console.log(parseRegExp("(a)b|c")); // {type: "Or", left: {type: "Str", regexpList: [{type: "Normal", char: "a"}, {type: "Normal", char: "b"}]} , right: {type: "Normal", char: "c"}}
console.log(parseRegExp("a*")); // {type: "ZeroOrMore", regexp: {type: "Normal", char: "a"}}
console.log(parseRegExp(".")); // {type: "Any"}
console.log(parseRegExp("")); // null