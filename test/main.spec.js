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
const main = require('../src/main');

describe('main', function() {

    it('main', async function() {
        const main_ = main.bind(null, log);

        // compile 1 file
        expect(await main_(['hello.k'])).eq(0);
        expect(log.fakeFs.get('hello.js')).match(/hello/i);
        expect(log.infos.pop()).match(/compiling/i);
        log.restore();

        // compile many files
        expect(await main_(['hello.k', 'hello2.k', 'hello3.k'])).eq(0);
        expect(log.fakeFs.get('hello.js')).match(/hello/i);
        expect(log.fakeFs.get('hello2.js')).match(/hello2/i);
        expect(log.fakeFs.get('hello3.js')).match(/hello3/i);
        expect(log.infos.length).eq(3);
        log.restore();

        // compile with bad arguments
        expect(await main_(['--bad_option'])).eq(1);
        expect(log.errors.pop()).match(/bad_option/);

        // compile with errors
        const fakeFs = log.fakeFs;
        expect(await main_(['bad-name.bad', 'buggy-parse.k'])).eq(1);
        expect(log.fakeFs).eql(fakeFs);
        expect(log.errors.length).eq(2);
        log.restore();

        // compile from stdin
        expect(await main_([])).eq(0);
        expect(log.results.pop()).match(/10/);

        // compile from command line
        expect(await main_(["--cmd", "$", "20"])).eq(0);
        expect(log.results.pop()).match(/20/);

        // run from command line
        expect(await main_(["-cr", "$", "20+30"])).eq(0);
        expect(log.results.pop()).match(/50/);

        // run from command line with error
        expect(await main_(["-cr", "$", "20+"])).eq(1);
        expect(log.errors.pop()).match(/SyntaxError/i);

        // run file with error
        expect(await main_(["--run", "buggy-run.k"])).eq(1);
        expect(log.errors.pop()).match(/SyntaxError/i);

        log.hasSomeLogs.should.be.false;
    });

});
