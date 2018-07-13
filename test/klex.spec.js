const chai = require('chai');
const expect = chai.expect;

const klex = require('../src/klex');
const TT = klex.tokenTypes;
const samples = require('../src/samples');

function lexall(input){
    return klex.lexAll(input);
}

function lexallTypes(input){
    return lexall(input).map(token => token.type);
}

describe('klex', function() {

    it('#has', function() {
        expect(klex.has('js_line'));
        expect(!klex.has("NOT A SYMBOL"));
    });

    it('Empty programs should lex nothing', function() {
        expect(lexall(``).length).eq(0);
        expect(lexall(` \t `).length).eq(0);
        expect(lexall(` \n\n\n  \n\n `).length).eq(0);
    });

    it('Full Line comments should lex nothing', function() {
        expect(lexall(`# comment`).length).eq(0);
        expect(lexall(`\n# comment \n\n`).length).eq(0);
        expect(lexall(` # comment \n\n # comment`).length).eq(0);
        expect(lexall(`# comment###comment #comment`).length).eq(0);
    });

    it('Full Line JS should lex JS code', function() {
        const jscode = "console.log('Hello the world')";
        const jsstmt = `$ ${jscode}`;
        const tokens = lexall("  " + jsstmt);
        expect(tokens.length).eq(1);
        expect(tokens[0].type).eq(TT.js_line);
        expect(tokens[0].text).eq(jsstmt);
        expect(tokens[0].index).eq(2);
        expect(tokens[0].info.jscode).eq(jscode);
    });

    it('Unexpected characters should lex an error token', function() {
        const unmatchedChar = "¸";
        const kcode = ` ${unmatchedChar}   ${unmatchedChar}${unmatchedChar}  `;

        expect(lexallTypes(kcode)).eql(
            Array(3).fill(TT.unmatched_char));

        expect(lexall(kcode)[0]).eql({
            type: TT.unmatched_char,
            text: unmatchedChar,
            index: 1,
            col: 2,
            line: 1,
            info: undefined
        });
    });

    it('Program JS + Comments', function() {
        const program = samples.kcode.helloWorld;
        const types = lexallTypes(program);
        expect(types).eql([TT.js_line, TT.js_line]);
    });


});
