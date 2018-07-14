module.exports = checkSyntax;

const assert = require('./sys-assert')
const SysSyntaxError = require('./sys-syntax-error')
const {nextPosition} = require('./util')

function checkSyntax(jscode, {sourceName = "checkSyntax", jscodeLine = 1, jscodeColumn = 0, assumeBrowser = false, throws = false} = {})
{
    // dont point to error on trailing spaces.
    jscode = jscode.trimEnd();
    const args = typeof window !== "undefined" || assumeBrowser ? inBrowser() : inNodeJs()
    if(!args) return false;
    const error = new SysSyntaxError(...args)
    if (throws) throw error;
    return error;

    function inNodeJs() {
        try
        {
            const vm = require('vm')
            new vm.Script(jscode, {filename:"filename"})
            return false;
        }
        catch(err)
        {
            assert(err.stack && err.stack.match(/SyntaxError/))
            let [,line, indent, length] = err.stack.match(/^filename:(\d+)\n.+\n(\s*)(\^+)/m)
            void length
            line = +line + jscodeLine - 1;
            const column = indent.length + (jscodeLine === line ? jscodeColumn : 0)
            return [err.message, sourceName, line, column + 1]
        }
    }

    function inBrowser()
    {
        // In the browser, there is no standard vm, and the stack trace doesnt point precisely to the error location.

        if(!errmsg(jscode)) return false;

        if( unexpectedEndOfInput(jscode) )
        {
            const {line, column} = nextPosition(jscode, jscode.length, 0, jscodeLine, jscodeColumn)
            return ["Unexpected end of input", sourceName, line, column]
        }

        const {line, column} = nextPosition(jscode, errorOffset(jscode), 0, jscodeLine, jscodeColumn)
        return [errmsg(jscode), sourceName, line, column]
    }

    function unexpectedEndOfInput(jscode) {
        return errmatch(jscode+"}", /unexpected.+\}/i)
        && errmatch(jscode+";", /unexpected.+;/i)
    }

    function errorOffset(jscode)
    {
        // we do a linear search for the error location which is costly
        // might be better to do a binary searh here one day...
        const message = errmsg(jscode);
        let offset = jscode.length;
        while( errmsg(jscode.slice(0,offset)) === message){
            offset --;
        }
        return offset + 1;
    }

    function errmatch(jscode, regex)
    {
        const msg = errmsg(jscode)
        return msg && regex.test(msg)
    }

    function errmsg(jscode)
    {
        try
        {
            new Function(jscode)
            return false;
        }
        catch(err)
        {
            return assert(err.message);
        }
    }
}



