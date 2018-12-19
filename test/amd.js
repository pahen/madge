/* eslint-env mocha */
'use strict';

const Madge = require('../lib/api')();
require('should');

describe('AMD', () => {
	const dir = __dirname + '/amd';

	it('finds recursive dependencies', (done) => {
		new Madge(dir + '/ok/a.js').then((res) => {
			res.obj().should.eql({
				'a.js': ['sub/b.js'],
				'sub/b.js': ['sub/c.js'],
				'sub/c.js': ['d.js'],
				'd.js': []
			});
			done();
		}).catch(done);
	});

	it('ignores plugins', (done) => {
		new Madge(dir + '/plugin.js').then((res) => {
			res.obj().should.eql({
				'plugin.js': ['ok/d.js'],
				'ok/d.js': []
			});
			done();
		}).catch(done);
	});

	it('finds nested dependencies', (done) => {
		new Madge(dir + '/nested/main.js').then((res) => {
			res.obj().should.eql({
				'a.js': [],
				'b.js': [],
				'main.js': [
					'a.js',
					'b.js'
				]
			});
			done();
		}).catch(done);
	});

	it('finds circular dependencies', (done) => {
		new Madge(dir + '/circular/main.js').then((res) => {
			res.circular().should.eql([
				['a.js', 'c.js'],
				['f.js', 'g.js', 'h.js']
			]);
			done();
		}).catch(done);
	});

	it('finds circular dependencies with relative paths', (done) => {
		new Madge(dir + '/circularRelative/a.js').then((res) => {
			res.circular().should.eql([['a.js', 'foo/b.js']]);
			done();
		}).catch(done);
	});

	it('finds circular dependencies with alias', (done) => {
		new Madge(dir + '/circularAlias/dos.js', {
			requireConfig: dir + '/circularAlias/config.js'
		}).then((res) => {
			res.circular().should.eql([['dos.js', 'x86.js']]);
			done();
		}).catch(done);
	});

	it('works for files with ES6 code inside', (done) => {
		new Madge(dir + '/amdes6.js').then((res) => {
			res.obj().should.eql({
				'amdes6.js': ['ok/d.js'],
				'ok/d.js': []
			});
			done();
		}).catch(done);
	});

	it('uses paths found in RequireJS config', (done) => {
		new Madge(dir + '/requirejs/a.js', {
			requireConfig: dir + '/requirejs/config.js'
		}).then((res) => {
			res.obj().should.eql({
				'a.js': ['vendor/jquery-2.0.3.js'],
				'vendor/jquery-2.0.3.js': []
			});
			done();
		}).catch(done);
	});
});
