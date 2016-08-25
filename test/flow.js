/* eslint-env mocha */
'use strict';

const madge = require('../lib/api');
require('should');

describe('Flow', () => {
	const dir = __dirname + '/flow';

	it('extracts ES module ependencies', (done) => {
		madge(dir + '/es/calc.js').then((res) => {
			res.obj().should.eql({
				'math': [],
				'calc': ['math']
			});
			done();
		}).catch(done);
	});

	it('extracts CommonsJS module dependencies', (done) => {
		madge(dir + '/commonjs/calc.js').then((res) => {
			res.obj().should.eql({
				'math': [],
				'calc': ['math']
			});
			done();
		}).catch(done);
	});
});
