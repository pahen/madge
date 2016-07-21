/* eslint-env mocha */
'use strict';

const madge = require('../lib/madge');
require('should');

describe('Madge', () => {
	describe('#constructor', () => {
		it('should throw error on missing filename argument', () => {
			(() => {
				madge();
			}).should.throw('Filename argument is missing');
		});
	});
	describe('#obj', () => {
		it('should return dependency object', () => {
			madge({a: ['b', 'c']}).obj().should.eql({a: ['b', 'c']});
		});
	});

	describe('#dot', () => {
		it('should be able to output graphviz DOT format', () => {
			madge({
				a: ['b', 'c'],
				b: ['c'],
				c: []
			}).dot().should.eql('digraph G {\n  "a";\n  "b";\n  "c";\n  "a" -> "b";\n  "a" -> "c";\n  "b" -> "c";\n}\n');
		});
	});

	describe('#depends', () => {
		it('should return modules that depends on another', () => {
			madge({
				a: ['b', 'c'],
				b: ['c'],
				c: []
			}).depends('c').should.eql(['a', 'b']);
		});
	});
});
