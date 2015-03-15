var should = require('should'),
	madge = require('../lib/madge');

describe('Madge', function () {
	describe('source argument', function () {
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

	describe('paths', function () {
		it('should be ok with relative paths', function () {
			madge(['test/files/cjs/normal/a.js']).obj().should.eql({ a: [ 'sub/b' ] });
		});
	});

	describe('basedir', function () {
		it('should use common dir when given multiple paths (cjs)', function () {
			madge([__dirname + '/files/cjs/multibase/1', __dirname + '/files/cjs/multibase/2']).obj().should.eql({ '1/a': [], '2/b': [] });
		});

		it('should use common dir when given multiple paths (amd)', function () {
			madge([__dirname + '/files/amd/multibase/foo', __dirname + '/files/amd/multibase/bar'], {
				format: 'amd'
			}).obj().should.eql({ 'foo/a': [], 'bar/b': [] });
		});
	});

	describe('extensions', function () {
		it('should be ok with custom extensions', function () {
			madge(['test/files/cjs/extensions'], {extensions: ['.js', '.cjs']}).obj().should.eql({ a: [ 'b' ], b: [] });
		});
	});

	describe('.tree', function () {
		it('should accessible as an object', function () {
			madge({a: ['b', 'c']}).tree.should.be.an.Object;
		});
	});

	describe('#obj', function () {
		it('should return tree as object with dependencies as arrays', function () {
			madge({a: ['b', 'c']}).obj().should.eql({a: ['b', 'c']});
		});
	});

	describe('#dot', function () {
		it('should be able to output graphviz DOT format', function () {
			madge({
				a: ['b', 'c'],
				b: ['c'],
				c: []
			}).dot().should.eql('digraph G {\n  "a";\n  "b";\n  "c";\n  "a" -> "b";\n  "a" -> "c";\n  "b" -> "c";\n}\n');
		});
	});
});