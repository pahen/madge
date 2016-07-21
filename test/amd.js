/* eslint-env mocha */
'use strict';

const madge = require('../lib/madge');
require('should');

describe('AMD', () => {
	const dir = __dirname + '/files/amd';

	it('should find recursive dependencies', () => {
		madge(dir + '/ok/a.js').obj().should.eql({
			'a': ['sub/b'],
			'sub/b': ['sub/c'],
			'sub/c': ['d'],
			'd': []
		});
	});

	it('should ignore plugins', () => {
		madge(dir + '/plugin.js').obj().should.eql({
			'plugin': ['ok/d'],
			'ok/d': []
		});
	});

	it('should find nested dependencies', () => {
		madge(dir + '/nested/main.js').obj().should.eql({
			'a': [],
			'b': [],
			'main': [
				'a',
				'b'
			]
		});
	});

	it('should find circular dependencies', () => {
		madge(dir + '/circular/main.js').circular().should.eql([
			['a', 'c'],
			['f', 'g', 'h']
		]);
	});

	it('should find circular dependencies with relative paths', () => {
		madge(dir + '/circularRelative/a.js').circular().should.eql([['a', 'foo/b']]);
	});

	it('should find circular dependencies with alias', () => {
		madge(dir + '/circularAlias/dos.js', {
			requireConfig: dir + '/circularAlias/config.js'
		}).circular().should.eql([['dos', 'x86']]);
	});

	it('should work for files with ES6 code inside', () => {
		madge(dir + '/amdes6.js')
			.obj().should.eql({
				'amdes6': ['ok/d'],
				'ok/d': []
			});
	});

	it('should use paths found in RequireJS config', () => {
		madge(dir + '/requirejs/a.js', {
			requireConfig: dir + '/requirejs/config.js'
		}).obj().should.eql({
			'a': ['vendor/jquery-2.0.3'],
			'vendor/jquery-2.0.3': []
		});
	});

	it.skip('should compile coffeescript on-the-fly', () => {
		madge(dir + '/coffeescript/a.coffee').obj().should.eql({
			'a': ['b'], 'b': []
		});
	});

	it.skip('should handle optimized files', () => {
		madge(dir + '/a-built.js').obj().should.eql(
			{'a': ['sub/b'], 'd': [], 'sub/b': ['sub/c'], 'sub/c': ['d']
		});
	});

	it.skip('should handle optimized files originating with a `require` call', () => {
		madge(dir + '/b-built.js').obj().should.eql({
			'': ['sub/b'],
			'a': [],
			'd': [],
			'sub/b': ['sub/c'], 'sub/c': ['d']
		});
	});

	it.skip('should handle optimized files originating with a `require` call and a designated main module', () => {
		madge(dir + '/b-built.js', {
			mainRequireModule: 'a'
		}).obj().should.eql({
			'a': ['sub/b'],
			'd': [],
			'sub/b': ['sub/c'], 'sub/c': ['d']
		});
	});
});
