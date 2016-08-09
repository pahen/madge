/* eslint-env mocha */
'use strict';

const os = require('os');
const path = require('path');
const fs = require('mz/fs');
const madge = require('../lib/api');

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
		it('should return a promise resolved with graphviz DOT output', (done) => {
			madge(__dirname + '/files/cjs/b.js')
				.then((res) => res.dot())
				.then((output) => {
					output.should.eql('digraph G {\n  "b";\n  "c";\n  "b" -> "c";\n}\n');
					done();
				})
				.catch(done);
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
		let imagePath;

		beforeEach(() => {
			imagePath = path.join(os.tmpdir(), 'madge_' + Date.now() + '_image.png');
		});

		afterEach(() => {
			fs.unlink(imagePath);
		});

		it('should reject if a filename is not supplied', (done) => {
			madge(__dirname + '/files/cjs/a.js')
				.then((res) => res.image())
				.catch((err) => {
					err.message.should.eql('imagePath not provided');
					done();
				});
		});

		it('should write image to file', (done) => {
			madge(__dirname + '/files/cjs/a.js')
				.then((res) => res.image(imagePath))
				.then(() => {
					return fs
						.exists(imagePath)
						.then((exists) => {
							if (!exists) {
								throw new Error(imagePath + ' not created');
							}
							done();
						});
				})
				.catch(done);
		});
	});
});
