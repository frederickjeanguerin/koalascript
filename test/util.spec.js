// Testing framework
const chai = require('chai');
const expect = chai.expect;
const should = chai.should(); void should;
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);

// Tested module
const { countLines, countChar, nextPosition } = require('../src/util');

describe('util', function() {

    it('#countChar', function() {
        countChar("", "a").should.be.eq(0);
        countChar("a", "a").should.eq(1);
        countChar("aaba bba \n a", "a").should.eq(5);
    });

    it('#countLines', function() {
        countLines("").should.eq(1);
        countLines("  aa ").should.eq(1);
        countLines(" \n ").should.eq(2);
        countLines("\n aa \n\n\n bb \n").should.eq(6);
    });

    it('#nextPosition', function() {
        expect(nextPosition()).eql({line:1, col:1});
        expect(nextPosition(" ")).eql({line:1, col:1});
        expect(nextPosition("   ", 3)).eql({line:1, col:4});
        expect(nextPosition("   \n\n   ", 8)).eql({line:3, col:4});
        expect(nextPosition("   \n\n   ", 8, 5)).eql({line:1, col:4});
        expect(nextPosition("   \n\n   ", 8, 5, 0, 0)).eql({line:0, col:3});
        expect(nextPosition("   \n\n   \n\n   ", 13, 5, 10, 10)).eql({line:12, col:4});
    });

});
