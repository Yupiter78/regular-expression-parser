const Normal = char => ({ type: "Normal", char });
const Any = () => ({ type: "Any" });
const ZeroOrMore = regexp => ({ type: "ZeroOrMore", regexp });

const Or = (left, right) => ({ type: "Or", left, right });

const Str = regexpList => ({ type: "Str", regexpList });

const parseRegExp = str => {
    if (!str) return null;

    const parse = (remaining, stack) => {
        if (isInvalidSyntax(remaining)) return null;

        if (!remaining) return stack[0];

        switch (remaining[0]) {
            case "(":
                const endIndex = findMatchingClosingParenIndex(remaining);
                const innerStr = remaining.slice(1, endIndex);
                const regexp = parse(innerStr, []);
                if (!regexp) return null;
                return parse(remaining.slice(endIndex + 1), [...stack, regexp]);

            case "|":
                if (isInvalidSyntax(stack)) return null;
                const left = stack.pop();
                const right = parse(remaining.slice(1), []);
                if (!right) return null;
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
                const normalObjects = sequence.split("").map(Normal);
                return parse(remaining.slice(sequence.length), [...stack, ...normalObjects]);
        }
    };

    return parse(str, []);
};

const isSpecialCharacter = char => "()|*.".indexOf(char) !== -1;

const isInvalidSyntax = stack => stack.length === 0 || stack[0].type === "Or";

const parseSequence = str => {
    let endIndex = 0;
    while (endIndex < str.length && !isSpecialCharacter(str[endIndex])) {
        endIndex++;
    }
    return str.slice(0, endIndex);
};

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

console.log(parseRegExp("LL2::L|nX'=_T*X460$.A)Q %i3or,(s~rOr+)nGsP2R"));
console.log(parseRegExp('*+\"6O_.*$~&\\'));