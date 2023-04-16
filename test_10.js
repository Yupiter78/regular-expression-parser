class Normal {
    constructor(char) {
        this.type = 'normal';
        this.char = char;
    }
}

class Any {
    constructor() {
        this.type = 'any';
    }
}

class ZeroOrMore {
    constructor(regexp) {
        this.type = 'zeroOrMore';
        this.regexp = regexp;
    }
}

class Or {
    constructor(left, right) {
        this.type = 'or';
        this.left = left;
        this.right = right;
    }
}

class Str {
    constructor(regexpList) {
        this.type = 'str';
        this.regexpList = regexpList;
    }
}

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
            regexpList.push(new Or(left, right));
            break;
        } else if (str[0] === '*') {
            let prevRegExp = regexpList.pop();
            setLastObjectToZeroOrMore(prevRegExp, regexpList);
            str = str.slice(1);
        } else if (str[0] === '+') {
            let prevRegExp = regexpList.pop();
            let oneOrMoreRegExp = new Str([prevRegExp, new ZeroOrMore(prevRegExp)]);
            regexpList.push(oneOrMoreRegExp);
            str = str.slice(1);
        } else if (str[0] === '?') {
            let prevRegExp = regexpList.pop();
            let zeroOrOneRegExp = new Or(prevRegExp, new Normal(''));
            regexpList.push(zeroOrOneRegExp);
            str = str.slice(1);
        } else if (str[0] === '.') {
            regexpList.push(new Any());
            str = str.slice(1);
        } else {
            let sequence = parseSequence(str);
            let normalObjects = sequence.split('').map(char => new Normal(char));
            regexpList.push(...normalObjects);
            str = str.slice(sequence.length);
        }
    }
    if (regexpList.length === 1) {
        return regexpList[0];
    } else {
        return new Str(regexpList);
    }
}

function setLastObjectToZeroOrMore(prevRegExp, regexpList) {
    if (regexpList.length > 0) {
        let lastObject = regexpList[regexpList.length - 1];
        if (lastObject.type === 'zeroOrMore') {
            lastObject.regexp = prevRegExp;
        } else {
            regexpList.push(new ZeroOrMore(prevRegExp));
        }
    } else {
        regexpList.push(new ZeroOrMore(prevRegExp));
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

console.log(parseRegex('abc'), "should return Str {regexpList: [Normal, Normal, Normal]}");
console.log(parseRegex('a*b'), "should return Str {regexpList: [ZeroOrMore {regexp: Normal}, Normal]}");
console.log(parseRegex('a|b'), "should return Or {left: Normal {char: 'a'}, right: Normal {char: 'b'}}");
console.log(parseRegex('a|bc*'), "should return Or {left: Normal {char: 'a'}, right: Str {regexpList: [Normal, ZeroOrMore {regexp: Normal}]}}");
console.log(parseRegex("a(b|c)*"), "should return Str {regexpList: [Normal, ZeroOrMore {regexp: Or}]}");