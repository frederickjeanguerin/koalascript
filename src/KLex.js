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
    .setUnmatchedCharFn((char, index, source) => new Token(tokenTypes.unmatched_char, char, index))
    .addDefinitions(
        ['S', /\p{Zs}|\t/],         // SPACE
        ['N', /\n\r?|\r\n?/],       // NEWLINE
        ['ANYTHING', /.*/],
        ['SOMETHING', /\S.*/]
    )
    .addRules (

        // JS line statement
        [ /@S*(?<JS_LINE>[$]@S+@@ANYTHING)/, function (match) {
            const text = match.info.groups.JS_LINE;
            return new Token (
                tokenTypes.js_line,
                text,
                match.index - text.length,
                match.info.groups.ANYTHING,
                );
        }],

        // Full line comment
        [/@S*[#]@S+@ANYTHING/, /*skip*/],

        // Unmatched spaces
        [/@S+/, /*skip*/],

        // EOL
        [/@N/, /*skip*/],

    );

module.exports = new LexerNearley(
    lexer, tokenTypes, (token) => token instanceof Token, (token, source) => token.getMessage(source));
