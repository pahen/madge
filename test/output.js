var should = require('should'),
	madge = require('../index');

describe('output', function () {

	it('dot', function () {
		madge({
			a: ['b', 'c'],
			b: ['c'],
			c: []
		}).dot().should.eql('digraph G {\n  "a";\n  "b";\n  "c";\n  "a" -> "b";\n  "a" -> "c";\n  "b" -> "c";\n}\n');
	});

});