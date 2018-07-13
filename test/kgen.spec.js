const
    chai = require('chai'),
    expect = chai.expect,
    snapshot = require('snap-shot-it'),

    Logger = require('../src/logger'),
    log = new Logger(),
    kgen = require('../src/kgen'),
    gen = kgen.bind(null, log),
    samples = require('../src/samples'),

    __end__const__ = "";

chai.should();  // enable chai should syntax

function parse(kcode) {
    return gen(kcode, {parseOnly:true});
}

describe('kgen', function() {

    afterEach(() => {
        log.restore();
    });

    it('Empty and comment', function() {
        expect(gen("").jscode).eq("");
        expect(gen("  \n  \n ").jscode).eq("");
        expect(gen("  # comment\n  # comment\n ").jscode).eq("");
        expect(log.hasSomeLogs).false;
    });

    it('JS line', function() {
        expect(gen("$ 10").jscode).eq("10;");
        expect(gen("$ 10\n $ 20").jscode).eq("10;20;");
        expect(gen("$ console.log(99)").jscode).eq("console.log(99);");
        expect(log.hasSomeLogs).false;
    });

    it('Some single parse errors', function() {
        gen("$");
        expect(log.hasErrors).true;
        expect(log.errors.length).eq(1);
        expect(log.errors.pop()).match(/Unexpected/).match(/\$/);

        gen("$ ");
        expect(log.hasErrors).true;
        expect(log.errors.length).eq(1);
        expect(log.errors.pop()).match(/Unexpected/).match(/\$/);

        gen(")");
        expect(log.hasErrors).true;
        expect(log.errors.length).eq(1);
        expect(log.errors.pop()).match(/Unexpected/).match(/\)/);

        expect(log.hasSomeLogs).false;
    });

    it('Parse only mode', function() {
        expect(parse("").parsing).eql([]);
        const {parsing, jscode} = parse("$ 10\n$ 20;\n $ 30");
        expect(jscode).undefined;
        expect(parsing).has.property('length', 3);
        expect(parsing[0]).has.property('type', "js_line");
        expect(log.hasSomeLogs).false;
    });

    it('Detect and report inline JS errors', function() {
        const singleLineWithJsSyntaxError = `$ 1 + ) +`;
        gen(singleLineWithJsSyntaxError);
        expect(log.hasErrors).true;
        expect(log.errors.length).eq(1);
        const errorMessage = log.errors.pop();
        expect(errorMessage).match(/unexpected/i).match(/\)/);
        expect(log.hasSomeLogs).false;

        // Reports JS syntax errors in a meaningfull way.
        snapshot(errorMessage);

        const multilineWithJsSyntaxError = `
        # A multiline program with a js syntax error
        $ 1 + ) +
        # somme comment after
        `;
        gen(multilineWithJsSyntaxError);
        snapshot(log.errors.pop());
        expect(log.hasSomeLogs).false;
    });

    it("Reports many JS errors from many JS statements", function() {
        gen(`
        $ 1 + ) +
        $ 1 + ) +
        $ 1 + ) +
        `);
        expect(log.errors.length).eq(3);
        log.errors.length = 0;
        expect(log.hasSomeLogs).false;
    });

    it("Generate map file", function() {
        const {jscode, jsonMap} = gen(samples.kcode.helloWorld);
        const sourceMap = JSON.parse(jsonMap);
        expect(log.hasSomeLogs).false;
        expect(sourceMap.sources).eql(['default']);
        expect(sourceMap.sourcesContent).eql([samples.kcode.helloWorld]);
        snapshot(jscode);
        snapshot(sourceMap);
        expect(log.hasSomeLogs).false;
    });


});
