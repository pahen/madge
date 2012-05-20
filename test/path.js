var should = require('should'),
	madge = require('../index');

describe('path', function () {

	it('relative', function () {
		madge(['test/files/cjs/normal/a.js']).obj().should.eql({ a: [ 'sub/b' ] });
	});

});