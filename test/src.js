var should = require('should'),
	madge = require('../lib/madge');

describe('src', function () {

	it('as string', function () {
		madge('test/files/cjs/normal/a.js').obj().should.eql({ a: [ 'sub/b' ] });
	});

	it('as array', function () {
		madge(['test/files/cjs/normal/a.js']).obj().should.eql({ a: [ 'sub/b' ] });
	});

	it('as object', function () {
		madge({
			a: ['b', 'c'],
			b: ['c'],
			c: []
		}).obj().should.eql({ a: [ 'b', 'c' ], b: [ 'c' ], c: [] });
	});

});