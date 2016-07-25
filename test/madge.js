/* eslint-env mocha */
'use strict';

const madge = require('../lib/madge');
require('should');

describe('Madge', () => {
	it('should throw error on missing filename argument', () => {
		(() => {
			madge();
		}).should.throw('Filename argument is missing');
	});

	it('should return a Promise', () => {
		madge(__dirname + '/files/cjs/a.js').should.be.Promise(); // eslint-disable-line new-cap
	});

	it('should throw error if filename argument is not a file', (done) => {
		madge(__dirname + '/files').catch((err) => {
			err.message.should.match(/is not a file/);
			done();
		}).catch(done);
	});

	it('should throw error if file does not exists', (done) => {
		madge(__dirname + '/missing.js').catch((err) => {
			err.message.should.match(/does not exists/);
			done();
		}).catch(done);
	});

	describe('#obj', () => {
		it('should return dependency object', (done) => {
			madge(__dirname + '/files/cjs/a.js').then((res) => {
				res.obj().should.eql({
					a: ['b', 'c'],
					b: ['c'],
					c: []
				});
				done();
			}).catch(done);
		});
	});

	describe('#dot', () => {
		it('should be able to output graphviz DOT format', (done) => {
			madge(__dirname + '/files/cjs/b.js').then((res) => {
				res.dot().should.eql('digraph G {\n  "b";\n  "c";\n  "b" -> "c";\n}\n');
				done();
			}).catch(done);
		});
	});

	describe('#depends', () => {
		it('should return modules that depends on another', (done) => {
			madge(__dirname + '/files/cjs/a.js').then((res) => {
				res.depends('c').should.eql(['a', 'b']);
				done();
			}).catch(done);
		});
	});

	describe('#image', () => {
		it('should return a Promise', (done) => {
			madge(__dirname + '/files/cjs/a.js').then((res) => {
				res.image('c').should.be.Promise(); // eslint-disable-line new-cap
				done();
			}).catch(done);
		});
	});
});
