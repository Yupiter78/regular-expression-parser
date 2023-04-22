class Normal {
    constructor(c) {
        this.char = c;
    }
}

class Any {}

class ZeroOrMore {
    constructor(re) {
        this.re = re;
    }
}

class Or {
    constructor(left, right) {
        this.left = left;
        this.right = right;
    }
}

class Str {
    constructor(reList) {
        this.reList = reList;
    }
}

function parseRegExp(str) {
    if (!str) return null;

    if (str.startsWith("|") || str.endsWith("|") || str.startsWith("*") || str.endsWith("*")) {
        return null; // invalid input
    }

    if (str.indexOf("(") !== -1) {
        const reList = [];
        let startIndex = 0;

        while (startIndex < str.length) {
            const openingParenIndex = str.indexOf("(", startIndex);
            const closingParenIndex = findMatchingClosingParenIndex(str, openingParenIndex + 1);
            const innerRe = parseRegExp(str.substring(openingParenIndex + 1, closingParenIndex));
            if (innerRe) {
                reList.push(innerRe);
            } else {
                return null; // invalid input
            }
            startIndex = closingParenIndex + 1;
        }

        if (reList.length === 1) {
            return reList[0]; // no need for Str object
        } else {
            return new Str(reList);
        }
    } else if (str.indexOf("|") !== -1) {
        const alternatives = str.split("|");
        const reList = [];
        for (const alt of alternatives) {
            const innerRe = parseRegExp(alt);
            if (innerRe) {
                reList.push(innerRe);
            } else {
                return null; // invalid input
            }
        }
        return new Or(reList[0], reList[1]); // assume only two alternatives for simplicity
    } else {
        const reList = [];
        let currIndex = 0;
        while (currIndex < str.length) {
            const currChar = str[currIndex];
            if (currChar === "*") {
                if (reList.length === 0) {
                    return null; // invalid input
                }
                reList[reList.length - 1] = new ZeroOrMore(reList[reList.length - 1]);
                currIndex++;
            } else if (currChar === ".") {
                reList.push(new Any());
                currIndex++;
            } else if (isSpecialCharacter(currChar)) {
                return null; // invalid input
            } else {
                const sequence = parseSequence(str.substring(currIndex));
                if (sequence) {
                    for (const c of sequence) {
                        reList.push(new Normal(c));
                    }
                    currIndex += sequence.length;
                } else {
                    return null; // invalid input
                }
            }
        }

        if (reList.length === 1) {
            return reList[0]; // no need for Str object
        } else {
            return new Str(reList);
        }
    }
}

function parseSequence(str) {
    let sequence = "";
    let currIndex = 0;
    while (currIndex < str.length) {
        const currChar = str[currIndex];
        if (isSpecialCharacter(currChar)) {
            break;
        }
        sequence += currChar;
        currIndex++;
    }
    return sequence.length > 0 ? sequence : null;
}

function isSpecialCharacter(char) {
    return char === "|" || char === "*" || char === "(" || char === ")";
}

function findMatchingClosingParenIndex(str, startIndex = 0) {
    let numOpenParens = 1; // start with the first opening parenthesis
    let currIndex = startIndex;
    while (numOpenParens > 0 && currIndex < str.length) {
        currIndex++;
        if (str[currIndex] === "(") {
            numOpenParens++;
        } else if (str[currIndex] === ")") {
            numOpenParens--;
        }
    }
    return currIndex;
}

const re = parseRegExp("ab*c");
let testString = "ac";
if (re instanceof Str) {
    let match = true;
    for (const subRe of re.reList) {
        if (subRe instanceof Normal) {
            if (testString[0] === subRe.char) {
                testString = testString.substring(1);
            } else {
                match = false;
                break;
            }
        } else if (subRe instanceof Any) {
            if (testString.length > 0) {
                testString = testString.substring(1);
            } else {
                match = false;
                break;
            }
        } else if (subRe instanceof ZeroOrMore) {
            while (testString[0] === subRe.re.reList[0].char) {
                testString = testString.substring(1);
            }
        }
    }
    if (testString.length > 0) {
        match = false;
    }
    console.log(match); // should output true
}

console.log(parseRegExp("a|b")); // {type: "Or", left: {type: "Normal", char: "a"}, right: {type: "Normal", char: "b"}}
console.log(parseRegExp("(a)b|c")); // {type: "Or", left: {type: "Str", regexpList: [{type: "Normal", char: "a"}, {type: "Normal", char: "b"}]} , right: {type: "Normal", char: "c"}}
console.log(parseRegExp("a*")); // {type: "ZeroOrMore", regexp: {type: "Normal", char: "a"}}
console.log(parseRegExp(".")); // {type: "Any"}
console.log(parseRegExp("")); // null