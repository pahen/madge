/* eslint-env mocha */
'use strict';

const madge = require('../lib/madge');
require('should');

describe('Madge', () => {
	describe('source argument', () => {
		it('should handle a string as argument', () => {
			madge('test/files/cjs/normal/a.js').obj().should.eql({a: ['sub/b']});
		});

		it('should handle an array as argument', () => {
			madge(['test/files/cjs/normal/a.js']).obj().should.eql({a: ['sub/b']});
		});

		it('should handle a object as argument', () => {
			madge({
				a: ['b', 'c'],
				b: ['c'],
				c: []
			}).obj().should.eql({a: ['b', 'c'], b: ['c'], c: []});
		});
	});

	describe('paths', () => {
		it('should be ok with relative paths', () => {
			madge(['test/files/cjs/normal/a.js']).obj().should.eql({a: ['sub/b']});
		});
	});

	describe('basedir', () => {
		it('should use common dir when given multiple paths (cjs)', () => {
			madge([__dirname + '/files/cjs/multibase/1', __dirname + '/files/cjs/multibase/2']).obj().should.eql({'1/a': [], '2/b': []});
		});

		it('should use common dir when given multiple paths (amd)', () => {
			madge([__dirname + '/files/amd/multibase/foo', __dirname + '/files/amd/multibase/bar'], {
				format: 'amd'
			}).obj().should.eql({'foo/a': [], 'bar/b': []});
		});
	});

	describe('extensions', () => {
		it('should be ok with custom extensions', () => {
			madge(['test/files/cjs/extensions'], {extensions: ['.js', '.cjs']}).obj().should.eql({a: ['b'], b: []});
		});
	});

	describe('.tree', () => {
		it('should accessible as an object', () => {
			madge({a: ['b', 'c']}).tree.should.be.an.Object;
		});
	});

	describe('#obj', () => {
		it('should return tree as object with dependencies as arrays', () => {
			madge({a: ['b', 'c']}).obj().should.eql({a: ['b', 'c']});
		});
	});

	describe('#dot', () => {
		it('should be able to output graphviz DOT format', () => {
			madge({
				a: ['b', 'c'],
				b: ['c'],
				c: []
			}).dot().should.eql('digraph G {\n  "a";\n  "b";\n  "c";\n  "a" -> "b";\n  "a" -> "c";\n  "b" -> "c";\n}\n');
		});
	});
});
