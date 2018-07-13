module.exports = checkSyntax;

const vm = require('vm')
const assert = require('./sys-assert')
const SysSyntaxError = require('./sys-syntax-error')

function checkSyntax(jscode, sourceName, lineOffset = 0, columnOffset = 0)
{
    try
    {
        new vm.Script(jscode, {filename:"filename"})
        return false;
    }
    catch(err)
    {
        assert(err.stack && err.stack.match(/SyntaxError/))
        let [,line, indent, length] = err.stack.match(/^filename:(\d+)\n.+\n(\s*)(\^+)/m)
        void length
        line = +line + lineOffset;
        const column = indent.length + (lineOffset > 0 ? 0 : columnOffset)
        return new SysSyntaxError(err.message, sourceName, line, column + 1)
    }
}


