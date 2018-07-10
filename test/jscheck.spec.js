const chai = require('chai')
chai.should()

const {throwsSyntax} = require('../src/jscheck')
const SysSyntaxError = require('../src/sys-syntax-error')

describe('jscheck', function() {

    it('#checkSyntax', function() {
        throwsSyntax("").should.be.false
        throwsSyntax("1 + 2").should.be.false
        throwsSyntax("1 +").should.be.instanceOf(SysSyntaxError)
        throwsSyntax("1 +").line.should.eq(1)
        throwsSyntax("\n1 +").line.should.eq(2)
        throwsSyntax("1 +").column.should.eq(3)
        throwsSyntax("1 +").message.should.match(/unexpected end of input/i)
        throwsSyntax("1 +", "mySource").sourceName.should.eq("mySource")
        throwsSyntax("1 +", "mySource", 100).line.should.eq(101)
        throwsSyntax("1 +", "mySource", 0, 200).column.should.eq(203)
        throwsSyntax("1 +", "mySource", 100, 200).column.should.eq(3)
    });

});
