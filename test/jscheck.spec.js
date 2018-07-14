const chai = require('chai')
chai.should()

const checkSyntax = require('../src/jscheck')
const SysSyntaxError = require('../src/sys-syntax-error')

describe('jscheck', function() {

    it('inNode', function() {
        checkSyntaxAssumeBrowser(false);
    });

    it('inBrowser', function() {
        checkSyntaxAssumeBrowser(true);
    });

    it('throwsOnDemand', function() {
        const throws = true;
        (() => checkSyntax("", {throws})).should.not.throw;
        (() => checkSyntax("+", {throws})).should.throw(SysSyntaxError);
    });

    function checkSyntaxAssumeBrowser(assumeBrowser) {
        checkSyntax("", {assumeBrowser}).should.be.false
        checkSyntax("1 + 2", {assumeBrowser}).should.be.false
        checkSyntax("1 +", {assumeBrowser}).should.be.instanceOf(SysSyntaxError)
        checkSyntax("1 +",{assumeBrowser}).position.should.eql({line:1, column:3})
        checkSyntax("\n1 +   ",{assumeBrowser}).position.should.eql({line:2, column:3})
        checkSyntax("1 +",{assumeBrowser}).message.should.match(/unexpected end of input/i)
        checkSyntax("1 +", {assumeBrowser, sourceName: "mySource"}).sourceName.should.eq("mySource")
        checkSyntax("1 +", {assumeBrowser, jscodeLine:100}).position.should.eql({line:100, column:3})
        checkSyntax("1 +", {assumeBrowser, jscodeColumn:200}).position.should.eql({line:1, column:203})
        checkSyntax("1 +", {assumeBrowser, jscodeLine:100, jscodeColumn:200}).position.should.eql({line:100, column:203})
        checkSyntax("\n\n1 +", {assumeBrowser, jscodeLine:100, jscodeColumn:200}).position.should.eql({line:102, column:3})
        checkSyntax("\n ) \n1 +", {assumeBrowser, jscodeLine:100, jscodeColumn:200}).position.should.eql({line:101, column:2})
    }
});
