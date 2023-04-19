const Normal = char => ({ type: "Normal", char });
const Any = () => ({ type: "Any" });
const ZeroOrMore = regexp => ({ type: "ZeroOrMore", regexp });

const Or = (left, right) => ({ type: "Or", left, right });

const Str = regexpList => ({ type: "Str", regexpList });

const parseRegExp = str => {
    console.log("typeof str", typeof str);
    console.log("str:", str);
    if (!str) return null;

    const parse = (remaining, stack = []) => {
        console.log("------------START------------");
        console.log("remaining_before_isInvalidSyntax:", remaining);
        console.log("typeof remaining_before_isInvalidSyntax:", typeof remaining);
        console.log("stack_Parse:", stack);
        console.log("stack[0]:", stack[0]);
        console.log("stack[0].type:", stack[0]?.type);

        if (isInvalidSyntax(remaining)) return null;
        console.log("____remaining_After_____:", remaining);

        if (!remaining) return stack[0];

        switch (remaining[0]) {
            case "(":
                const endIndex = findMatchingClosingParenIndex(remaining);
                const innerStr = remaining.slice(1, endIndex);
                const regexp = parse(innerStr);
                if (!regexp) return null;
                return parse(remaining.slice(endIndex + 1), [...stack, regexp]);

            case "|":
                console.log("||||||||||||||");
                if (isInvalidSyntax(stack)) return null;
                const left = stack.pop();
                console.log("left:", left);
                console.log(`_____${remaining}_Or.slice(1):`, remaining.slice(1));

                const right = parse(remaining.slice(1));
                console.log("right:", right);
                if (!right) return null;
                console.log("stack_Or:", stack);
                return parse("", [...stack, Or(left, right)]);

            case "*":
                if (isInvalidSyntax(stack)) return null;
                const prevRegExp = stack.pop();
                const modifiedRegExp = ZeroOrMore(prevRegExp);
                return parse(remaining.slice(1), [...stack, modifiedRegExp]);

            case ".":
                return parse(remaining.slice(1), [...stack, Any()]);

            default:
                const sequence = parseSequence(remaining);
                console.log("sequence_Parse:", sequence);
                console.log(`sequence_____${remaining}.slice(${sequence.length}):`, remaining.slice(sequence.length));

                const normalObjects = sequence.split("").map(Normal);

                return parse(remaining.slice(sequence.length), [...stack, ...normalObjects]);
        }
    };

    return parse(str);
};

const isSpecialCharacter = char => "()|*.".indexOf(char) !== -1;

const isInvalidSyntax = stack => {
    console.log("1_stack.length_isInvalidSyntax:", stack.length);
    console.log("2_stack_isInvalidSyntax:", stack);
    console.log("3_stack[0]_isInvalidSyntax:", stack[0]);
    console.log(`4_____${stack.length} === 0 || ${stack[0]?.type} === "Or"`, stack.length === 0 || stack[0].type === "Or");
    return stack.length === 0 || stack[0].type === "Or";
}

const parseSequence = str => {
    let endIndex = 0;
    while (endIndex < str.length && !isSpecialCharacter(str[endIndex])) {
        endIndex++;
    }
    return str.slice(0, endIndex);
};

/*const parseSequence = str => {
    let result = '';
    let i = 0;

    while (i < str.length && !isSpecialChar(str[i])) {
        result += str[i];
        i++;
    }

    return result;
};

const isSpecialChar = char => {
    switch (char) {
        case '(':
        case ')':
        case '|':
        case '*':
        case '.':
            return true;
        default:
            return false;
    }
};*/

/*const parseSequence = str => {
    const match = str.match(/^[^()|*.]+/);
    return match ? match[0] : '';
};*/
const findMatchingClosingParenIndex = (str, startIndex = 0) => {
    let count = 1;
    for (let i = startIndex + 1; i < str.length; i++) {
        if (str[i] === "(") {
            count++;
        } else if (str[i] === ")") {
            count--;
            if (count === 0) {
                return i;
            }
        }
    }
    return null;
};

// console.log(parseRegExp("LL2::L|nX'=_T*X460$.A)Q %i3or,(s~rOr+)nGsP2R"));
// console.log(parseRegExp('*+\"6O_.*$~&\\'));

console.log(parseRegExp("a"))