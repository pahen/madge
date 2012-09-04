var should = require('should'),
	madge = require('../lib/madge');

describe('module format (AMD)', function () {

	it('should behave as expected on ok files', function () {
		madge([__dirname + '/files/amd/ok'], {format: 'amd'}).obj().should.eql({ a: [ 'sub/b' ], d: [], e: [ 'sub/c' ], 'sub/b': [ 'sub/c' ], 'sub/c': [ 'd' ] });
	});

	it('should be able to exclude modules', function () {
		madge([__dirname + '/files/amd/ok'], {
			format: 'amd',
			exclude: '^sub'
		}).obj().should.eql({ a: [], d: [], e: [] });

		madge([__dirname + '/files/amd/ok'], {
			format: 'amd',
			exclude: '.*\/c$'
		}).obj().should.eql({ a: [ 'sub/b' ], d: [], e: [], 'sub/b': [] });
	});

	it('should tackle errors in files', function () {
		madge([__dirname + '/files/amd/error.js'], {format: 'amd'}).obj().should.eql({ error: [] });
	});

	it('should handle id different than file', function () {
		madge([__dirname + '/files/amd/namedWrapped/diff.js'], {format: 'amd'}).obj().should.eql({ ffid: [] });
	});

	it('should handle named modules', function () {
		madge([__dirname + '/files/amd/namedWrapped/car.js'], {format: 'amd'}).obj().should.eql({ car: [ 'engine', 'wheels' ] });
	});

	it('should find circular dependencies', function () {
		madge([__dirname + '/files/amd/circular'], {format: 'amd'}).circular().getArray().should.eql([ ['a', 'c'], ['f', 'g', 'h'] ]);
	});

	it('should find modules that depends on another', function () {
		madge([__dirname + '/files/amd/ok'], {format: 'amd'}).depends('sub/c').should.eql([ 'e', 'sub/b' ]);
	});

	it('should compile coffeescript on-the-fly', function () {
		madge([__dirname + '/files/amd/coffeescript'], {format: 'amd'}).obj().should.eql({ a: ['b'], b: [] });
	});

});