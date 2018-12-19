/* eslint-env mocha */
'use strict';

const Madge = require('../lib/api')();
require('should');

describe('ES6', () => {
	const dir = __dirname + '/es6';

	it('extracts dependencies', (done) => {
		new Madge(dir + '/absolute.js').then((res) => {
			res.obj().should.eql({
				'absolute.js': ['absolute/a.js'],
				'absolute/a.js': []
			});
			done();
		}).catch(done);
	});

	it('finds circular dependencies', (done) => {
		new Madge(dir + '/circular/a.js').then((res) => {
			res.circular().should.eql([
				['a.js', 'b.js', 'c.js']
			]);
			done();
		}).catch(done);
	});

	it('tackles error in files', (done) => {
		new Madge(dir + '/error.js').then((res) => {
			res.obj().should.eql({
				'error.js': []
			});
			done();
		}).catch(done);
	});

	it('supports export x from "./file"', (done) => {
		new Madge(dir + '/re-export/c.js').then((res) => {
			res.obj().should.eql({
				'a.js': [],
				'b-default.js': ['a.js'],
				'b-named.js': ['a.js'],
				'b-star.js': ['a.js'],
				'c.js': [
					'b-default.js',
					'b-named.js',
					'b-star.js'
				]
			});
			done();
		}).catch(done);
	});

	it('supports resolve root paths in webpack config', (done) => {
		new Madge(dir + '/webpack/src/sub/index.js', {
			webpackConfig: dir + '/webpack/webpack.config.js'
		}).then((res) => {
			res.obj().should.eql({
				'index.js': ['rel.js'],
				'abs.js': [],
				'rel.js': ['abs.js']
			});
			done();
		}).catch(done);
	});
});
