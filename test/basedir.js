var should = require('should'),
	madge = require('../lib/madge');

describe('basedir', function () {

	it('multiple (cjs)', function () {
		madge([__dirname + '/files/cjs/multibase/1', __dirname + '/files/cjs/multibase/2']).obj().should.eql({ '1/a': [], '2/b': [] });
	});

	it('multiple (amd)', function () {
		madge([__dirname + '/files/amd/multibase/foo', __dirname + '/files/amd/multibase/bar'], {
			format: 'amd'
		}).obj().should.eql({ 'foo/a': [], 'bar/b': [] });
	});

});