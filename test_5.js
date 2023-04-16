class Normal {
    constructor(char) {
        this.char = char;
    }
}

class Any {}

class ZeroOrMore {
    constructor(regexp) {
        this.regexp = regexp;
    }
}

class Or {
    constructor(left, right) {
        this.left = left;
        this.right = right;
    }
}

class Str {
    constructor(regexpList) {
        this.regexpList = regexpList;
    }
}

function parseRegex(regex) {
    let index = 0;
    let currentChar = regex[index];

    function parseNormal() {
        if (currentChar === '(' || currentChar === ')' || currentChar === '*' || currentChar === '|' || currentChar === '.') {
            return null;
        }
        let result = new Normal(currentChar);
        index++;
        currentChar = regex[index];
        return result;
    }

    function parseAny() {
        if (currentChar !== '.') {
            return null;
        }
        let result = new Any();
        index++;
        currentChar = regex[index];
        return result;
    }

    function parseZeroOrMore() {
        let result = null;
        let subStr = null;
        let inStr = false;
        if (currentChar === '*') {
            index++;
            prevChar = '*';
            currentChar = regex[index];
            if (currentChar === '(') {
                index++;
                currentChar = regex[index];
                subStr = inStr ? null : parseStr();
                inStr = false;
                if (currentChar === ')') {
                    index++;
                    currentChar = regex[index];
                    if (subStr !== null) {
                        result = new ZeroOrMore(subStr);
                    }
                }
            } else {
                subStr = parseNormal() || parseAny();
                if (subStr !== null) {
                    result = new ZeroOrMore(subStr);
                }
            }
        }
        return result;
    }

    function parseStr() {
        let result = null;
        let regexpList = [];
        let subRegex = null;
        let subZeroOrMore = null;
        let prevChar = '';
        let inZeroOrMore = false;
        while (currentChar !== undefined && currentChar !== '|' && currentChar !== ')' && !inZeroOrMore) {
            if (currentChar === '(') {
                index++;
                currentChar = regex[index];
                subRegex = parseRegex(regex.slice(index));
                if (subRegex === null) {
                    return null;
                }
                index += subRegex.regexpList.reduce((acc, val) => acc + val.regexpList.length, 0) + 1;
                currentChar = regex[index];
                subZeroOrMore = inZeroOrMore ? null : parseZeroOrMore();
                if (subZeroOrMore !== null) {
                    subRegex.regexpList.push(subZeroOrMore);
                }
                regexpList.push(subRegex);
                inZeroOrMore = false;
            } else if (currentChar === '*' && prevChar !== '\\') {
                subZeroOrMore = inZeroOrMore ? null : parseZeroOrMore();
                if (subZeroOrMore !== null) {
                    regexpList.push(subZeroOrMore);
                    inZeroOrMore = true;
                }
            } else {
                subRegex = parseNormal() || parseAny();
                if (subRegex === null) {
                    return null;
                }
                subZeroOrMore = inZeroOrMore ? null : parseZeroOrMore();
                if (subZeroOrMore !== null) {
                    subRegex = new Str([subRegex, subZeroOrMore]);
                }
                regexpList.push(subRegex);
                inZeroOrMore = false;
                index++;
                prevChar = currentChar;
                currentChar = regex[index];
            }
        }
        if (regexpList.length > 0) {
            result = new Str(regexpList);
        }
        return result;
    }

    function parseOr() {
        let left = parseStr();
        if (left === null || currentChar !== '|') {
            return left;
        }
        index++;
        currentChar = regex[index];
        let right = parseStr();
        if (right === null) {
            return null;
        }
        return new Or(left, right);
    }

    return parseOr();
}

console.log(parseRegex('abc')); // Str {regexpList: [Normal, Normal, Normal]}
console.log(parseRegex('a*b')); // Str {regexpList: [ZeroOrMore {regexp: Any}, Normal, Normal]}
console.log(parseRegex('a|b')); // Or {left: Normal {char: "a"}, right: Normal {char: "b"}}
console.log(parseRegex('a|bc*')); // Or { left: Normal {char: "a"},
// right: Str {regexpList: [Normal {char: "b"}, ZeroOrMore {regexp: Any}]}}
let result = parseRegex("a(b|c)*");
console.log(result);