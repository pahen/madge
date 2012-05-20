var should = require('should'),
	madge = require('../index');

describe('module format (AMD)', function () {

	it('ok', function () {
		madge([__dirname + '/files/amd/ok'], {format: 'amd'}).obj().should.eql({ a: [ 'sub/b' ], d: [], e: [ 'sub/c' ], 'sub/b': [ 'sub/c' ], 'sub/c': [ 'd' ] });
	});

	it('exclude', function () {
		madge([__dirname + '/files/amd/ok'], {
			format: 'amd',
			exclude: '^sub'
		}).obj().should.eql({ a: [], d: [], e: [] });

		madge([__dirname + '/files/amd/ok'], {
			format: 'amd',
			exclude: '.*\/c$'
		}).obj().should.eql({ a: [ 'sub/b' ], d: [], e: [], 'sub/b': [] });
	});

	it('error', function () {
		madge([__dirname + '/files/amd/error.js'], {format: 'amd'}).obj().should.eql({ error: [] });
	});

	it('id different than file', function () {
		madge([__dirname + '/files/amd/namedWrapped/diff.js'], {format: 'amd'}).obj().should.eql({ ffid: [] });
	});

	it('named', function () {
		madge([__dirname + '/files/amd/namedWrapped/car.js'], {format: 'amd'}).obj().should.eql({ car: [ 'engine', 'wheels' ] });
	});

	it('circular', function () {
		madge([__dirname + '/files/amd/circular'], {format: 'amd'}).circular().should.eql({ c: 'a' });
	});

	it('depends', function () {
		madge([__dirname + '/files/amd/ok'], {format: 'amd'}).depends('sub/c').should.eql([ 'e', 'sub/b' ]);
	});

});