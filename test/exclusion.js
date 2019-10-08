/* eslint-env mocha */
'use strict';

const madge = require('../lib/api');
const path = require('path');
var fs = require('fs');
require('should');

describe('exclusion', () => {
	const dir = __dirname + path.sep + 'excludegit';
	var dotgitdir = dir + path.sep + '.git' + path.sep;

	it('extracts dependencies but excludes .git', (done) => {
		if (!fs.existsSync(dotgitdir)) {
			fs.renameSync(dir + path.sep + '.git_tmp', dotgitdir);
		}	
		madge(dir, {}).then((res) => {
			if (fs.existsSync(dotgitdir)) {
				fs.renameSync(dotgitdir, dir + path.sep + '.git_tmp');
			}
			res.obj().should.eql({
				'a.js': ['b.js', 'c.js'],
				'b.js': ['c.js'],
				'c.js': []
			});
			done();
		}).catch(done);
	});
});
