const chai = require('chai')
chai.should()

const SysError = require('../src/sys-error')
const {countLines} = require('../src/util')

describe('sys-error', function() {

    it('#constructor:default', function() {
        let error = new SysError
        error.message.should.eq("")
        error.infos.should.eql({})
    });

    it('#constructor:message+infos', function() {
        let error = new SysError("{a} + {b}", {a:11, b:22})
        error.message.should.eq("11 + 22")
        error.template.should.eq("{a} + {b}")
        error.infos.should.eql({a:11, b:22})
        error.a.should.eq(11);
        error.b.should.eq(22);
    });

    it('#filteredStack', function() {
        let error = new SysError;
        countLines(error.filteredStack()).should.eq(1, error.filteredStack())
        countLines(error.filteredStack({withNodeModules: true})).should.be.gt(0)
    });

    it('#log', function() {
    });

});
