function parseRegExp(str) {
    let regexpList = [];

    while (str.length > 0) {
        if (str[0] === '(') {
            let endIndex = findMatchingClosingParenIndex(str);
            let innerStr = str.slice(1, endIndex);
            regexpList.push(parseRegExp(innerStr));
            str = str.slice(endIndex + 1);
        } else if (str[0] === '[') {
            let endIndex = findMatchingClosingBracketIndex(str);
            let innerStr = str.slice(1, endIndex);
            regexpList.push(parseBracketExpression(innerStr));
            str = str.slice(endIndex + 1);
        } else if (str[0] === '|') {
            let left = regexpList.pop();
            let right = parseRegExp(str.slice(1));
            regexpList.push({type: 'or', left, right});
            break;
        } else if (str[0] === '*') {
            let prevRegExp = regexpList.pop();
            setLastObjectToZeroOrMore(prevRegExp, regexpList);
            str = str.slice(1);
        } else if (str[0] === '+') {
            let prevRegExp = regexpList.pop();
            let oneOrMoreRegExp = {type: 'oneOrMore', regexp: prevRegExp};
            regexpList.push(oneOrMoreRegExp);
            str = str.slice(1);
        } else if (str[0] === '?') {
            let prevRegExp = regexpList.pop();
            let zeroOrOneRegExp = {type: 'zeroOrOne', regexp: prevRegExp};
            regexpList.push(zeroOrOneRegExp);
            str = str.slice(1);
        } else if (str[0] === '.') {
            regexpList.push({type: 'any'});
            str = str.slice(1);
        } else {
            let sequence = parseSequence(str);
            let normalObjects = sequence.split('').map(char => {
                return {
                    type: 'normal',
                    char: char,
                };
            });
            regexpList.push(...normalObjects);
            str = str.slice(sequence.length);
        }
    }

    if (regexpList.length === 1) {
        return regexpList[0];
    } else {
        return {type: 'str', regexpList};
    }
}

function setLastObjectToZeroOrMore(prevRegExp, regexpList) {
    if (regexpList.length > 0) {
        let lastObject = regexpList[regexpList.length - 1];
        if (lastObject.type === 'zeroOrMore') {
            lastObject.regexp = prevRegExp;
        } else {
            regexpList.push({type: 'zeroOrMore', regexp: prevRegExp});
        }
    } else {
        regexpList.push({type: 'zeroOrMore', regexp: prevRegExp});
    }
}

function parseSequence(str) {
    let endIndex = 0;
    while (endIndex < str.length && !isSpecialCharacter(str[endIndex])) {
        endIndex++;
    }
    return str.slice(0, endIndex);
}

function parseBracketExpression(str) {
    let charSet = new Set();
    let negateSet = false;
    if (str[0] === '^') {
        negateSet = true;
        str = str.slice(1);
    }
    while (str.length > 0 && str[0] !== ']') {
        if (str[0] === '\\') {
            charSet.add(str[1]);
            str = str.slice(2);
        } else {
            charSet.add(str[0]);
            str = str.slice(1);
        }
    }
    return {
        type: 'charSet',
        charSet: charSet,
        negate: negateSet,
    };
}

function isSpecialCharacter(char) {
    return '()[]|*+?.\\'.indexOf(char) !== -1;
}

function findMatchingClosingParenIndex(str, startIndex = 0) {
    let count = 1;
    for (let i = startIndex + 1; i < str.length; i++) {
        if (str[i] === '(') {
            count++;
        } else if (str[i] === ')') {
            count--;
            if (count === 0) {
                return i;
            }
        }
    }
    throw new Error('No matching closing parenthesis found');
}

function findMatchingClosingBracketIndex(str, startIndex = 0) {
    let count = 1;
    for (let i = startIndex + 1; i < str.length; i++) {
        if (str[i] === '[') {
            count++;
        } else if (str[i] === ']') {
            count--;
            if (count === 0) {
                return i;
            }
        }
    }
    throw new Error('No matching closing bracket found');
}

console.log(parseRegExp("a|b")); // {type: "Or", left: {type: "Normal", char: "a"}, right: {type: "Normal", char: "b"}}
console.log(parseRegExp("(a)b|c")); // {type: "Or", left: {type: "Str", regexpList: [{type: "Normal", char: "a"}, {type: "Normal", char: "b"}]} , right: {type: "Normal", char: "c"}}
console.log(parseRegExp("a*")); // {type: "ZeroOrMore", regexp: {type: "Normal", char: "a"}}
console.log(parseRegExp(".")); // {type: "Any"}
console.log(parseRegExp("")); // null