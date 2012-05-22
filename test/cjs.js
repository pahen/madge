var should = require('should'),
	madge = require('../lib/madge');

describe('module format (CommonJS)', function () {

	it('relative', function () {
		madge([__dirname + '/files/cjs/normal']).obj().should.eql({ a: [ 'sub/b' ], d: [], 'sub/b': [ 'sub/c' ], 'sub/c': [ 'd' ] });
	});

	it('both', function () {
		madge([__dirname + '/files/cjs/both.js']).obj().should.eql({ both: [ 'node_modules/a', 'node_modules/b' ] });
	});

	it('chained', function () {
		madge([__dirname + '/files/cjs/chained.js']).obj().should.eql({ chained: [ 'node_modules/a', 'node_modules/b', 'node_modules/c' ] });
	});

	it('nested', function () {
		madge([__dirname + '/files/cjs/nested.js']).obj().should.eql({ nested: [ 'node_modules/a', 'node_modules/b', 'node_modules/c' ] });
	});

	it('strings', function () {
		madge([__dirname + '/files/cjs/strings.js']).obj().should.eql({ strings: [ 'events', 'node_modules/a', 'node_modules/b', 'node_modules/c', 'node_modules/doom', 'node_modules/events2', 'node_modules/y' ] });
	});

	it('error', function () {
		madge([__dirname + '/files/cjs/error.js']).obj().should.eql({ error: [] });
	});

	it('exclude', function () {
		madge([__dirname + '/files/cjs/normal'], {
			exclude: '^sub'
		}).obj().should.eql({ a: [], d: [] });

		madge([__dirname + '/files/cjs/normal'], {
			exclude: '.*\/c$'
		}).obj().should.eql({ a: [ 'sub/b' ], d: [], 'sub/b': [] });
	});

	it('circular', function () {
		madge([__dirname + '/files/cjs/circular']).circular().should.eql({ 'c': 'a' });
	});

});