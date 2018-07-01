"use strict";
const
    Lexer = require('./lexer'),
    LexerNearley = require('./lexer-nearley'),
    Token = require('./token'),
    StringEnum = require('string-enum');

/**
 * @type {Object<string,string>}
 */
const tokenTypes = StringEnum('js_line', 'unmatched_char');

const lexer = new Lexer()
    .setUseUnicode(true)
    .setUnmatchedCharFn((match) => newToken(tokenTypes.unmatched_char, match))
    .addDefinitions(
        ['S', /\p{Zs}|\t/],         // SPACE
        ['N', /\n\r?|\r\n?/],       // NEWLINE
        ['ANYTHING', /.*/],
        ['SOMETHING', /\S.*/],
    )
    .addRules (

        // JS line statement
        [ /[$]@S+@@ANYTHING/, function (match = Lexer.Actions()) {
            return newToken (tokenTypes.js_line, match, match.info.groups.ANYTHING);
        }],

        // End of line comment
        [/[#]@S+@ANYTHING/, /*skip*/],

        // Unmatched spaces
        [/@S+/, /*skip*/],

        // EOL
        [/@N/, /*skip*/],

    );

function newToken(type = "", match = Lexer.Actions(), info = undefined) {
    return new Token (
        type,
        match.text,
        match.index,
        match.line,
        match.col,
        info,
    );
}


module.exports = new LexerNearley(
    lexer, tokenTypes, (token) => token instanceof Token, (token, source) => token.getMessage(source));
