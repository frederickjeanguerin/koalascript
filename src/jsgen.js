module.exports = jsgen;

const {default:jsTokens} = require("js-tokens");
const {SourceNode} = require('source-map');
const checkSyntax = require('./jscheck');
/**
 * Generate the source nodes for the given JS code.
 * If there is a JS syntax error, throws that error.
 *
 * @param  {string} jscode
 * @param  {string} sourceName
 * @param  {int} lineOffset
 * @param  {int} columnOffset
 * @returns {SourceNode}
 */
function jsgen (jscode, sourceName, lineOffset, columnOffset)
{
    const error = checkSyntax(jscode);
    if(error) throw error;

    const tokens = jscode.match(jsTokens);

    const pos =
    {
        line: lineOffset + 1,
        column: columnOffset
    }

    const jsnode = new SourceNode(pos.line, pos.column, sourceName);

    for(const token of tokens)
    {
        jsnode.add(shouldNotMap(token) ?
            token : new SourceNode(pos.line, pos.column, sourceName, token))
        updatePos(token, pos)
    }

    return jsnode;

    function shouldNotMap(token) {
        return  token.startsWith("//")  // line comment
            || token.startsWith("/*")   // multi-line comment
            || token.trim() === "";     // white spaces
    }

    function updatePos(token, pos)
    {
        const lines = token.split("\n");
        const lastLine = lines.pop();
        const addedLines = lines.length;
        if (addedLines) {
            pos.line += addedLines;
            pos.column = lastLine.length;
        } else {
            pos.column += lastLine.length;
        }
    }
}

