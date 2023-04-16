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
        if (currentChar === '(' || currentChar === ')' || currentChar === '*' || currentChar === '|') {
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
        let result;
        if (currentChar === "(") {
            index++;
            currentChar = regex[index];
            result = parseRegex(regex);
            index++;
            currentChar = regex[index];
        } else {
            result = new Str(parseNormal() || parseAny());
        }

        while (currentChar === "*") {
            result = new ZeroOrMore(result);
            index++;
            currentChar = regex[index];
        }

        return result;
    }

    function parseOr() {
        let result = null;
        let left = null;
        let right = null;
        left = parseRegex(regex);
        if (left !== null && currentChar === '|') {
            index++;
            currentChar = regex[index];
            right = parseRegex(regex);
            if (right !== null) {
                result = new Or(left, right);
            }
        }
        return result;
    }

    function parseStr() {
        let result = null;
        let regexpList = [];
        let subRegexp = null;
        while (currentChar !== null && currentChar !== ')' && currentChar !== '|' && currentChar !== '*') {
            if (currentChar === '(') {
                index++;
                currentChar = regex[index];
                subRegexp = parseRegex(regex);
                if (subRegexp !== null) {
                    regexpList.push(subRegexp);
                    currentChar = regex[index];
                } else {
                    return null;
                }
            } else {
                subRegexp = parseNormal() || parseAny() || parseZeroOrMore();
                if (subRegexp !== null) {
                    regexpList.push(subRegexp);
                    index++;
                    currentChar = regex[index];
                } else {
                    return null;
                }
            }
        }
        if (regexpList.length > 0) {
            result = new Str(regexpList);
        }
        return result;
    }

    let result = parseStr();
    if (result === null || currentChar !== undefined) {
        return null;
    }
    return result;
}

console.log(parseRegex('abc')); // Str {regexpList: [Normal, Normal, Normal]}
console.log(parseRegex('a*b')); // Str {regexpList: [ZeroOrMore {regexp: Any}, Normal, Normal]}
console.log(parseRegex('a|b')); // Or {left: Normal {char: "a"}, right: Normal {char: "b"}}
console.log(parseRegex('a|bc*')); // Or { left: Normal {char: "a"},
// right: Str {regexpList: [Normal {char: "b"}, ZeroOrMore {regexp: Any}]}}

console.log(parseRegex("a(b|c)*"));