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
        console.log("___parseZeroOrMore___")
        let result = null;
        let subRegexp = null;
        if (currentChar !== '(' && currentChar !== ')' && currentChar !== '*' && currentChar !== '|') {
            subRegexp = parseRegex(regex.slice(index));
            console.log("subRegexp:", subRegexp);
            if (subRegexp !== null) {
                result = new ZeroOrMore(subRegexp);
                index += subRegexp.regexpList.reduce((acc, val) => acc + val.regexpList.length, 0);
                currentChar = regex[index];
            }
        }
        return result;
    }

    function parseOr() {
        let result = null;
        let left = null;
        let right = null;
        left = parseStr();
        if (left !== null && currentChar === '|') {
            index++;
            currentChar = regex[index];
            right = parseStr();
            if (right !== null) {
                result = new Or(left, right);
            }
        }
        return result;
    }

    function parseStr() {
        let result = null;
        let regexpList = [];
        let subRegex = null;
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
                regexpList.push(subRegex);
            } else if (currentChar === '*') {
                regexpList.push(new ZeroOrMore(new Any()));
                index++;
                currentChar = regex[index];
            } else {
                subRegex = parseNormal() || parseAny();
                if (subRegex === null) {
                    return null;
                }
                regexpList.push(subRegex);
            }
        }
        if (regexpList.length > 0) {
            result = new Str(regexpList);
        }
        return result;
    }

    return parseStr();
}

console.log(parseRegex('abc')); // Str {regexpList: [Normal, Normal, Normal]}
console.log(parseRegex('a*b')); // Str {regexpList: [ZeroOrMore {regexp: Any}, Normal, Normal]}
console.log(parseRegex('a|b')); // Or {left: Normal {char: "a"}, right: Normal {char: "b"}}
console.log(parseRegex('a|bc*')); // Or { left: Normal {char: "a"},
// right: Str {regexpList: [Normal {char: "b"}, ZeroOrMore {regexp: Any}]}}

console.log(parseRegex("a(b|c)*"));