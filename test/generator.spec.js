const chai = require('chai');
const expect = chai.expect;
chai.should();

const Logger = require('../src/logger');
const log = new Logger();
const generator = require('../src/generator');
const gen = generator.bind(null, log);

function parse(kcode) {
    return gen(kcode, {parseOnly:true});
}

describe('generator', function() {

    afterEach(() => {
        expect(log.hasSomeLogs).false;
        log.restore();
    });

    it('Empty and comment', function() {
        expect(gen("").jscode).eq("");
        expect(gen("  \n  \n ").jscode).eq("");
        expect(gen("  # comment\n  # comment\n ").jscode).eq("");
    });

    it('JS line', function() {
        expect(gen("$ 10").jscode).eq("10;");
        expect(gen("$ 10\n $ 20").jscode).eq("10;\n20;");
        expect(gen("$ console.log(99)").jscode).eq("console.log(99);");
    });

    it('Some errors', function() {
        gen("$");
        expect(log.hasErrors).true;
        expect(log.errors.length).eq(1);
        expect(log.errors.pop()).match(/Unexpected/).match(/\$/);

        gen(")");
        expect(log.hasErrors).true;
        expect(log.errors.length).eq(1);
        expect(log.errors.pop()).match(/Unexpected/).match(/\)/);
    });

    it('Parse only mode', function() {
        expect(parse("").parsing).eql([]);
        const {parsing, jscode} = parse("$ 10\n$ 20;\n $ 30");
        expect(jscode).undefined;
        expect(parsing).has.property('length', 3);
        expect(parsing[0]).has.property('type', "js_line");
    });

});
