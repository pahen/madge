/* eslint-env mocha */
'use strict';

const Madge = require('../lib/api')();
require('should');

describe('TypeScript', () => {
	const dir = __dirname + '/typescript';

	it('extracts module dependencies', (done) => {
		new Madge(dir + '/import.ts').then((res) => {
			res.obj().should.eql({
				'import.ts': ['require.ts'],
				'require.ts': ['export.ts'],
				'export.ts': []
			});
			done();
		}).catch(done);
	});
});
