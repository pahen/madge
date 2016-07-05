/* eslint-env mocha */
'use strict';

const madge = require('../lib/madge');
require('should');

describe('Madge', () => {
	describe('pluggable', () => {
		it('should serve parseFile and addModule events for cjs', () => {
			let fileAdd = '';
			let idAdd = '';
			const opts = {};
			opts.onParseFile = (obj) => {
				const arr = obj.filename.split('/');
				fileAdd += arr[arr.length - 1];
			};
			opts.onAddModule = (obj) => {
				idAdd += obj.id;
			};
			madge([__dirname + '/files/cjs/normal'], opts);
			(fileAdd + idAdd).should.eql('a.jsd.jsnot-index.jsb.jsc.js' + 'adfancy-main/not-indexsub/bsub/c');
		});
	});

	describe('pluggable - amd', () => {
		it('should serve parseFile and addModule events for amd', () => {
			let fileAdd = '';
			let idAdd = '';
			const opts = {};
			opts.onParseFile = (obj) => {
				const arr = obj.filename.split('/');
				fileAdd += arr[arr.length - 1];
			};
			opts.onAddModule = (obj) => {
				idAdd += obj.id;
			};
			opts.format = 'amd';
			madge([__dirname + '/files/amd/ok'], opts);
			(idAdd + fileAdd).should.eql('adesub/bsub/c' + 'a.jsd.jse.jsb.jsc.js');
		});
	});

	describe('pluggable - scope', () => {
		it('should add idAdd property to the returned madger', () => {
			const opts = {};
			opts.onAddModule = function (obj) {
				if (this.idAdd) {
					this.idAdd += obj.id;
				} else {
					this.idAdd = obj.id;
				}
			};
			const madger = madge([__dirname + '/files/cjs/normal'], opts);
			madger.idAdd.should.eql('adfancy-main/not-indexsub/bsub/c');
		});
	});
});
