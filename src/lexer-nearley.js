const Lexer = require('./lexer');

/**
 * This class is an adaptor between the Lexer and the Nearley parser.
 */

module.exports = class LexerNearley {

    constructor(
        lexer = new Lexer,
        tokenTypes = new Object,
        tokenIsValidFn = ((token) => (void token, true)),
        formatErrorFn = ((token, source = "") => (void source, token + "")),
    ){
        this.lexer = lexer;
        this.tokenIsValid = ((token) =>
            token.text && token.type && token.type in tokenTypes && tokenIsValidFn(token));
        this.tokenTypes = tokenTypes;
        this.formatErrorFn = formatErrorFn;
    }

    formatError(token, message = "")
    {
        if(this.tokenIsValid(token))
            return message + this.formatErrorFn(token, this.lexer.source);
        else
            throw new TypeError("invallid token");
    }

    has(tokenType)
    {
        return tokenType in this.tokenTypes;
    }

    // this is not a nearley interface function, but it is useful for testing purpose.
    lexAll(source)
    {
        return [...this.all(source)];
    }

    *all(source)
    {
        if(source !== undefined) this.reset(source);
        let token;
        while( (token = this.next()) !== undefined )
            yield token;
    }

    next()
    {
        let token = this.lexer.lex();
        if (token === undefined || this.tokenIsValid(token)) {
            return token;
        } else {
            throw TypeError("invalid token");
        }
    }

    reset(toSource = "", savedState)
    {
        this.lexer.reset(toSource, savedState);
    }

    save()
    {
        return this.lexer.getState();
    }

};
