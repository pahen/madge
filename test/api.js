/* eslint-env mocha */
'use strict';

const os = require('os');
const path = require('path');
const fs = require('mz/fs');
const Madge = require('../lib/api')();

require('should');

describe('API', () => {
	it('throws error on missing path argument', () => {
		(() => {
			return new Madge();
		}).should.throw('path argument not provided');
	});

	it('returns a Promise', () => {
		new Madge(__dirname + '/cjs/a.js').should.be.Promise(); // eslint-disable-line new-cap
	});

	it('throws error if file or directory does not exists', (done) => {
		new Madge(__dirname + '/missing.js').catch((err) => {
			err.message.should.match(/no such file or directory/);
			done();
		}).catch(done);
	});

	it('takes single file as path', (done) => {
		new Madge(__dirname + '/cjs/a.js').then((res) => {
			res.obj().should.eql({
				'a.js': ['b.js', 'c.js'],
				'b.js': ['c.js'],
				'c.js': []
			});
			done();
		}).catch(done);
	});

	it('takes an array of files as path and combines the result', (done) => {
		new Madge([__dirname + '/cjs/a.js', __dirname + '/cjs/normal/d.js']).then((res) => {
			res.obj().should.eql({
				'a.js': ['b.js', 'c.js'],
				'b.js': ['c.js'],
				'c.js': [],
				'normal/d.js': []
			});
			done();
		}).catch(done);
	});

	it('take a single directory as path and find files in it', (done) => {
		new Madge(__dirname + '/cjs/normal').then((res) => {
			res.obj().should.eql({
				'a.js': ['sub/b.js'],
				'd.js': [],
				'sub/b.js': ['sub/c.js'],
				'sub/c.js': ['d.js']
			});
			done();
		}).catch(done);
	});

	it('takes an array of directories as path and compute the basedir correctly', (done) => {
		new Madge([__dirname + '/cjs/multibase/1', __dirname + '/cjs/multibase/2']).then((res) => {
			res.obj().should.eql({
				'1/a.js': [],
				'2/b.js': []
			});
			done();
		}).catch(done);
	});

	it('takes a predefined tree', (done) => {
		new Madge({
			a: ['b', 'c', 'd'],
			b: ['c'],
			c: [],
			d: ['a']
		}).then((res) => {
			res.obj().should.eql({
				a: ['b', 'c', 'd'],
				b: ['c'],
				c: [],
				d: ['a']
			});
			done();
		}).catch(done);
	});

	it('can exclude modules using RegExp', (done) => {
		new Madge(__dirname + '/cjs/a.js', {
			excludeRegExp: ['^b.js$']
		}).then((res) => {
			res.obj().should.eql({
				'a.js': ['c.js'],
				'c.js': []
			});
			done();
		}).catch(done);
	});

	describe('dependencyFilter', () => {
		it('will stop traversing when returning false', (done) => {
			new Madge(__dirname + '/cjs/a.js', {
				dependencyFilter: () => {
					return false;
				}
			}).then((res) => {
				res.obj().should.eql({
					'a.js': []
				});
				done();
			}).catch(done);
		});

		it('will not stop traversing when not returning anything', (done) => {
			new Madge(__dirname + '/cjs/a.js', {
				dependencyFilter: () => {}
			}).then((res) => {
				res.obj().should.eql({
					'a.js': ['b.js', 'c.js'],
					'b.js': ['c.js'],
					'c.js': []
				});
				done();
			}).catch(done);
		});

		it('will pass arguments to the function', (done) => {
			let counter = 0;

			new Madge(__dirname + '/cjs/a.js', {
				dependencyFilter: (dependencyFilePath, traversedFilePath, baseDir) => {
					if (counter === 0) {
						dependencyFilePath.should.match(/test\/cjs\/b\.js$/);
						traversedFilePath.should.match(/test\/cjs\/a\.js$/);
						baseDir.should.match(/test\/cjs$/);
					}

					if (counter === 1) {
						dependencyFilePath.should.match(/test\/cjs\/c\.js$/);
						traversedFilePath.should.match(/test\/cjs\/a\.js$/);
						baseDir.should.match(/test\/cjs$/);
					}

					if (counter === 2) {
						dependencyFilePath.should.match(/test\/cjs\/c\.js$/);
						traversedFilePath.should.match(/test\/cjs\/b\.js$/);
						baseDir.should.match(/test\/cjs$/);
					}

					counter++;
				}
			}).then(() => {
				done();
			}).catch(done);
		});
	});

	describe('obj()', () => {
		it('returns dependency object', (done) => {
			new Madge(__dirname + '/cjs/a.js').then((res) => {
				res.obj().should.eql({
					'a.js': ['b.js', 'c.js'],
					'b.js': ['c.js'],
					'c.js': []
				});
				done();
			}).catch(done);
		});
	});

	describe('warnings()', () => {
		it('returns an array of skipped files', (done) => {
			new Madge(__dirname + '/cjs/missing.js').then((res) => {
				res.obj().should.eql({
					'missing.js': ['c.js'],
					'c.js': []
				});
				res.warnings().should.eql({
					skipped: ['./path/non/existing/file']
				});
				done();
			}).catch(done);
		});
	});

	describe('dot()', () => {
		it('returns a promise resolved with graphviz DOT output', (done) => {
			new Madge(__dirname + '/cjs/b.js')
				.then((res) => res.dot())
				.then((output) => {
					output.should.eql('digraph G {\n  "b.js";\n  "c.js";\n  "b.js" -> "c.js";\n}\n');
					done();
				})
				.catch(done);
		});
	});

	describe('depends()', () => {
		it('returns modules that depends on another', (done) => {
			new Madge(__dirname + '/cjs/a.js').then((res) => {
				res.depends('c.js').should.eql(['a.js', 'b.js']);
				done();
			}).catch(done);
		});
	});

	describe('orphans()', () => {
		it('returns modules that no one is depending on', (done) => {
			new Madge(__dirname + '/cjs/normal').then((res) => {
				res.orphans().should.eql(['a.js']);
				done();
			}).catch(done);
		});
	});

	describe('image()', () => {
		let imagePath;

		beforeEach(() => {
			imagePath = path.join(os.tmpdir(), 'madge_' + Date.now() + '_image.png');
		});

		afterEach(() => {
			return fs.unlink(imagePath).catch(() => {});
		});

		it('rejects if a filename is not supplied', (done) => {
			new Madge(__dirname + '/cjs/a.js')
				.then((res) => res.image())
				.catch((err) => {
					err.message.should.eql('imagePath not provided');
					done();
				});
		});

		it('rejects on unsupported image format', (done) => {
			new Madge(__dirname + '/cjs/a.js')
				.then((res) => res.image('image.zyx'))
				.catch((err) => {
					err.message.should.match(/Format: "zyx" not recognized/);
					done();
				});
		});

		it('rejects if graphviz is not installed', (done) => {
			const invalidGraphVizPath = '/invalid/path';
			Madge.checkGraphviz(invalidGraphVizPath)
				.catch((err) => {
					err.message.should.match(/Could not execute .*gvpr \-V/);
					done();
				});
		});

		it('writes image to file', (done) => {
			new Madge(__dirname + '/cjs/a.js')
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
