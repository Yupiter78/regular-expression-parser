const LEFT_PAREN = '(';
const RIGHT_PAREN = ')';
const STAR = '*';
const PIPE = '|';
const DOT = '.';

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

// Parses a regular expression and returns the corresponding regular expression tree.
function parseRegex(regex) {
    let index = 0;
    let currentChar = regex[index];

    // Parses a normal character and returns the corresponding Regular expression node.
    function parseNormal() {
        if ([LEFT_PAREN, RIGHT_PAREN, STAR, PIPE, DOT].includes(currentChar)) {
            return null;
        }
        let result = new Normal(currentChar);
        index++;
        currentChar = regex[index];
        return result;
    }

    // Parses the '.' character (which matches any character) and returns the corresponding Regular expression node.
    function parseAny() {
        if (currentChar !== DOT) {
            return null;
        }
        let result = new Any();
        index++;
        currentChar = regex[index];
        return result;
    }

    // Parses the '*' character (which matches zero or more characters) and returns the corresponding Regular expression node.
    function parseZeroOrMore() {
        let result = null;
        let subRegexp = null;
        if (currentChar === STAR) {
            index++;
            currentChar = regex[index];
            subRegexp = parseNormal() || parseAny();
            if (subRegexp !== null) {
                result = new ZeroOrMore(subRegexp);
            }
        }
        return result;
    }

    // Parses a sequence of Regular expressions and returns them as a sequence node.
    function parseStr() {
        let regexpList = [];
        while (currentChar !== undefined && currentChar !== PIPE && currentChar !== RIGHT_PAREN) {
            let subRegexp = null;
            let subZeroOrMore = null;

            if (currentChar === LEFT_PAREN) {
                index++;
                currentChar = regex[index];
                subRegexp = parseRegex(regex.slice(index));
                if (subRegexp === null) {
                    return null;
                }
                index += getLength(subRegexp.regexpList) + 1;
                currentChar = regex[index];
            } else {
                subRegexp = parseNormal() || parseAny();
                if (subRegexp === null) {
                    return null;
                }
                index++;
                currentChar = regex[index];
            }

            subZeroOrMore = parseZeroOrMore();
            if (subZeroOrMore !== null) {
                subRegexp = new Str([subRegexp, subZeroOrMore]);
            }
            regexpList.push(subRegexp);
        }
        return new Str(regexpList);
    }

    // Parses a sequence of Regular expressions separated by '|' and returns them as an or node.
    function parseOr() {
        let left = parseStr();
        if (left === null || currentChar !== PIPE) {
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

    // Returns the total length of a sequence of Regular expression nodes.
    function getLength(regexpList) {
        return regexpList.reduce((acc, val) => acc + val.regexpList.length, 0);
    }

    return parseOr();
}

console.log(parseRegex('abc')); // Str {regexpList: [Normal, Normal, Normal]}
console.log(parseRegex('a*b')); // Str {regexpList: [ZeroOrMore {regexp: Any}, Normal, Normal]}
console.log(parseRegex('a|b')); // Or {left: Normal {char: "a"}, right: Normal {char: "b"}}
console.log(parseRegex('a|bc*')); // Or { left: Normal {char: "a"},
// right: Str {regexpList: [Normal {char: "b"}, ZeroOrMore {regexp: Any}]}}

let result = parseRegex("a(b|c)*");
console.log(result); // Str {regexpList: [Normal, Str {regexpList: [Or {left: Normal {char: "b"}, right: Normal {char: "c"}}, ZeroOrMore {regexp: Any}]}]}