"use strict";
/* istanbul ignore file */

const
    Lexer = require('./lexer'),
    LexerNearley = require('./lexer-nearley'),
    Token = require('./token'),
    tt = require('./token-types');

const lexer = new Lexer()
    .setUseUnicode(true)
    .setUnmatchedCharFn((match) => newToken(tt.unmatched_char, match))
    .addDefinitions(
        ['S', /\p{Zs}|\t/],         // SPACE
        ['N', /\n\r?|\r\n?/],       // NEWLINE
        ['SPACES', /[\s\t]+/],      // Not working...
        ['ANYTHING', /.*/],
        ['SOMETHING', /\S.*/],
    )
    .addRules (

        // JS line statement
        [ /[$](?<spaces>@S+)(?<jscode>.+)/, function (match = Lexer.Actions()) {
            const offset = match.info.groups.spaces.length + 1;
            const jscode = match.info.groups.jscode;
            return newToken (tt.js_line, match, {jscode, offset});
        }],

        // End of line comment
        [/[#]@S+@ANYTHING/, /*skip*/],

        // Unmatched spaces
        [/@S+/, /*skip*/],

        // EOL
        [/@N/, /*skip*/],

    );

function newToken(
    type = "",
    match = Lexer.Actions(),
    info = undefined
) {
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
    lexer, tt, (token) => token instanceof Token, (token, source) => token.getMessage(source));
