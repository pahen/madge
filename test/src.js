var should = require('should'),
	madge = require('../lib/madge');

describe('src', function () {

	it('should handle a string as argument', function () {
		madge('test/files/cjs/normal/a.js').obj().should.eql({ a: [ 'sub/b' ] });
	});

	it('should handle an array as argument', function () {
		madge(['test/files/cjs/normal/a.js']).obj().should.eql({ a: [ 'sub/b' ] });
	});

	it('should handle a object as argument', function () {
		madge({
			a: ['b', 'c'],
			b: ['c'],
			c: []
		}).obj().should.eql({ a: [ 'b', 'c' ], b: [ 'c' ], c: [] });
	});

});