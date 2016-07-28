/* eslint-env mocha */
'use strict';

const madge = require('../lib/api');
require('should');

describe('AMD', () => {
	const dir = __dirname + '/files/amd';

	it('should find recursive dependencies', (done) => {
		madge(dir + '/ok/a.js').then((res) => {
			res.obj().should.eql({
				'a': ['sub/b'],
				'sub/b': ['sub/c'],
				'sub/c': ['d'],
				'd': []
			});
			done();
		}).catch(done);
	});

	it('should ignore plugins', (done) => {
		madge(dir + '/plugin.js').then((res) => {
			res.obj().should.eql({
				'plugin': ['ok/d'],
				'ok/d': []
			});
			done();
		}).catch(done);
	});

	it('should find nested dependencies', (done) => {
		madge(dir + '/nested/main.js').then((res) => {
			res.obj().should.eql({
				'a': [],
				'b': [],
				'main': [
					'a',
					'b'
				]
			});
			done();
		}).catch(done);
	});

	it('should find circular dependencies', (done) => {
		madge(dir + '/circular/main.js').then((res) => {
			res.circular().should.eql([
				['a', 'c'],
				['f', 'g', 'h']
			]);
			done();
		}).catch(done);
	});

	it('should find circular dependencies with relative paths', (done) => {
		madge(dir + '/circularRelative/a.js').then((res) => {
			res.circular().should.eql([['a', 'foo/b']]);
			done();
		}).catch(done);
	});

	it('should find circular dependencies with alias', (done) => {
		madge(dir + '/circularAlias/dos.js', {
			requireConfig: dir + '/circularAlias/config.js'
		}).then((res) => {
			res.circular().should.eql([['dos', 'x86']]);
			done();
		}).catch(done);
	});

	it('should work for files with ES6 code inside', (done) => {
		madge(dir + '/amdes6.js').then((res) => {
			res.obj().should.eql({
				'amdes6': ['ok/d'],
				'ok/d': []
			});
			done();
		}).catch(done);
	});

	it('should use paths found in RequireJS config', (done) => {
		madge(dir + '/requirejs/a.js', {
			requireConfig: dir + '/requirejs/config.js'
		}).then((res) => {
			res.obj().should.eql({
				'a': ['vendor/jquery-2.0.3'],
				'vendor/jquery-2.0.3': []
			});
			done();
		}).catch(done);
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
