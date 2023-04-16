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

function parseRegex(regex) {
    let index = 0;
    let currentChar = regex[index];

    function parseNormal() {
        let normalChars = '';
        while ([LEFT_PAREN, RIGHT_PAREN, STAR, PIPE, DOT].indexOf(currentChar) === -1 && currentChar !== undefined) {
            normalChars += currentChar;
            index++;
            currentChar = regex[index];
        }
        if(normalChars) {
            return new Normal(normalChars);
        }
        return null;
    }

    function parseAny() {
        if (currentChar !== DOT) {
            return null;
        }
        let result = new Any();
        index++;
        currentChar = regex[index];
        return result;
    }

    function parseZeroOrMore() {
        let result = null;
        if (currentChar === STAR) {
            index++;
            currentChar = regex[index];
            const subRegexp = parseNormal() || parseAny();
            if (subRegexp !== null) {
                result = new ZeroOrMore(subRegexp);
            }
        }
        return result;
    }

    function parseStr() {
        const regexpList = [];
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
                } else {
                    index++;
                    currentChar = regex[index];
                }
            }

            subZeroOrMore = parseZeroOrMore();
            if (subZeroOrMore !== null) {
                subRegexp = new Str([subRegexp, subZeroOrMore]);
            }

            if (subRegexp.regexpList) {
                for (let sub of subRegexp.regexpList) {
                    regexpList.push(sub);
                }
            } else {
                regexpList.push(subRegexp);
            }
        }
        return regexpList.length > 0 ? new Str(regexpList) : null;
    }

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

    function getLength(regexpList) {
        return regexpList.reduce((acc, val) => acc + val.regexpList.length, 0);
    }

    return regex.length > 0 ? parseOr() : null;
}

console.log(parseRegex('abc')); // Str {regexpList: [Normal {char: 'a'} , Normal {char: 'b'}, Normal {char: 'c'}]}
console.log(parseRegex('a*b')); // Str {regexpList: [ZeroOrMore {regexp: Any}, Normal {char: 'b'},]}
console.log(parseRegex('a|b')); // Or {left: Normal {char: "a"}, right: Normal {char: "b"}}
console.log(parseRegex('a|bc*')); // Or { left: Normal {char: "a"},
// right: Str {regexpList: [Normal {char: "b"}, ZeroOrMore {regexp: Any}]}}

let result = parseRegex("a(b|c)*");
console.log(result); // Str {regexpList: [Normal {char: "a"}, Str {regexpList: [Or {left: Normal {char: "b"},
// right: Normal {char: "c"}}, ZeroOrMore {regexp: Any}]}]}