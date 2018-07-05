// Testing framework
const chai = require('chai');
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const expect = chai.expect;
chai.should();

// Useful
const convertSourceMap = require('convert-source-map');

// Dependents
const Logger = require('../src/logger');
const IoTest = require('../src/io-test');
const samples = require('../src/samples');

// Logger used throuhout the tests
const log = new Logger( {io:IoTest({
    fakeStdin: "$ 10",
    fakeFiles:[
        ['hello.k', samples.kcode.helloWorld],
        ["hello2.k", samples.kcode.helloFrom('hello2')],
        ["hello3.k", samples.kcode.helloFrom('hello3')],
        ["buggy-parse.k", "$"],
        ["buggy-run.k", "$ throw Error('foobug')"],
        ["bad-name.bad", ""],
    ]
})});

// Tested module
const compile = require('../src/compile');

describe('compile', function() {

    afterEach(()=>{
        log.hasSomeLogs.should.be.false;
        log.restore();
    });

    describe('#runCode', function() {

        it('simple-expression', async function() {
            await compile.runCode(log, "10");
            expect(log.results.pop()).eq(10);
        });

        it('arithmetic-expression', async function() {
            await compile.runCode(log, "10 + 3*2");
            expect(log.results.pop()).eq(16);
        });

        it('multiline-program', async function() {
            await compile.runCode(log, "const a = 10;a");
            expect(log.results.pop()).eq(10);
        });

        it('empty-program yield no result', async function() {
            await compile.runCode(log, "");
            log.results.length.should.eq(0);
        });

        //
        // ----- Error cases --------
        //

        it('log syntax error', async function() {
            await compile.runCode(log, "1 + ");
            expect(log.errors.pop()).match(/SyntaxError/);
        });

        it('log runtime error', async function() {
            await compile.runCode(log, "throw new Error");
            expect(log.errors.pop()).match(/Error/);
        });

    });

    describe('#compileCode', function() {

        const compileCode = compile.compileCode.bind(null, log);
        const hello = samples.kcode.helloFrom("compileCodeTest");

        it('No source code give error', async function() {
            await compileCode();
            expect(log.errors.pop()).match(/no source code/i);
        });

        it('Compilation to stdout', async function() {
            await compileCode({},hello);
            expect(log.results.pop()).match(/compileCodeTest/);
        });

        it('Compilation to file', async function() {
            const targetFile = "hello.js";
            await compileCode({}, hello, "compileCodeTest" ,targetFile);
            expect(log.io.fakeFs.get(targetFile)).match(/compileCodeTest/);
        });

        it('Check code only', async function() {
            await compileCode({checkonly:true},hello);
            expect(log.infos.pop()).match(/ok/i);
            await compileCode({checkonly:true},"$");
            expect(log.errors.pop()).match(/unexpected/i);
        });

        it('Compile and run', async function() {
            await compileCode({run:true},"$ 10");
            expect(log.results.pop()).match(/10/);
        });

        it('Log syntax error', async function() {
            await compileCode({},"$");
            expect(log.errors.pop()).match(/unexpected/i);
        });

    });

    describe('#compileFile', function() {
        const compileCode = compile.compileCode.bind(null, log, {});
        const compileFile = compile.compileFile.bind(null, log, compileCode);

        it('Existing standard file', async function() {
            await compileFile('hello.k');
            expect(log.io.fakeFs.get('hello.js')).match(/hello/i);
            expect(log.infos.pop()).match(/compiling/i);
        });

        it('Bad extension yield error', async function() {
            await compileFile('bad-name.bad');
            expect(log.errors.pop()).match(/extension/i);
        });

        it('Unfound file yield error', async function() {
            await compileFile('inexistant-name.k');
            expect(log.errors.pop()).match(/not found/i);
        });

    });


    describe('#compile', function() {

        const compile_ = compile.bind(null, log);

        it('Compile files', async function() {
            await compile_({src:['hello.k', 'hello2.k', 'hello3.k']});
            expect(log.io.fakeFs.get('hello.js')).match(/hello/i);
            expect(log.io.fakeFs.get('hello2.js')).match(/hello2/i);
            expect(log.io.fakeFs.get('hello3.js')).match(/hello3/i);
            expect(log.infos.length).eq(3);
            log.restore();
        });

        it('Compile with errors', async function() {
            await compile_({src:['bad-name.bad', 'buggy-parse.k']});
            expect(log.io.hasNewFiles).false;
            expect(log.errors.length).eq(2);
            log.restore();
        });

        it('Compile from stdin to stdout', async function() {
            await compile_({src:[]});
            expect(log.results.pop()).match(/10/);
        });

        it('Compile command line to stdout', async function() {
            await compile_({src:["$", "20"], cmd:true});
            expect(log.results.pop()).match(/20/);
        });

        it('Run command line', async function() {
            await compile_({src:["$", "20+30"], cmd:true, run:true});
            expect(log.results.pop()).match(/50/);
        });

        it('Run command line with error', async function() {
            await compile_({src:["$", "throw Error('foobug')"], cmd:true, run:true});
            expect(log.errors.pop()).match(/foobug/);
        });

        it('Run file with error', async function() {
            await compile_({src:["buggy-run.k"], run:true});
            expect(log.errors.pop()).match(/foobug/);
        });

        it('Source map included', async function() {
            await compile_({src:["$ 10"], cmd:true});
            const jscode = log.results.pop();
            const sourceMap = convertSourceMap.fromSource(jscode).toJSON();
            sourceMap.should.match(/\$ 10/);
        });

        it('Source map not included', async function() {
            await compile_({src:["$ 10"], cmd:true, noMap:true});
            const jscode = log.results.pop();
            const sourceMap = convertSourceMap.fromSource(jscode);
            expect(sourceMap).null;
        });

    });

});
