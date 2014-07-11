var should = require('should'),
	madge = require('../lib/madge');

describe('module format (AMD)', function () {

	it('should behave as expected on ok files', function () {
		madge([__dirname + '/files/amd/ok'], {
			format: 'amd'
		}).obj().should.eql({ 'a': [ 'sub/b' ], 'd': [], 'e': [ 'sub/c' ], 'sub/b': [ 'sub/c' ], 'sub/c': [ 'd' ] });
	});

	it('should handle optimized files', function () {
		madge([__dirname + '/files/amd/a-built.js'], {
			format: 'amd',
			optimized: true
		}).obj().should.eql({ 'a': [ 'sub/b' ], 'd': [], 'sub/b': [ 'sub/c' ], 'sub/c': [ 'd' ] });
	});

	it('should handle optimized files originating with a `require` call', function() {
		madge([__dirname + '/files/amd/b-built.js'], {
			format: 'amd',
			optimized: true,
		}).obj().should.eql({ '': [ 'sub/b' ], 'a': [], 'd': [], 'sub/b': [ 'sub/c' ], 'sub/c': [ 'd' ] });
	});

	it('should handle optimized files originating with a `require` call and a designated main module', function() {
		madge([__dirname + '/files/amd/b-built.js'], {
			format: 'amd',
			optimized: true,
			mainRequireModule: 'a'
		}).obj().should.eql({ 'a': [ 'sub/b' ], 'd': [], 'sub/b': [ 'sub/c' ], 'sub/c': [ 'd' ] });
	});

	it('should merge in shim dependencies found in RequireJS config', function () {
		madge([__dirname + '/files/amd/requirejs/a.js'], {
			format: 'amd',
			requireConfig: __dirname + '/files/amd/requirejs/config.js'
		}).obj().should.eql({ a: [ 'jquery' ], 'jquery': [], 'jquery.foo': [ 'jquery' ], 'jquery.bar': [ 'jquery' ], 'baz': [ 'quux' ], 'quux': [] });
	});

	it('should be able to exclude modules', function () {
		madge([__dirname + '/files/amd/ok'], {
			format: 'amd',
			exclude: '^sub'
		}).obj().should.eql({ 'a': [], 'd': [], 'e': [] });

		madge([__dirname + '/files/amd/ok'], {
			format: 'amd',
			exclude: '.*\/c$'
		}).obj().should.eql({ 'a': [ 'sub/b' ], 'd': [], 'e': [], 'sub/b': [] });

		madge([__dirname + '/files/amd/requirejs/a.js'], {
			format: 'amd',
			requireConfig: __dirname + '/files/amd/requirejs/config.js',
			exclude: '^jquery.foo|quux$'
		}).obj().should.eql({ a: [ 'jquery' ], 'jquery': [], 'jquery.bar': [ 'jquery' ] , 'baz': []});
	});

	it('should tackle errors in files', function () {
		madge([__dirname + '/files/amd/error.js'], {
			format: 'amd'
		}).obj().should.eql({ error: [] });
	});

	// it('should handle id different than file', function () {
	// 	madge([__dirname + '/files/amd/namedWrapped/diff.js'], {
	// 		format: 'amd'
	// 	}).obj().should.eql({ 'ffid': [] });
	// });

	it('should handle named modules', function () {
		madge([__dirname + '/files/amd/namedWrapped/car.js'], {
			format: 'amd'
		}).obj().should.eql({ 'car': [ 'engine', 'wheels' ] });
	});

	it('should find circular dependencies', function () {
		madge([__dirname + '/files/amd/circular'], {
			format: 'amd'
		}).circular().getArray().should.eql([ ['a', 'c'], ['f', 'g', 'h'] ]);
	});

	it('should find modules that depends on another', function () {
		madge([__dirname + '/files/amd/ok'], {
			format: 'amd'
		}).depends('sub/c').should.eql([ 'e', 'sub/b' ]);
	});

	it('should compile coffeescript on-the-fly', function () {
		madge([__dirname + '/files/amd/coffeescript'], {
			format: 'amd'
		}).obj().should.eql({ 'a': ['b'], 'b': [] });
	});

	it('should resolve relative module indentifiers', function () {
		madge([__dirname + '/files/amd/relative'], {
			format: 'amd'
		}).obj().should.eql({ 'a': [], 'b': [ 'a' ], 'foo/bar/d': [ 'a' ], 'foo/c': [ 'a' ] });
	});

	it('should ignore plugins', function () {
		madge([__dirname + '/files/amd/plugin.js'], {
			format: 'amd',
			breakOnError: true
		}).obj().should.eql({ plugin: [ 'ok/a' ] });
	});
});