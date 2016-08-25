/* eslint-env mocha */
'use strict';

const madge = require('../lib/api');
require('should');

describe('ES6', () => {
	const dir = __dirname + '/es6';

	it('extracts dependencies', (done) => {
		madge(dir + '/absolute.js').then((res) => {
			res.obj().should.eql({
				'absolute': ['absolute/a'],
				'absolute/a': []
			});
			done();
		}).catch(done);
	});

	it('finds circular dependencies', (done) => {
		madge(dir + '/circular/a.js').then((res) => {
			res.circular().should.eql([
				['a', 'b', 'c']
			]);
			done();
		}).catch(done);
	});

	it('tackles error in files', (done) => {
		madge(dir + '/error.js').then((res) => {
			res.obj().should.eql({
				'error': []
			});
			done();
		}).catch(done);
	});

	it('supports export x from "./file"', (done) => {
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
});
