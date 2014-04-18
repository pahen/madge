var should = require('should'),
	madge = require('../lib/madge');

describe('module format (CommonJS)', function () {

	it('should behave as expected on ok files', function () {
		madge([__dirname + '/files/cjs/normal'])
			.obj().should.eql({ 'a': [ 'sub/b' ], 'd': [], 'sub/b': [ 'sub/c' ], 'sub/c': [ 'd' ] });
	});

	it('should handle expressions in require call', function () {
		madge([__dirname + '/files/cjs/both.js'])
			.obj().should.eql({ 'both': [ 'node_modules/a', 'node_modules/b' ] });
	});

	it('should handle require call and chained functions', function () {
		madge([__dirname + '/files/cjs/chained.js'])
			.obj().should.eql({ 'chained': [ 'node_modules/a', 'node_modules/b', 'node_modules/c' ] });
	});

	it('should handle nested require call', function () {
		madge([__dirname + '/files/cjs/nested.js'])
			.obj().should.eql({ 'nested': [ 'node_modules/a', 'node_modules/b', 'node_modules/c' ] });
	});

	it('should handle strings in require call', function () {
		madge([__dirname + '/files/cjs/strings.js'])
			.obj().should.eql({ strings: [
				'events', 'node_modules/a', 'node_modules/b', 'node_modules/c',
				'node_modules/doom', 'node_modules/events2', 'node_modules/y'
			]});
	});

	it('should tackle errors in files', function () {
		madge([__dirname + '/files/cjs/error.js'])
			.obj().should.eql({ 'error': [] });
	});

	it('should be able to exclude modules', function () {
		madge([__dirname + '/files/cjs/normal'], {
			exclude: '^sub'
		}).obj().should.eql({ 'a': [], 'd': [] });

		madge([__dirname + '/files/cjs/normal'], {
			exclude: '.*\/c$'
		}).obj().should.eql({ 'a': [ 'sub/b' ], 'd': [], 'sub/b': [] });
	});

	it('should find circular dependencies', function () {
		madge([__dirname + '/files/cjs/circular'])
			.circular().getArray().should.eql([ ['a', 'b', 'c'] ]);
	});

	it('should compile coffeescript on-the-fly', function () {
		madge([__dirname + '/files/cjs/coffeescript'])
			.obj().should.eql({ 'a': ['../node_modules/b'], 'b': [] });
	});

});