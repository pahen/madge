/* eslint-env mocha */
'use strict';

const madge = require('../lib/api');
require('should');

describe('CommonJS', () => {
	const dir = __dirname + '/cjs';

	it('finds recursive dependencies', (done) => {
		madge(dir + '/normal/a.js').then((res) => {
			res.obj().should.eql({
				'a': ['sub/b'],
				'd': [],
				'sub/b': ['sub/c'],
				'sub/c': ['d']
			});
			done();
		}).catch(done);
	});

	it('handles path outside directory', (done) => {
		madge(dir + '/normal/sub/c.js').then((res) => {
			res.obj().should.eql({
				'../d': [],
				'c': ['../d']
			});
			done();
		}).catch(done);
	});

	it('finds circular dependencies', (done) => {
		madge(dir + '/circular/a.js').then((res) => {
			res.circular().should.eql([
				['a', 'd']
			]);
			done();
		}).catch(done);
	});

	it('handle extensions when finding circular dependencies', (done) => {
		madge(dir + '/circular/foo.js').then((res) => {
			res.circular().should.eql([]);
			done();
		}).catch(done);
	});

	it('excludes core modules by default', (done) => {
		madge(dir + '/core.js').then((res) => {
			res.obj().should.eql({
				'core': []
			});
			done();
		}).catch(done);
	});

	it('excludes NPM modules by default', (done) => {
		madge(dir + '/npm.js').then((res) => {
			res.obj().should.eql({
				'normal/d': [],
				'npm': ['normal/d']
			});
			done();
		}).catch(done);
	});

	it('can include shallow NPM modules', (done) => {
		madge(dir + '/npm.js', {
			includeNpm: true
		}).then((res) => {
			res.obj().should.eql({
				'normal/d': [],
				'npm': ['node_modules/a', 'normal/d']
			});
			done();
		}).catch(done);
	});

	it('can show file extensions', (done) => {
		madge(dir + '/normal/a.js', {
			showFileExtension: true
		}).then((res) => {
			res.obj().should.eql({
				'a.js': ['sub/b.js'],
				'd.js': [],
				'sub/b.js': ['sub/c.js'],
				'sub/c.js': ['d.js']
			});
			done();
		}).catch(done);
	});

});
