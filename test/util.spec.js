// Testing framework
const chai = require('chai');
const expect = chai.expect;
const should = chai.should(); void should;
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);

// helper module
const path = require('path');

// Tested module
const { changeExt, countLines, countChar, runCmd, readAll, stringAsStream } = require('../src/util');

describe('util', function() {

    it('#countChar', function() {
        countChar("", "a").should.be.eq(0);
        countChar("a", "a").should.eq(1);
        countChar("aaba bba \n a", "a").should.eq(5);
    });

    it('#countLines', function() {
        countLines("").should.eq(1);
        countLines("  aa ").should.eq(1);
        countLines(" \n ").should.eq(2);
        countLines("\n aa \n\n\n bb \n").should.eq(6);
    });

    it('#readAll', async function() {
        expect(await readAll(stringAsStream(""))).eq("");
        expect(await readAll(stringAsStream("bobo"))).eq("bobo");
        await readAll(undefined).should.be.rejectedWith(TypeError);
        await readAll(process.stderr).should.be.rejectedWith("ENOTCONN");
    });

    it('#runCmd', async function() {
        expect(runCmd).instanceOf(Function);
        await runCmd("", "unknown_command").should.be.rejectedWith(/unknown_command/);
        await runCmd(undefined, "unknown_command").should.be.rejectedWith(/unknown_command/);
        await runCmd("1 +").should.be.rejected;

        // The next command should work just fine on both unixes and dos.
        let [stdout, stderr] = await runCmd("", "echo text");
        expect(stdout).match(/text/); // eq("text\n") doesnt work because "text\r\n" under dos.
        expect(stderr).eq("");

        // Istanbul cant find "node", so we forget this part of the test
        // await runCmd("").should.become(["",""]);
        // await runCmd("console.log(10)").should.become(["10\n",""]);
        // await runCmd("console.error(20)").should.become(["","20\n"]);
        // await runCmd("console.error(30").should.be.rejectedWith("SyntaxError");
        // await runCmd("", "not a valid command line ( $ & ?").should.be.rejectedWith("not a valid command line");
    });

    it('#changeExt', function() {
        expect(changeExt("bobo.x", ".y")).eq("bobo.y");
        expect(changeExt("path/to/bobo.x", ".y")).eq(["path","to", "bobo.y"].join(path.sep));
        expect(changeExt("path/../bobo.x", ".y")).eq("bobo.y");
        expect(changeExt("bobo.x.x", ".y")).eq("bobo.x.y");
        expect(changeExt("bobo.x", ".y", ".x")).eq("bobo.y");
        expect(changeExt("bobo.x", ".y", ".z")).undefined;
    });

});
