const chai = require('chai');
const expect = chai.expect;

const Token = require('../src/token');

describe('Token', function() {

    it('#constructor', function() {
        expect(()=> new Token(undefined, "word", 10)).throw(/invalid argument/i);
        expect(()=> new Token("type", undefined, 10)).throw(/invalid argument/i);
        expect(()=> new Token("type", "word", -3)).throw(/invalid argument/i);
    });



    it('#getPosition', function() {
        const word = 'koala';
        const source = ` coco \n\n    ${word} `;
        const token = new Token('WORD', word, source.indexOf(word));
        const pos = token.getPosition(source);
        expect(pos).eql({ line: 3, col: 5, lineIndex: 8 });
        expect(()=>token.getPosition('')).throw(/not in source/);
    });

    it('#getMessage (no truncations)', function() {
        const word = 'koala';
        const source = `+ coco \n\n+\t + +${word}+`;
        const token = new Token('WORD', word, source.indexOf(word));
        const msg = token.getMessage(source);
        expect(msg).match(/3.*7/).match(/koala/).match(/\^{5}/);
    });

});
