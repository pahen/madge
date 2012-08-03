var should = require('should'),
	madge = require('../lib/madge');

describe('path', function () {

	it('should be ok with relative paths', function () {
		madge(['test/files/cjs/normal/a.js']).obj().should.eql({ a: [ 'sub/b' ] });
	});

});