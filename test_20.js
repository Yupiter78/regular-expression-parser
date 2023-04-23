class Normal {
    #char;
    type = "Normal";
    constructor(char) {
        this.#char = char;
    }
    get char() {
        return this.#char;
    }
}

class Any {
    type = "Any";
    constructor() {}
}

class ZeroOrMore {
    #regexp;
    type = "ZeroOrMore";
    constructor(regexp) {
        this.#regexp = regexp;
    }
    get regexp() {
        return this.#regexp;
    }
}

class Or {
    type = "Or";
    constructor(left, right) {
        this.left = left;
        this.right = right;

    }
}
class Str {
    type = "Str";
    constructor(regexpList){
        this.regexpList = regexpList;
    }
}

function isSpecialCharacter(char) {
    return "()|*.".includes(char);
}

function isInvalidSyntax(stack) {
    const lastElement = stack[stack.length - 1];
    return !stack.length || lastElement.type === "Or";
}

function parseSequence(subStr) {

   for (let specialIndex = 0; specialIndex < subStr.length; specialIndex++) {
        if (isInvalidSyntax(specialIndex)) return subStr.slice(0, specialIndex);

    }
}

function findMatchingClosingParenIndex(subStr, startIndex = 0) {
    //console.log({subStr, startIndex});
    let count = 1;
    for (let i = startIndex; i < subStr.length; i++) {
        if (subStr[i] === "(") {
            count++;
        } else if (subStr[i] === ")") {
            //console.log({i});
            count--;
            //console.log({count});
            if (count === 0) {
                return i;
            }
        }
    }
    return null;
}

function parseRegExr(str) {
    let currentIndex = 0;
    function parse(subStr, stack = []) {
        console.log(subStr);
        if (subStr) return null;
        const currentChar = subStr[0];

        //console.log({subStr, index});
        console.log({currentChar});
        if (currentChar === "(") {
            const closingParenIndex = findMatchingClosingParenIndex(subStr);
            if (closingParenIndex === null) {
                return null;
            }
            console.log({closingParenIndex});
            const subExp = parse(str.slice(currentIndex + 1, closingParenIndex));

            if (isInvalidSyntax(subExp)) {
                return null;
            }
            console.log("____________________________")
            stack.push(new Str(subExp));
            console.log(JSON.stringify(stack, null, 2));
            return parse(str.slice(closingParenIndex + 1));
        } else if (currentChar === "|") {
            const left = stack.pop();
            console.log({left});
            const right = parse(subStr.slice(1));
            console.log({right});
            if (isInvalidSyntax([left, right])) {
                return null;
            }
            stack.push(new Or(left, right));
            return parse(str.slice(subStr.length));
        } else if (currentChar === "*") {
            const prev = stack.pop();
            if (!prev) {
                return null;
            }
            stack.push(new ZeroOrMore(prev));
            return parse(str.slice(subStr.length));
        } else if (currentChar === ".") {
            stack.push(new Any());
            return parse(str.slice());
        } else {
            const sequence = parseSequence(subStr);
            //console.log({sequence, endIndex});
            const regexpList = [];
            for (const char of sequence) {
                regexpList.push(new Normal(char));
            }
            if (regexpList.length === 1) {
                stack.push(new Str(regexpList[0]));
            } else if (regexpList.length > 1) {
                stack.push(new Str(regexpList));
            }
            return parse(subStr.slice(subStr.at(-1)));
        }
        return stack[0];
    }
}


//console.log(parse("a|b")); // {type: "Or", left: {type: "Normal", char: "a"}, right: {type: "Normal", char: "b"}}
console.log(parse("(a)b|c")); // {type: "Or", left: {type: "Str", regexpList: [{type: "Normal", char: "a"}, {type: "Normal", char: "b"}]} , right: {type: "Normal", char: "c"}}
// console.log(parse("a*")); // {type: "ZeroOrMore", regexp: {type: "Normal", char: "a"}}
// console.log(parse(".")); // {type: "any"}
// console.log(parse("")); // null
