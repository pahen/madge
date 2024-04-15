/* eslint-env mocha */
'use strict';

const path = require('path');
const madge = require('../lib/api.js');
require('should'); // eslint-disable-line import/no-unassigned-import

describe('Flow', () => {
	const dir = path.join(__dirname, '/fixtures/flow');

	it('extracts ES module ependencies', (done) => {
		madge(dir + '/es/calc.js').then((res) => {
			res.obj().should.eql({
				'math.js': [],
				'calc.js': ['math.js']
			});
			done();
		}).catch(done);
	});

	it('extracts CommonsJS module dependencies', (done) => {
		madge(dir + '/cjs/calc.js').then((res) => {
			res.obj().should.eql({
				'geometry.js': [],
				'calc.js': ['geometry.js']
			});
			done();
		}).catch(done);
	});

	it('extracts CommonsJS module dependencies with mixed import syntax', (done) => {
		madge(dir + '/cjs/calc.js', {detectiveOptions: {es6: {mixedImports: true}}}).then((res) => {
			res.obj().should.eql({
				'geometry.js': [],
				'math.js': [],
				'calc.js': ['geometry.js', 'math.js']
			});
			done();
		}).catch(done);
	});
});
