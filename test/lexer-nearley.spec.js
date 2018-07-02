const chai = require('chai');
const expect = chai.expect;

const Lexer = require('../src/lexer');
const LexerNearley = require('../src/lexer-nearley');
const Token = require('../src/token');

describe('Lexer-Nearley', function () {
    it('#constructor - default', function () {

        const lex = new LexerNearley;
        expect(lex.lexer).instanceOf(Lexer);

        const token = new Token("a", "dummy", 10, 1, 10);
        expect(lex.isValidToken(token)).false;
        expect(()=>lex.formatError(token)).throw(TypeError);

        expect(lex.lexAll()).eql([]);
        // const tokenTypes = {a:'a', b:'b'};
    });

    it('#constructor - with token types', function () {
        const tokenTypes = {a:'a', b:'b'};
        const lex = new LexerNearley(new Lexer(), tokenTypes);
        const token = new Token("a", "dummy", 10, 1, 10);
        expect(lex.isValidToken(token)).true;
        expect(lex.formatError(token)).match(/dummy/);
    });

});
