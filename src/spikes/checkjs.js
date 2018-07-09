/**
 * This module is an attempt to check JS syntax in a simple way.
 * With compatibility across all Browser and NodeJs
 * The error message should be able to point to the token.
 * Alas no line and column indicate where the error occurs (except Firefox)
 * and IE even not tell which token is problematic.
 * Checking syntax with an independent parser like Acorn is probably better.
 */

if (typeof exports === 'undefined')
{
    exports = window.checkjs = {};
}

exports.validateExpr = function(jscode) {
    try
    {
        new Function("(\n" + jscode + "\n)");
        return true;
    }
    catch(err)
    {
        return false;
    }
};

exports.validateStmt = function(jscode) {
    try
    {
        new Function(jscode);
        return true;
    }
    catch(err)
    {
        return false;
    }
};
