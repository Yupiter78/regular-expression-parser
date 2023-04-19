const Normal = char => ({ type: "Normal", char });
const Any = () => ({ type: "Any" });
const ZeroOrMore = regexp => ({ type: "ZeroOrMore", regexp });

const Or = (left, right) => ({ type: "Or", left, right });

const Str = regexpList => ({ type: "Str", regexpList });

// const parseSequence = str => {
//     const match = str.match(/^[^()|*.]+/);
//     return match ? match[0] : '';
// };

const parseSequence = str => {
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
};

const parseRegExp = str => {
    if (!str) return null;

    const stack = [];
    let current = { type: 'Str', regexpList: [] };

    for (let i = 0; i < str.length; i++) {
        const char = str[i];

        switch (char) {
            case '(':
                const endIndex = findMatchingClosingParenIndex(str, i);
                if (endIndex === null) return null; // unmatched opening paren
                const innerStr = str.slice(i + 1, endIndex);
                const innerRegexp = parseRegExp(innerStr);
                if (!innerRegexp) return null;
                if (current.type === 'Normal') {
                    current = { type: 'Str', regexpList: [current] };
                }
                current.regexpList.push(innerRegexp);
                i = endIndex;
                break;

            case '|':
                if (current.type === 'Normal') {
                    current = { type: 'Str', regexpList: [current] };
                }
                stack.push(current);
                current = { type: 'Str', regexpList: [] };
                break;

            case '*':
                if (current.type === 'Normal') {
                    current = { type: 'ZeroOrMore', regexp: current };
                } else {
                    return null; // invalid syntax
                }
                break;

            case '.':
                if (current.type === 'Normal') {
                    current = { type: 'Any' };
                } else {
                    return null; // invalid syntax
                }
                break;

            default:
                const sequence = parseSequence(str.slice(i));
                const normalObjects = sequence.split('').map(char => ({ type: 'Normal', char }));
                if (current.type === 'Normal') {
                    current = { type: 'Str', regexpList: [current] };
                }
                current.regexpList.push(...normalObjects);
                i += sequence.length - 1;
        }

        while (stack.length > 0 && i === str.length - 1) {
            const prev = stack.pop();
            if (prev.type !== 'Str') {
                return null; // invalid syntax
            }
            prev.regexpList.push(current);
            current = prev;
        }
    }

    if (stack.length > 0) {
        return null; // unmatched opening '|'
    }

    if (isInvalidSyntax(current)) {
        return null; // invalid syntax
    }

    return current;
};

// const isSpecialCharacter = char => "()|*.".indexOf(char) !== -1;

const isInvalidSyntax = stack => {
    console.log("stack:", stack);
    return stack.length === 0 || stack[0].type === "Or";
}


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
console.log(parseRegExp("(d.((.|(p*.|(g*|.)))|q.*)*|v)*"));
console.log(parseRegExp('abc')); // Str {regexpList: [Normal {char: 'a'} , Normal {char: 'b'}, Normal {char: 'c'}]}
console.log(parseRegExp('a*b')); // Str {regexpList: [ZeroOrMore {regexp: Any}, Normal {char: 'b'},]}
console.log(parseRegExp('a|b')); // Or {left: Normal {char: "a"}, right: Normal {char: "b"}}
console.log(parseRegExp('a|bc*')); // Or { left: Normal {char: "a"},
// right: Str {regexpList: [Normal {char: "b"}, ZeroOrMore {regexp: Any}]}}