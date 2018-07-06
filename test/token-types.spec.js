const chai = require('chai');
const expect = chai.expect;

const tt = require('../src/token-types');

describe('Token Types', function() {

    it('#basics', function() {
        expect(tt.js_line).eq('js_line');
        expect(tt.js_line in tt).true;
        expect(tt.not_in_there).undefined;
    });

});
