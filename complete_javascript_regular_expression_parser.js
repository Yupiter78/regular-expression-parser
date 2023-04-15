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
            if (subRegexp !== null) {
                result = new ZeroOrMore(subRegexp);
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
        console.log("parseStr");
        let result = null;
        let regexpList = [];
        let subRegexp = null;
        console.log("currentChar_parseStr:", currentChar);
        while (currentChar !== null && currentChar !== ')' && currentChar !== '|' && currentChar !== '*') {
            if (currentChar === '(') {
                index++;
                currentChar = regex[index];
                console.log("currentChar_parseStr_3:", currentChar);
                subRegexp = parseRegex(regex.slice(index));
                if (subRegexp !== null) {
                    regexpList.push(subRegexp);
                    currentChar = regex[index];
                } else {
                    return null;
                }
            } else {
                subRegexp = parseNormal() || parseAny();
                if (subRegexp !== null) {
                    regexpList.push(subRegexp);
                    console.log("regexpList_parseStr:", regexpList);
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
    if (result === null || currentChar !== null) {
        return null;
    }
    return result;
}

const regex = "a(b|c)*";

const ast = parseRegex(regex);

console.log(ast);
/*Str {
  regexpList: [
    Normal { char: 'a' },
    ZeroOrMore {
      regexp: Or {
        left: Normal { char: 'b' },
        right: Normal { char: 'c' }
      }
    }
  ]
}*/