module.exports =
{
    countLines,
    countChar,
    nextPosition,
    sourceMapComment,
};

const Base64 = require('js-base64').Base64

/**
 * @param  {string} text
 * @returns {number} Number of lines of text (new line + 1)
 */
function countLines(text) {
    const nbNewLine = countChar(text, '\n')
    if (nbNewLine > 0) return nbNewLine + 1;
    else if(text.trim() === "") return 0
    else return 1;
}

/**
 * @param  {string} text
 * @param  {string} char
 * @returns {number} Number of occurences of char in string
 */
function countChar (text, char) {
    let result = 0;
    for(let i = 0; i < text.length; i++)
        if( text[i] === char[0]) result++;
    return result;
}

/**
 * Computes the next position {line, column} of a token from the position of a previous one.
 * Lines are counted starting at 1 and column starting at 0.
 */
function nextPosition ( /* istanbul ignore next: type hint */
    code = "",          /* istanbul ignore next: type hint */
    nextOffset = 0,     /* istanbul ignore next: type hint */
    prevOffset = 0,     /* istanbul ignore next: type hint */
    prevLine = 1,       /* istanbul ignore next: type hint */
    prevColumn = 0,
) {
    let line = prevLine, column = prevColumn;
    for( let offset = prevOffset; offset < nextOffset; offset++ ) {
        if(code[offset] === "\n") {
            column = 0;
            line ++;
        } else {
            column ++;
        }
    }
    return {line, column};
}

function sourceMapComment(sourceMap)
{
    if( typeof sourceMap === "object")
    {
        sourceMap = JSON.stringify(sourceMap);
    }
    const jsonMap = sourceMap;
    const base64Map = Base64.encode(jsonMap);
    return '//# sourceMappingURL=data:application/json;charset=utf-8;base64,' + base64Map;
}
