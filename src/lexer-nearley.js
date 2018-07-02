const Lexer = require('./lexer');

/**
 * This class is an adaptor between the Lexer and the Nearley parser.
 */

module.exports = class LexerNearley {

    constructor(                                                    /* istanbul ignore next: type hint */
        lexer = new Lexer,                                          /* istanbul ignore next: type hint */
        tokenTypes = new Object,
        isValidTokenFn = ((token) => (void token, true)),
        formatErrorFn = ((token, source = "") => (void source, token.text + "")),
    ){
        this.lexer = lexer;
        this.isValidToken = ((token) =>
            token instanceof Object && token.text && token.type && token.type in tokenTypes && isValidTokenFn(token));
        this.tokenTypes = tokenTypes;
        this.formatErrorFn = formatErrorFn;
    }

    /**
     * @param  {any} token A valid token
     * @param  {string} message
     * @return {string} an error message.
     *
     * NB Not sure yet when this function gets called by the Nearley parser. Maybe when in standalone mode.
     */
    formatError(token, message = "")
    {
        if(this.isValidToken(token))
            return message + this.formatErrorFn(token, this.lexer.source);
        else
            throw new TypeError("invallid token");
    }

    /**
     * @param  {string} tokenType
     * @return {boolean} true if this is a valid token type.
     *
     * NB. Token types are passed to the constructor and must be an Basic Object or a compatible Enum type like `StringEnum`. The test is made with the `in` operator.
     */
    has(tokenType)
    {
        return tokenType in this.tokenTypes;
    }

    /**
     * @param  {?string} source Source code to parse. If no source specified, the source already attached to the parser will be used.
     * @return {any[]} Array of all parsed and valid tokens
     *
     * NB this is not a nearley interface function, but is useful for testing purpose.
     */
    lexAll(source = undefined){
        return [...this.allTokens(source)];
    }

    /**
     * @param  {?string} source Source code to parse. If no source specified, the source already attached to the parser will be used.
     * @yield  {any} Yield all parsed and valid tokens, one by one.
     *
     * NB this is not a nearley interface function, but might be otherwise useful.
     */
    *allTokens(source = undefined)
    {
        if(source !== undefined) this.reset(source);
        let token;
        while( (token = this.next()) !== undefined )
            yield token;
    }

    /**
     * @returns {any} a valid token or undefined if end of file reached.
     */
    next()
    {
        let token = this.lexer.lex();
        if (token === undefined || this.isValidToken(token)) {
            return token;
        } else {
            throw TypeError("invalid token");
        }
    }

    /**
     * @param  {string} toSource Source code to lex afterward.
     * @param  {string} savedState As returned by the `save()` method.
     *
     * This method gets called by Nearley at parser initialisation or ???.
     * It works together with the `save()` method.
     */
    reset(toSource, savedState)
    {
        this.lexer.reset(toSource, savedState);
    }

    /**
     * @return {string} A state to be used by the `reset()` method.
     */
    save()
    {
        return this.lexer.getState();
    }

};
