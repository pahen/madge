/* eslint-env mocha */
'use strict';

const path = require('path');
const madge = require('../lib/api.js');
require('should'); // eslint-disable-line import/no-unassigned-import

describe('ES7', () => {
	const dir = path.join(__dirname, '/fixtures/es7');

	it('extracts dependencies', (done) => {
		madge(dir + '/async.js').then((res) => {
			res.obj().should.eql({
				'other.js': [],
				'async.js': ['other.js']
			});
			done();
		}).catch(done);
	});
});
