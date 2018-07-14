const
    chai = require('chai'),
    expect = chai.expect,
    snapshot = require('snap-shot-it'),

    gen = require('../src/kgen'),
    samples = require('../src/samples'),

    __end__const__ = "";

chai.should();  // enable chai should syntax

function parse(kcode) {
    return gen(kcode, {parseOnly:true});
}

describe('kgen', function() {

    it('Empty and comment', function() {
        expect(gen("").jscode).eq("");
        expect(gen("  \n  \n ").jscode).eq("");
        expect(gen("  # comment\n  # comment\n ").jscode).eq("");
    });

    it('JS line', function() {
        expect(gen("$ 10").jscode).eq("10;");
        expect(gen("$ 10\n $ 20").jscode).eq("10;20;");
        expect(gen("$ console.log(99)").jscode).eq("console.log(99);");
    });

    it('Some single parse errors', function() {
        let {errors} = gen("$");
        expect(errors.length).eq(1);
        expect(errors[0].toString()).match(/Unexpected/).match(/\$/);

        ({errors} = gen("$ "));
        expect(errors.length).eq(1);
        expect(errors[0].toString()).match(/Unexpected/).match(/\$/);

        ({errors} = gen(") "));
        expect(errors.length).eq(1);
        expect(errors[0].toString()).match(/Unexpected/).match(/\)/);
    });

    it('Parse only mode', function() {
        expect(parse("").parsing).eql([]);
        const {parsing, jscode} = parse("$ 10\n$ 20;\n $ 30");
        expect(jscode).undefined;
        expect(parsing).has.property('length', 3);
        expect(parsing[0]).has.property('type', "js_line");
    });

    it('Detect and report inline JS errors', function() {
        const singleLineWithJsSyntaxError = `$ 1 + ) +`;
        let {errors} = gen(singleLineWithJsSyntaxError);
        expect(errors.length).eq(1);
        let errorMessage = errors[0].toString();
        expect(errorMessage).match(/unexpected/i).match(/\)/);

        // Reports JS syntax errors in a meaningfull way.
        snapshot(errorMessage);

        const multilineWithJsSyntaxError = `
        # A multiline program with a js syntax error
        $ 1 + ) +
        # somme comment after
        `;
        ({errors} = gen(multilineWithJsSyntaxError));
        expect(errors.length).eq(1);
        snapshot(errors[0].toString());
    });

    it("Reports many JS errors from many JS statements", function() {
        let {errors} = gen(`
        $ 1 + ) +
        $ 1 + ) +
        $ 1 + ) +
        `);
        expect(errors.length).eq(3);
        errors.forEach(err => expect(err.toString()).match(/\)/));
    });

    it("Generate map file", function() {
        const {jscode, jsonSourceMap} = gen(samples.kcode.helloWorld);
        const sourceMap = JSON.parse(jsonSourceMap);
        expect(sourceMap.sourcesContent).eql([samples.kcode.helloWorld]);
        snapshot(jscode);
        snapshot(sourceMap);
    });
});
