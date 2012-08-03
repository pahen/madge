var should = require('should'),
	madge = require('../lib/madge');

describe('output', function () {

	it('should be able to output graphviz DOT format', function () {
		madge({
			a: ['b', 'c'],
			b: ['c'],
			c: []
		}).dot().should.eql('digraph G {\n  "a";\n  "b";\n  "c";\n  "a" -> "b";\n  "a" -> "c";\n  "b" -> "c";\n}\n');
	});

});