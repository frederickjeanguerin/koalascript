const chai = require('chai')
chai.should()

const assert = require('../src/sys-assert')

describe('assert', function() {

    it('#assert', function() {
        (()=>assert(true)).should.not.throw();
        (()=>assert(false)).should.throw();
        (()=>assert(false, "myMessage")).should.throw(assert.Error);
        (()=>assert(false, "myMessage")).should.throw(/myMessage/);
        (()=>assert(false, "myMessage {line}", {line: 100})).should.throw(/100/);
    });

    it('#assert.eq', function() {
        (()=>assert.eq(0 , 0)).should.not.throw();
        (()=>assert.eq(1, 2)).should.throw();
        (()=>assert.eq(1, 2)).should.throw(assert.Error);
        (()=>assert.eq(111, 200)).should.throw(/111/);
        (()=>assert.eq(100, 222)).should.throw(/222/);
    });

});
