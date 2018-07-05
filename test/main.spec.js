// Testing framework
const chai = require('chai');
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const expect = chai.expect;
chai.should();

// Dependents
const Logger = require('../src/logger');

// Logger used throuhout the tests
const log = new Logger;

// Tested module
const main = require('../src/main');
const main_ = main.bind(null, log);

describe('main', function() {

    afterEach(()=>{
        log.hasSomeLogs.should.be.false;
        log.restore();
    });

    it('Bad options', async function() {
        expect(await main_(['--bad_option'])).eq(1);
        expect(log.errors.pop()).match(/bad_option/);
    });

    it('Bad files', async function() {
        expect(await main_(['bad-name.bad', 'buggy-parse.k'])).eq(1);
        expect(log.errors.pop()).match(/buggy-parse\.k/);
        expect(log.errors.pop()).match(/bad-name\.bad/);
    });


    it('Compile command line', async function() {
        expect(await main_(["--cmd", "$", "20"])).eq(0);
        expect(log.results.pop()).match(/20/);
    });

    it('Run command line', async function() {
        expect(await main_(["-cr", "$", "20+30"])).eq(0);
        expect(log.results.pop()).match(/50/);
    });

    it('Run command line with error', async function() {
        expect(await main_(["-cr", "$", "throw", "Error('foobug')"])).eq(1);
        expect(log.errors.pop()).match(/foobug/);
    });

    it('Check only', async function() {
        expect(await main_(["--checkonly", "--cmd", "$", "throw", "Error('foobug')"])).eq(0);
        expect(log.infos.pop()).match(/ok/);
    });

    it('Check only (quiet)', async function() {
        expect(await main_(["--checkonly", "--cmd", "--quiet", "$", "throw", "Error('foobug')"])).eq(0);
        expect(log.infos.length).eq(0);
    });

});
