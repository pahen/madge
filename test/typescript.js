/* eslint-env mocha */
'use strict';

const madge = require('../lib/api');
require('should');

describe('TypeScript', () => {
	const dir = __dirname + '/typescript';

	it('extracts module dependencies', (done) => {
		madge(dir + '/import.ts').then((res) => {
			res.obj().should.eql({
				'import.ts': ['require.ts'],
				'require.ts': ['export.ts'],
				'export.ts': []
			});
			done();
		}).catch(done);
	});
});
