const chai = require('chai')
chai.should()

const {checkSyntax} = require('../src/jscheck')
const {KSyntaxError} = require('../src/kerror')

describe('checkjs', function() {

    it('#checkSyntax', function() {
        checkSyntax("").should.be.false
        checkSyntax("1 + 2").should.be.false
        checkSyntax("1 +").should.be.instanceOf(KSyntaxError)
        checkSyntax("1 +").line.should.eq(1)
        checkSyntax("\n1 +").line.should.eq(2)
        checkSyntax("1 +").column.should.eq(3)
        checkSyntax("1 +").message.should.match(/unexpected end of input/i)
        checkSyntax("1 +", "mySource").sourceName.should.eq("mySource")
        checkSyntax("1 +", "mySource", 100).line.should.eq(101)
        checkSyntax("1 +", "mySource", 0, 200).column.should.eq(203)
        checkSyntax("1 +", "mySource", 100, 200).column.should.eq(3)
    });

});
