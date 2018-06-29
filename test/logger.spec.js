// Testing framework
const chai = require('chai');
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const expect = chai.expect;
chai.should();

// Tested module
const Logger = require('../src/logger');

describe('Logger', function() {

    it('constructor & reconfig', function() {
        const log = new Logger;
        log.options.should.eql({mute:true, debug:null, quiet:false});
        log.reconfig({debug: "", dummy: 10});
        log.options.should.eql({mute:true, debug:"", quiet:false, dummy: 10});
        Logger.default.options.mute.should.be.false;
    });

    it('reporting info', function() {
        const log = new Logger({options:{quiet:false}});
        log.info(1, 2);
        expect(log.infos[0]).match(/1 2/);
        log.info(3, 4);
        expect(log.infos[1]).match(/3 4/);
        log.reconfig({mute:true, quiet:true});
        log.infos.length.should.eq(2);
        log.info(5, 6);
        log.info(7, 8);
        log.infos.length.should.eq(2);
    });

    it('reporting debug', function() {
        const log = new Logger;

        // no log when debug is disabled
        log.debug("test", 2);
        log.debugs.should.eql([]);

        // log when activated
        log.reconfig({mute:true, debug:""});
        log.debug("test", 2);
        expect(log.debugs[0]).match(/test 2/);

        // log only when subject is matching
        log.reconfig({mute:true, debug:"test"});
        log.debug("some testing", 3);
        log.debug("var", 4);
        expect(log.debugs[1]).match(/some testing 3/);
    });

    it('reporting warnings', function() {
        const log = new Logger;
        log.hasSomeLogs.should.be.false;
        log.warn(1, 2);
        log.hasSomeLogs.should.be.true;
        expect(log.warnings.pop()).match(/1 2/);
        log.hasSomeLogs.should.be.false;
    });

    it('reporting errors', function() {
        const log = new Logger();
        log.hasErrors.should.be.false;
        log.hasSomeLogs.should.be.false;
        log.error(1, 2);
        log.hasErrors.should.be.true;
        log.hasSomeLogs.should.be.true;
        expect(log.errors.pop()).match(/1 2/);
        log.hasErrors.should.be.false;
        log.hasSomeLogs.should.be.false;
    });

    it('reporting results', function() {
        const log = new Logger();
        log.hasSomeLogs.should.be.false;
        log.result(1);
        log.result(2);
        log.results.should.eql([1,2]);
        log.hasSomeLogs.should.be.true;

        // After an error, results are warnings
        log.error(1);
        log.result(3);
        log.errors.length.should.eq(1);
        log.results.should.eql([1,2]);
        log.warnings.length.should.eq(1);
    });

    it('reading stdin', function() {
        const log = new Logger({stdin:"abc"});
        return Promise.all( [
            log.readStdin().should.become("abc"),
            log.readStdin().should.be.rejectedWith(Error),
        ]);
    });

    it('reading fake files', function() {
        const log = new Logger({fakeFiles:[["abc", "123"], ["def", "456"]]});
        log.readFile("def").should.eq("456");
        (() => log.readFile("de")).should.throw(Error);
    });

    it('writing fake files', function() {
        const log = new Logger();
        log.saveFile("abc", "123");
        log.saveFile("def", "456");
        log.saveFile("abc", "789");
        [...log.fakeFs].should.eql([["abc", "789"], ["def", "456"]]);
    });

    it('#restore', async function() {
        const log = new Logger({stdin:"data"});

        // change state
        log.error("error");
        log.warn("warning");
        log.result("result");
        log.saveFile("abc", "123");
        await log.readStdin();

        // restore state
        log.restore();

        // check that it is
        log.fakeFs.size.should.eq(0);
        log.hasSomeLogs.should.be.false;
        (await log.readStdin()).should.eq("data");
    });

});
