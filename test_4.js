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
        let subRegexp = null;
        if (currentChar === '*') {
            index++;
            currentChar = regex[index];
            subRegexp = parseNormal() || parseAny();
            if (subRegexp !== null) {
                result = new ZeroOrMore(subRegexp);
            }
        }
        return result;
    }

    function parseStr() {
        let result = null;
        let regexpList = [];
        let subRegex = null;
        let subZeroOrMore = null;
        while (currentChar !== undefined && currentChar !== '|' && currentChar !== ')') {
            if (currentChar === '(') {
                index++;
                currentChar = regex[index];
                subRegex = parseRegex(regex.slice(index));
                if (subRegex === null) {
                    return null;
                }
                index += subRegex.regexpList.reduce((acc, val) => acc + val.regexpList.length, 0) + 1;
                currentChar = regex[index];
                subZeroOrMore = parseZeroOrMore();
                if (subZeroOrMore !== null) {
                    subRegex.regexpList.push(subZeroOrMore);
                }
                regexpList.push(subRegex);
            } else if (currentChar === '*') {
                subZeroOrMore = parseZeroOrMore();
                if (subZeroOrMore !== null) {
                    regexpList.push(subZeroOrMore);
                }
                index++;
                currentChar = regex[index];
            } else {
                subRegex = parseNormal() || parseAny();
                if (subRegex === null) {
                    return null;
                }
                subZeroOrMore = parseZeroOrMore();
                if (subZeroOrMore !== null) {
                    subRegex = new Str([subRegex, subZeroOrMore]);
                }
                regexpList.push(subRegex);
                index++;
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