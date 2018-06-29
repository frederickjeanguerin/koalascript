// Testing framework
const chai = require('chai');
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const expect = chai.expect;
chai.should();

// Dependents
const Logger = require('../src/logger');
const samples = require('../src/samples');

// Logger used throuhout the tests
const log = new Logger({
    stdin: "$ 10",
    fakeFiles:[
        ['hello.k', samples.kcode.helloWorld],
        ["hello2.k", samples.kcode.helloFrom('hello2')],
        ["hello3.k", samples.kcode.helloFrom('hello3')],
        ["buggy-parse.k", "$"],
        ["buggy-run.k", "$ 10 +"],
        ["bad-name.bad", ""],
    ]
});

// Tested module
const compile = require('../src/compile');

describe('compile', function() {

    afterEach(()=>log.restore());

    it('#runCode', async function() {
        // NB: we are awaiting, but the function runCode is not async right now (it was before)
        // By chance the test cases dont need to change for that reason.

        // simple expression
        await compile.runCode(log, "10");
        expect(log.results.pop()).eq(10);

        // arithmetic expression
        await compile.runCode(log, "10 + 3*2");
        expect(log.results.pop()).eq(16);

        // multiline program
        await compile.runCode(log, "const a = 10;a");
        expect(log.results.pop()).eq(10);

        // Empty program, no result
        await compile.runCode(log, "");
        log.results.length.should.eq(0);

        //
        // ----- Error cases --------
        //

        // syntax error
        await compile.runCode(log, "1 + ");
        expect(log.errors.pop()).match(/SyntaxError/);

        // runtime error
        await compile.runCode(log, "throw new Error");
        expect(log.errors.pop()).match(/Error/);

        log.hasSomeLogs.should.be.false;
    });

    it('#compileCode', async function() {
        const compileCode = compile.compileCode.bind(null, log);
        const hello = samples.kcode.helloFrom("compileCodeTest");

        // No source code error
        await compileCode();
        expect(log.errors.pop()).match(/no source code/i);

        // standard compilation to stdout
        await compileCode({},hello);
        expect(log.results.pop()).match(/compileCodeTest/);

        // standard compilation to file
        const targetFile = "hello.js";
        await compileCode({}, hello, "compileCodeTest" ,targetFile);
        expect(log.fakeFs.get(targetFile)).match(/compileCodeTest/);
        log.restore();

        // check only
        await compileCode({checkonly:true},hello);
        expect(log.infos.pop()).match(/ok/i);

        // compile and run
        await compileCode({run:true},"$ 10");
        expect(log.results.pop()).match(/10/);

        // syntax error
        await compileCode({},"$");
        expect(log.errors.pop()).match(/unexpected/i);

        log.hasSomeLogs.should.be.false;
    });

    it('#compileFile', async function() {
        const compileCode = compile.compileCode.bind(null, log, {});
        const compileFile = compile.compileFile.bind(null, log, compileCode);

        // normal compile
        await compileFile('hello.k');
        expect(log.fakeFs.get('hello.js')).match(/hello/i);
        expect(log.infos.pop()).match(/compiling/i);
        log.restore();

        // bad extension
        await compileFile('bad-name.bad');
        expect(log.errors.pop()).match(/extension/i);

        log.hasSomeLogs.should.be.false;
    });

    it('#compile', async function() {
        const compile_ = compile.bind(null, log);

        // compile 1 file
        await compile_({src:['hello.k']});
        expect(log.fakeFs.get('hello.js')).match(/hello/i);
        expect(log.infos.pop()).match(/compiling/i);
        log.restore();

        // compile many files
        await compile_({src:['hello.k', 'hello2.k', 'hello3.k']});
        expect(log.fakeFs.get('hello.js')).match(/hello/i);
        expect(log.fakeFs.get('hello2.js')).match(/hello2/i);
        expect(log.fakeFs.get('hello3.js')).match(/hello3/i);
        expect(log.infos.length).eq(3);
        log.restore();

        // compile with errors
        const fakeFs = log.fakeFs;
        await compile_({src:['bad-name.bad', 'buggy-parse.k']});
        expect(log.fakeFs).eql(fakeFs);
        expect(log.errors.length).eq(2);
        log.restore();

        // compile from stdin
        await compile_({src:[]});
        expect(log.results.pop()).match(/10/);

        // compile from command line
        await compile_({src:["$", "20"], cmd:true});
        expect(log.results.pop()).match(/20/);

        // run from command line
        await compile_({src:["$", "20+30"], cmd:true, run:true});
        expect(log.results.pop()).match(/50/);

        // run from command line with error
        await compile_({src:["$", "20+"], cmd:true, run:true});
        expect(log.errors.pop()).match(/SyntaxError/i);

        // run file with error
        await compile_({src:["buggy-run.k"], run:true});
        expect(log.errors.pop()).match(/SyntaxError/i);

        log.hasSomeLogs.should.be.false;
    });

});
