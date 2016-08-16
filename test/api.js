/* eslint-env mocha */
'use strict';

const os = require('os');
const path = require('path');
const fs = require('mz/fs');
const madge = require('../lib/api');

require('should');

describe('Madge', () => {
	it('throws error on missing path argument', () => {
		(() => {
			madge();
		}).should.throw('path argument not provided');
	});

	it('returns a Promise', () => {
		madge(__dirname + '/files/cjs/a.js').should.be.Promise(); // eslint-disable-line new-cap
	});

	it('throws error if file or directory does not exists', (done) => {
		madge(__dirname + '/missing.js').catch((err) => {
			err.message.should.match(/no such file or directory/);
			done();
		}).catch(done);
	});

	it('takes single file as path', (done) => {
		madge(__dirname + '/files/cjs/a.js').then((res) => {
			res.obj().should.eql({
				'a': ['b', 'c'],
				'b': ['c'],
				'c': []
			});
			done();
		}).catch(done);
	});

	it('takes an array of files as path and combines the result', (done) => {
		madge([__dirname + '/files/cjs/a.js', __dirname + '/files/cjs/normal/d.js']).then((res) => {
			res.obj().should.eql({
				'a': ['b', 'c'],
				'b': ['c'],
				'c': [],
				'normal/d': []
			});
			done();
		}).catch(done);
	});

	it('take a single directory as path and find files in it', (done) => {
		madge(__dirname + '/files/cjs/normal').then((res) => {
			res.obj().should.eql({
				'a': ['sub/b'],
				'd': [],
				'sub/b': ['sub/c'],
				'sub/c': ['d']
			});
			done();
		}).catch(done);
	});

	it('takes an array of directories as path and compute the basedir correctly', (done) => {
		madge([__dirname + '/files/cjs/multibase/1', __dirname + '/files/cjs/multibase/2']).then((res) => {
			res.obj().should.eql({
				'1/a': [],
				'2/b': []
			});
			done();
		}).catch(done);
	});

	it('can exclude modules using RegExp', (done) => {
		madge(__dirname + '/files/cjs/a.js', {
			excludeRegExp: ['^b$']
		}).then((res) => {
			res.obj().should.eql({
				a: ['c'],
				c: []
			});
			done();
		}).catch(done);
	});

	describe('#obj', () => {
		it('returns dependency object', (done) => {
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
		it('returns a promise resolved with graphviz DOT output', (done) => {
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
		it('returns modules that depends on another', (done) => {
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

		it('rejects if a filename is not supplied', (done) => {
			madge(__dirname + '/files/cjs/a.js')
				.then((res) => res.image())
				.catch((err) => {
					err.message.should.eql('imagePath not provided');
					done();
				});
		});

		it('rejects on unsupported image format', (done) => {
			madge(__dirname + '/files/cjs/a.js')
				.then((res) => res.image('image.zyx'))
				.catch((err) => {
					err.message.should.match(/Format: "zyx" not recognized/);
					done();
				});
		});

		it('rejects if graphviz is not installed', (done) => {
			madge(__dirname + '/files/cjs/a.js', {graphVizPath: '/invalid/path'})
				.then((res) => res.image('image.png'))
				.catch((err) => {
					err.message.should.eql('Could not execute /invalid/path/gvpr -V');
					done();
				});
		});

		it('writes image to file', (done) => {
			madge(__dirname + '/files/cjs/a.js')
				.then((res) => res.image(imagePath))
				.then((writtenImagePath) => {
					writtenImagePath.should.eql(imagePath);

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
