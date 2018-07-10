module.exports = jsgen;

const {default:jsTokens} = require("js-tokens");
const {SourceNode} = require('source-map');
const {throwsSyntax} = require('./jscheck');


function jsgen (jscode, sourceName, lineOffset = 0, columnOffset = 0)
{
    if(throwsSyntax(jscode))
    {
        throw new TypeError("js code should be valid here");
    }

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

