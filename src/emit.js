module.exports = emit;

const
    jsgen = require('./jsgen'),
    Token = require("./token"),
    tt = require('./token-types'),
    SysSyntaxError = require('./sys-syntax-error'),
    {SourceNode} = require('source-map'),
    ____end_const = undefined;

function emit(              /* istanbul ignore next: type hint */
    stmts = [new Token()],  /* istanbul ignore next: type hint */
    kcode = "",             /* istanbul ignore next: type hint */
    sourceName = "",
){
    const errors = [];
    const mainSourceNode = new SourceNode(1, 0, sourceName);
    mainSourceNode.setSourceContent(sourceName, kcode);
    for ( let stmt of stmts ) {

        const token = stmt;

        try {

            switch(token.type) {

                case tt.js_line:
                    mainSourceNode.add(js_line(token)).add(";");
                    break;

                /* istanbul ignore next */
                default:
                    // *This is a developper error, not a user error
                    throw Error(`Unrecognized token type '${token.type}'`);
            }
        }
        catch(err)
        {
            if(err instanceof SysSyntaxError) {
                errors.push(err);
            } else {
                throw err;
            }
        }
    }

    const {code, map} = mainSourceNode.toStringWithSourceMap({file:sourceName});

    return {
        jscode: code,
        jsonSourceMap: map.toString(),
        errors
    };

    // ------ Functions -----------

    function js_line(token = new Token)
    {
        return jsgen(token.info.jscode, sourceName, token.line, token.column + token.info.offset);
    }
}
