const chai = require('chai');
const expect = chai.expect;

const Runjs = require('../src/runjs');
const runjs = new Runjs;
const {checkSyntax, isValidExpr, formatSyntaxError} = Runjs;

describe('RunJs', function() {

    it('#checkSyntax', function() {
        expect(checkSyntax("")).undefined;
        expect(checkSyntax("1 + 2")).undefined;
        expect(checkSyntax("1 +")).instanceOf(SyntaxError);
    });

    it('#formatSyntaxError', function() {
        expect(()=>formatSyntaxError()).throw(TypeError);
        expect(formatSyntaxError(checkSyntax("1 +"))).match(/1 +/);
    });

    it('#isValidExpr', function() {
        expect( isValidExpr("1 + 1") ).true;
        expect( isValidExpr("") ).false;
        expect( isValidExpr("return 3") ).false;
    });

    it('#run & #reset', function() {
        // base case
        expect( runjs.run("1 + 1") ).eql( {result:2, error:undefined} );

        // many statements
        expect( runjs.run("1 + 1 ; 2 + 2") ).eql( {result:4, error:undefined} );

        // some errors
        expect( runjs.run("1 +").error ).instanceof(SyntaxError);
        expect( runjs.run("abc").error ).instanceof(ReferenceError);
        expect( runjs.run("throw 10").error ).match(/10/);

        // variable persistence
        expect( runjs.run("const abc = 3") ).eql( {result:undefined, error:undefined} );
        expect( runjs.run("abc") ).eql( {result:3, error:undefined} );

        // reset
        runjs.reset();
        expect( runjs.run("abc").error ).instanceof(ReferenceError);

    });

    it('Fibonacci timeout', function() {
        runjs.reset({timeout: 10}); // 10 ms
        runjs.run("function fib(n) { return n < 1 ? 1 : fib(n-1) + fib(n-2); }");
        const fib = runjs.run("fib").result;
        expect( fib(5) ).eq( 13 );
        expect( runjs.run("fib(5)").result ).eq(13);
        expect( runjs.run("fib(30)").error ).match(/Script execution timed out/);
    });

    it('Require and recursive VM', function() {
        runjs.reset();
        // Create a vm in the vm
        runjs.run("const runjs = new (require('./runjs'))");
        // Get that vm here
        const _runjs = runjs.run("runjs").result;
        // Run that VM here
        expect(_runjs).not.undefined;
        expect( _runjs.run("10").result ).eq( 10 );
        // Run the VM in the VM
        expect( runjs.run("runjs.run('20').result").result ).eq( 20 );
    });

});
