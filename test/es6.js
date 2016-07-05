/* eslint-env mocha */
'use strict';

const madge = require('../lib/madge');
require('should');

describe('module format (ES6)', () => {

	it('should behave as expected on ok files', () => {
		madge([__dirname + '/files/es6/normal'], {
			format: 'es6'
		}).obj().should.eql({'a': ['sub/b'], 'fancy-main/not-index': [], 'd': [], 'sub/b': ['sub/c'], 'sub/c': ['d']});
	});

	it('should tackle errors in files', () => {
		madge([__dirname + '/files/es6/error.js'], {
			format: 'es6'
		}).obj().should.eql({'error': []});
	});

	it('should be able to exclude modules', () => {
		madge([__dirname + '/files/es6/normal'], {
			exclude: '^sub',
			format: 'es6'
		}).obj().should.eql({'a': [], 'd': [], 'fancy-main/not-index': []});

		madge([__dirname + '/files/es6/normal'], {
			exclude: '.*\/c$',
			format: 'es6'
		}).obj().should.eql({'a': ['sub/b'], 'd': [], 'sub/b': [], 'fancy-main/not-index': []});
	});

	it('should find circular dependencies', () => {
		madge([__dirname + '/files/es6/circular'], {
			format: 'es6'
		}).circular().getArray().should.eql([['a', 'b', 'c']]);
	});

	it('should find absolute imports from the root', () => {
		madge([__dirname + '/files/es6/absolute.js', __dirname + '/files/es6/absolute'], {
			format: 'es6'
		}).obj().should.eql({'absolute': ['absolute/a'], 'absolute/a': ['absolute/b'], 'absolute/b': []});
	});

	it('should find imports on files with jsx', () => {
		madge([__dirname + '/files/es6/jsx.js'], {
			format: 'es6'
		}).obj().should.eql({'jsx': ['absolute/b']});
	});

	it('should find imports on files with ES7', () => {
		madge([__dirname + '/files/es6/async.js'], {
			format: 'es6'
		}).obj().should.eql({'async': ['absolute/b']});
	});

	it('should support export x from "./file"', () => {
		madge([__dirname + '/files/es6/re-export'], {
			format: 'es6'
		}).obj().should.eql({'a': [], 'b-default': ['a'], 'b-named': ['a'], 'b-star': ['a'], 'c': ['b-default', 'b-named', 'b-star']});
	});

	it('can detect imports in JSX files', () => {
		madge([__dirname + '/files/es6/jsx/basic.jsx'], {
			format: 'es6'
		}).obj().should.eql({basic: [
			'../../../../other',
			'../../../../react'
		]});
	});
});
