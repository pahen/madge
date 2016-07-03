var should = require('should'),
  madge = require('../lib/madge');

describe('JSX Basics', function() {
    it('can detect imports', function() {
        madge([__dirname + '/files/es6/jsx/basic.jsx'], {
          format: 'es6'
        }).obj().should.eql({basic: [
            '../../../../other',
            '../../../../react'
            ]});
    });
});