const chai = require('chai')
chai.should()

const jsgen = require('../src/jsgen')
// var deepEqual = require('deep-equal')

const jsprogram = `
    // a simple JS program
    console.log("hello the " + "world")
`;

describe('jsgen', function() {

    it('simple program', function() {
        const jsnode = jsgen(jsprogram, "jscheck.spec.x")
        jsnode.toString().should.eq(jsprogram)

        let tokenCount = 0;
        jsnode.walk(()=>{tokenCount++})
        tokenCount.should.eq(14);

    });

});
