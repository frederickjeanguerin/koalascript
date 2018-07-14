// Testing framework
const chai = require('chai');
const expect = chai.expect;
const should = chai.should(); void should;
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);

// Tested module
const { countLines, countChar, nextPosition, sourceMapComment } = require('../src/util');

// Useful
const convertSourceMap = require('convert-source-map');

describe('util', function() {

    it('#countChar', function() {
        countChar("", "a").should.be.eq(0);
        countChar("a", "a").should.eq(1);
        countChar("aaba bba \n a", "a").should.eq(5);
    });

    it('#countLines', function() {
        countLines("").should.eq(0);
        countLines("at Context.<anonymous> (C:\\Users\\fguerin\\source\\repos\\Koalalang\\test\\sys-error.spec.js:25:21)").should.eq(1);
        countLines("  aa ").should.eq(1);
        countLines(" \n ").should.eq(2);
        countLines("\n aa \n\n\n bb \n").should.eq(6);
    });

    it('#nextPosition', function() {
        expect(nextPosition()).eql({line:1, column:0});
        expect(nextPosition(" ")).eql({line:1, column:0});
        expect(nextPosition("   ", 3)).eql({line:1, column:3});
        expect(nextPosition("   \n\n   ", 8)).eql({line:3, column:3});
        expect(nextPosition("   \n\n   ", 8, 5)).eql({line:1, column:3});
        expect(nextPosition("   \n\n   ", 8, 5, 0, 0)).eql({line:0, column:3});
        expect(nextPosition("   \n\n   \n\n   ", 13, 5, 10, 10)).eql({line:12, column:3});
        expect(nextPosition(" ", 1, 0, 10, 20)).eql({line:10, column:21});
    });

    it('#sourceMapComment', function() {
        const sm = {
            version : 3,
            file: "out.js",
            sourceRoot : "",
            sources: ["foo.js", "bar.js"],
            names: ["src", "maps", "are", "fun"],
            mappings: "AAgBC,SAAQ,CAAEA"
        };
        const comment = sourceMapComment(sm);
        const otherComment = convertSourceMap.fromObject(sm).toComment();
        expect(comment).eq(otherComment);
    });

});
