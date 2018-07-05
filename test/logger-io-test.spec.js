// Testing framework
const chai = require('chai');
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const expect = chai.expect;
chai.should();

// Tested module
const Logger = require('../src/logger');
const IoTest = require('../src/io-test');

const log = new Logger({io : IoTest({fakeStdin: "dummy stdin",fakeFiles:[["abc", "123"], ["def", "456"]]})});
const logColor = new Logger({io : IoTest({acceptColors:true})});

describe('Logger Io Test', function() {

    afterEach( () => {
        log.restore();
        logColor.restore();
    });

    it('reporting info', function() {
        // initial state
        expect(log.io.fake.stderr).undefined;
        expect(logColor.io.fake.info).undefined;

        log.info(1);
        log.info(2);
        expect(log.io.fake.stderr).match(/1/).match(/2/);

        logColor.info(1);
        logColor.info(2);
        expect(logColor.io.fake.info).match(/1/).match(/2/);
    });

    it('reporting debug', function() {
        // initial state
        expect(log.io.fake.stderr).undefined;
        expect(logColor.io.fake.debug).undefined;

        // no log when debug is disabled
        log.debug("test", 1);
        expect(log.io.fake.stderr).undefined;

        // log when activated
        log.reconfig({debug:""});
        log.debug("test", 1);
        expect(log.io.fake.stderr).match(/test: 1/);

        logColor.reconfig({debug:""});
        logColor.debug("test", 2);
        logColor.debug("test", 3);
        expect(logColor.io.fake.log).match(/2/).match(/3/);
    });

    it('reporting warnings', function() {
        expect(log.io.fake.stderr).undefined;
        expect(logColor.io.fake.warn).undefined;

        log.warn(1);
        log.warn(2);
        expect(log.io.fake.stderr).match(/1/).match(/2/);

        logColor.warn(1);
        logColor.warn(2);
        expect(logColor.io.fake.warn).match(/1/).match(/2/);
    });

    it('reporting errors', function() {
        expect(log.io.fake.stderr).undefined;
        expect(logColor.io.fake.error).undefined;

        log.error(1);
        log.error(2);
        expect(log.io.fake.stderr).match(/1/).match(/2/);

        logColor.error(1);
        logColor.error(2);
        expect(logColor.io.fake.error).match(/1/).match(/2/);
    });

    it('reporting results', function() {
        expect(log.io.fake.stdout).undefined;
        expect(logColor.io.fake.log).undefined;

        log.result(1);
        log.result(2);
        expect(log.io.fake.stdout).match(/1/).match(/2/);

        logColor.result(1);
        logColor.result(2);
        expect(logColor.io.fake.log).match(/1/).match(/2/);
    });

    it('reading stdin', function() {
        log.io.readStdin().should.eql("dummy stdin");
        logColor.io.readStdin().should.eql('');
    });

    it('reading fake files', function() {
        log.io.readFile("def").should.eq("456");
        expect(() => log.io.readFile("de")).throw(/file not found/i);
    });

    it('writing fake files', function() {
        log.io.hasNewFiles.should.be.false;
        log.io.saveFile("abc", "123");
        log.io.saveFile("def", "455");
        log.io.saveFile("abc", "789");
        log.io.saveFile("hij", "000");
        log.io.hasNewFiles.should.be.true;
        [...log.io.fakeFs].should.eql([["abc", "789"], ["def", "455"], ["hij", "000"]]);
    });

    it('#restore', async function() {
        log.restore();
        log.io.fake.should.eql({});
    });

});
