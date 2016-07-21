/* eslint-env mocha */
'use strict';

const madge = require('../lib/madge');
require('should');

describe('CommonJS', () => {
	const dir = __dirname + '/files/cjs';

	it('should find recursive dependencies', () => {
		madge(dir + '/normal/a.js').obj().should.eql({
			'a': ['sub/b'],
			'd': [],
			'sub/b': ['sub/c'],
			'sub/c': ['d']
		});
	});

	it('should handle paths outside directory', () => {
		madge(dir + '/normal/sub/c.js').obj().should.eql({
			'../d': [],
			'c': ['../d']
		});
	});

	it('should find circular dependencies', () => {
		madge(dir + '/circular/a.js').circular().should.eql([
			['a', 'b', 'c']
		]);
	});

	it('should exclude core modules by default', () => {
		madge(dir + '/core.js').obj().should.eql({
			'core': []
		});
	});

	it('should exclude NPM modules by default', () => {
		madge(dir + '/npm.js').obj().should.eql({
			'normal/d': [],
			'npm': ['normal/d']
		});
	});

	it('should be able to include NPM modules', () => {
		madge(dir + '/npm.js', {
			includeNpm: true
		}).obj().should.eql({
			'node_modules/a': [],
			'normal/d': [],
			'npm': ['node_modules/a', 'normal/d']
		});
	});

	it('should be able to show file extensions', () => {
		madge(dir + '/normal/a.js', {
			showFileExtension: true
		}).obj().should.eql({
			'a.js': ['sub/b.js'],
			'd.js': [],
			'sub/b.js': ['sub/c.js'],
			'sub/c.js': ['d.js']
		});
	});

});
