/* eslint-env mocha */
'use strict';

const madge = require('../lib/api');
require('should');

describe('CommonJS', () => {
	const dir = __dirname + '/files/cjs';

	it('should find recursive dependencies', (done) => {
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

	it('should handle paths outside directory', (done) => {
		madge(dir + '/normal/sub/c.js').then((res) => {
			res.obj().should.eql({
				'../d': [],
				'c': ['../d']
			});
			done();
		}).catch(done);
	});

	it('should find circular dependencies', (done) => {
		madge(dir + '/circular/a.js').then((res) => {
			res.circular().should.eql([
				['a', 'b', 'c']
			]);
			done();
		}).catch(done);
	});

	it('should exclude core modules by default', (done) => {
		madge(dir + '/core.js').then((res) => {
			res.obj().should.eql({
				'core': []
			});
			done();
		}).catch(done);
	});

	it('should exclude NPM modules by default', (done) => {
		madge(dir + '/npm.js').then((res) => {
			res.obj().should.eql({
				'normal/d': [],
				'npm': ['normal/d']
			});
			done();
		}).catch(done);
	});

	it('should be able to include NPM modules', (done) => {
		madge(dir + '/npm.js', {
			includeNpm: true
		}).then((res) => {
			res.obj().should.eql({
				'node_modules/a': [],
				'normal/d': [],
				'npm': ['node_modules/a', 'normal/d']
			});
			done();
		}).catch(done);
	});

	it('should be able to show file extensions', (done) => {
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
