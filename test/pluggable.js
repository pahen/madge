var should = require('should'),
	path = require('path'),
	madge = require('../lib/madge');

describe('Madge', function () {
	describe('pluggable', function () {
		it('should serve parseFile and addModule events for cjs', function () {
			var fileAdd = "";
			var idAdd = "";
			var opts = {};
			opts.onParseFile = function(obj){
				var arr = obj.filename.split(path.sep);
				fileAdd += arr[arr.length-1];
			};
			opts.onAddModule = function(obj){
				idAdd += obj.id;
			};
			madge([__dirname + '/files/cjs/normal'], opts);
			(fileAdd+idAdd).should.eql( "a.jsd.jsb.jsc.js" + "adsub/bsub/c" );
		});
	});

	describe('pluggable - amd', function () {
		it('should serve parseFile and addModule events for amd', function () {
			var fileAdd = "";
			var idAdd = "";
			var opts = {};
			opts.onParseFile = function(obj){
				var arr = obj.filename.split(path.sep);
				fileAdd += arr[arr.length-1];
			};
			opts.onAddModule = function(obj){
				idAdd += obj.id;
			};
			opts.format = 'amd';
			madge([__dirname + '/files/amd/ok'], opts);
			(idAdd+fileAdd).should.eql( "adesub/bsub/c" + "a.jsd.jse.jsb.jsc.js" );
		});
	});

	describe('pluggable - scope', function () {
		it('should add idAdd property to the returned madger', function () {
			var opts = {};
			opts.onAddModule = function(obj){
				if(this.idAdd){
					this.idAdd += obj.id;
				}
				else{
					this.idAdd = ""+obj.id;
				}
			};
			var madger = madge([__dirname + '/files/cjs/normal'], opts);
			madger.idAdd.should.eql( "adsub/bsub/c" );
		});
	});


});