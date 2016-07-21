/* eslint-env mocha */
'use strict';

const madge = require('../lib/madge');
require('should');

describe('ES6', () => {
	const dir = __dirname + '/files/es6';

	it('should find circular dependencies', () => {
		madge(dir + '/circular/a.js').circular().should.eql([
			['a', 'b', 'c']
		]);
	});

	it('should tackle errors in files', () => {
		madge(dir + '/error.js').obj().should.eql({
			'error': []
		});
	});

	it('should find absolute imports from the root', () => {
		madge(dir + '/absolute.js').obj().should.eql({
			'absolute': ['absolute/a'],
			'absolute/a': []
		});
	});

	it('should find imports on files with ES7', () => {
		madge(dir + '/async.js').obj().should.eql({
			'absolute/b': [],
			'async': ['absolute/b']
		});
	});

	it('should support export x from "./file"', () => {
		madge(dir + '/re-export/c.js').obj().should.eql({
			'a': [],
			'b-default': ['a'],
			'b-named': ['a'],
			'b-star': ['a'],
			'c': [
				'b-default',
				'b-named',
				'b-star'
			]
		});
	});

	it('should find imports on files with JSX content', () => {
		madge(dir + '/jsx.js').obj().should.eql({
			'jsx': ['absolute/b'],
			'absolute/b': []
		});
	});

	it('should find import in JSX files', () => {
		madge(dir + '/jsx/basic.jsx').obj().should.eql({
			'basic': ['other'],
			'other': []
		});
	});

	it('should be able to exclude modules', () => {
		madge(dir + '/normal/a.js', {
			exclude: '.*\/sub'
		}).obj().should.eql({
			'a': []
		});
	});
});
