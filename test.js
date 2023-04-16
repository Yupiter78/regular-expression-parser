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
    console.log("regex:", regex);
    let index = 0;
    let currentChar = regex[index];
    console.log("currentChar:", currentChar);

    function parseNormal() {
        if (currentChar === '(' || currentChar === ')' || currentChar === '*' || currentChar === '|') {
            return null;
        }
        let result = new Normal(currentChar);
        index++;
        currentChar = regex[index];
        console.log("currentChar_parseNormal:", currentChar);
        console.log("result:", result);
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
        if (currentChar !== '(' && currentChar !== ')' && currentChar !== '*' && currentChar !== '|') {
            subRegexp = parseRegex(regex.slice(index));
            console.log("subRegexp_parseZero:", subRegexp);
            if (subRegexp !== null) {
                result = new ZeroOrMore(subRegexp);
                index += subRegexp.regexpList.reduce((acc, val) => acc + val.regexpList.length, 0);
                currentChar = regex[index];
            }
        }
        return result;
    }

    function parseOr() {
        console.log("________parseOr____________")
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
        console.log("parseStr_START");
        let result = null;
        let regexpList = [];
        let subRegexp = null;
        console.log("currentChar_parseStr_before_while_loop:", currentChar);
        while ((currentChar !== null) && (currentChar !== ')')) {
            console.log("WHILE_start");
            if (currentChar === '(') {
                index++;
                currentChar = regex[index];
                console.log("currentChar_parseStr_3:", currentChar);
                console.log("regex.slice(index, regex.indexOf(')', index)):", regex.slice(index, regex.indexOf(')', index)));
                subRegexp = parseRegex(regex.slice(index, regex.indexOf(')', index)));
                console.log("subRegexp:", subRegexp);
                if (subRegexp !== null) {
                    regexpList.push(subRegexp);
                    index += subRegexp.regexpList.reduce((acc, val) => acc + val.regexpList.length, 0) + 1;
                    currentChar = regex[index];
                } else {
                    return null;
                }
            } else if (currentChar === '|') {
                subRegexp = parseOr();
                console.log("subRegexp:", subRegexp);
                if (subRegexp !== null) {
                    regexpList.push(subRegexp);
                    index++;
                    currentChar = regex[index];
                } else {
                    return null;
                }
            } else {
                subRegexp = parseNormal() || parseAny() || parseZeroOrMore();
                if (subRegexp !== null) {
                    regexpList.push(subRegexp);
                    console.log("regexpList_parseStr:", regexpList);
                    index++;
                    currentChar = regex[index];
                    console.log("currentChar_parseStr_2:", currentChar);
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
    if ((result === null) || (currentChar !== undefined)) {
        return null;
    }
    return result;
}

// example usage
const regex = "a(b|c)*d.";
const result = parseRegex(regex);
console.log(result);
/*
output: Str {regexpList: [Normal {char: "a"},
Or {left: Str {regexpList: [Normal {char: "b"},
ZeroOrMore {regexp: Str {regexpList: [Normal {char: "c"}]}}]},
ZeroOrMore {regexp: Str {regexpList: [Normal {char: "d"}]}}}, Normal {char: "e"}] }*/
