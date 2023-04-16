function parseRegex(str) {
    let regexpList = [];

    while (str.length > 0) {
        if (str[0] === '(') {
            let endIndex = findMatchingClosingParenIndex(str);
            let innerStr = str.slice(1, endIndex);
            regexpList.push(parseRegex(innerStr));
            str = str.slice(endIndex + 1);
        } else if (str[0] === '[') {
            let endIndex = findMatchingClosingBracketIndex(str);
            let innerStr = str.slice(1, endIndex);
            regexpList.push(parseBracketExpression(innerStr));
            str = str.slice(endIndex + 1);
        } else if (str[0] === '|') {
            let left = regexpList.pop();
            let right = parseRegex(str.slice(1));
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

    if (regexpList.length == 1) {
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
    let regexp = {
        type: 'charSet',
        charSet: charSet,
        negate: negateSet,
    };
    return regexp;
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

console.log(parseRegex('abc'),
    "should return {type: 'str', regexpList: [{type: 'normal', char: 'a'} , {type: 'normal', char: 'b'}, {type: 'normal', char: 'c'}]}"); // Str {regexpList: [Normal, Normal, Normal]}
console.log(parseRegex('a*b'),
    "should return {type: 'str', regexpList: [{type: 'zeroOrMore', regexp: {type: 'normal', char: 'a'}}, {type: 'normal', char: 'b'}]}"); // Str {regexpList: [ZeroOrMore {regexp: Any}, Normal {char: 'b'},]}
console.log(parseRegex('a|b'),
    "should return {type: 'or', left: {type: 'normal', char: 'a'}, right: {type: 'normal', char: 'b'}}"); // Or {left: Normal {char: "a"}, right: Normal {char: "b"}}
console.log(parseRegex('a|bc*'),
    "should return {type: 'or', left: {type: 'normal', char: 'a'}, right: {type: 'str', regexpList: [{type: 'normal', char: 'b'}, {type: 'zeroOrMore', regexp: {type: 'normal', char: 'c'}}]}}"); // Or { left: Normal {char: "a"},
// right: Str {regexpList: [Normal {char: "b"}, ZeroOrMore {regexp: Any}]}}

console.log(parseRegex("a(b|c)*"),
    "should return {type: 'str', regexpList: [{type: 'normal', char: 'a'}, {type: 'zeroOrMore', regexp: {type: 'or', left: {type: 'normal', char: 'b'}, right: {type: 'normal', char: 'c'}}}]}"); // Str {regexpList: [Normal {char: "a"}, Str {regexpList: [Or {left: Normal {char: "b"},
// right: Normal {char: "c"}}, ZeroOrMore {regexp: Any}]}]}