/* eslint-env mocha */
'use strict';

const Madge = require('../lib/api')();
require('should');

describe('Flow', () => {
	const dir = __dirname + '/flow';

	it('extracts ES module ependencies', (done) => {
		new Madge(dir + '/es/calc.js').then((res) => {
			res.obj().should.eql({
				'math.js': [],
				'calc.js': ['math.js']
			});
			done();
		}).catch(done);
	});

	it('extracts CommonsJS module dependencies', (done) => {
		new Madge(dir + '/cjs/calc.js').then((res) => {
			res.obj().should.eql({
				'math.js': [],
				'calc.js': ['math.js']
			});
			done();
		}).catch(done);
	});
});
