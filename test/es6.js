/* eslint-env mocha */
'use strict';

const madge = require('../lib/madge');
require('should');

describe('ES6', () => {
	const dir = __dirname + '/files/es6';

	it('should find circular dependencies', (done) => {
		madge(dir + '/circular/a.js').then((res) => {
			res.circular().should.eql([
				['a', 'b', 'c']
			]);
			done();
		}).catch(done);
	});

	it('should tackle errors in files', (done) => {
		madge(dir + '/error.js').then((res) => {
			res.obj().should.eql({
				'error': []
			});
			done();
		}).catch(done);
	});

	it('should find absolute imports from the root', (done) => {
		madge(dir + '/absolute.js').then((res) => {
			res.obj().should.eql({
				'absolute': ['absolute/a'],
				'absolute/a': []
			});
			done();
		}).catch(done);
	});

	it('should find imports on files with ES7', (done) => {
		madge(dir + '/async.js').then((res) => {
			res.obj().should.eql({
				'absolute/b': [],
				'async': ['absolute/b']
			});
			done();
		}).catch(done);
	});

	it('should support export x from "./file"', (done) => {
		madge(dir + '/re-export/c.js').then((res) => {
			res.obj().should.eql({
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
			done();
		}).catch(done);
	});

	it('should find imports on files with JSX content', (done) => {
		madge(dir + '/jsx.js').then((res) => {
			res.obj().should.eql({
				'jsx': ['absolute/b'],
				'absolute/b': []
			});
			done();
		}).catch(done);
	});

	it('should find import in JSX files', (done) => {
		madge(dir + '/jsx/basic.jsx').then((res) => {
			res.obj().should.eql({
				'basic': ['other'],
				'other': []
			});
			done();
		}).catch(done);
	});

	it('should be able to exclude modules', (done) => {
		madge(dir + '/normal/a.js', {
			exclude: '.*\/sub'
		}).then((res) => {
			res.obj().should.eql({
				'a': []
			});
			done();
		}).catch(done);
	});
});
