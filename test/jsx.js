/* eslint-env mocha */
'use strict';

const path = require('path');
const madge = require('../lib/api.js');
require('should'); // eslint-disable-line import/no-unassigned-import

describe('JSX', () => {
	const dir = path.join(__dirname, '/fixtures/jsx');

	it('finds import in JSX files', (done) => {
		madge(dir + '/basic.jsx').then((res) => {
			res.obj().should.eql({
				'basic.jsx': ['other.jsx'],
				'other.jsx': []
			});
			done();
		}).catch(done);
	});
});
