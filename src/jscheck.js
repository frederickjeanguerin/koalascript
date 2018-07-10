module.exports = { checkSyntax, assertSyntax };

const vm = require('vm')
const assert = require('./sys-assert')
const SysSyntaxError = require('./sys-syntax-error')

function assertSyntax(jscode, sourceName, lineOffset = 0, columnOffset = 0)
{
    try
    {
        new vm.Script(jscode, {filename:"filename"})
    }
    catch(err)
    {
        assert(err.stack && err.stack.match(/SyntaxError/))
        let [,line, indent, length] = err.stack.match(/^filename:(\d+)\n.+\n(\s*)(\^+)/m)
        void length
        line = +line + lineOffset;
        const column = indent.length + (lineOffset > 0 ? 0 : columnOffset)
        throw new SysSyntaxError(err.message, sourceName, line, column + 1)
    }
}

function checkSyntax(jscode, sourceName, lineOffset, columnOffset)
{
    try
    {
        assertSyntax(jscode, sourceName, lineOffset, columnOffset)
        return false;
    }
    catch(err)
    {
        return err;
    }
}

