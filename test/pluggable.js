var should = require('should'),
	madge = require('../lib/madge');

describe('Madge', function () {
	describe('pluggable', function () {
		it('should serve parseFile and addModule events', function () {
			var fileAdd = "";
			var idAdd = "";
			var opts = {};
			opts.onParseFile = function(obj){
				fileAdd += obj.src;
			};
			opts.onAddModule = function(obj){
				idAdd += obj.id;
			};
			console.log(fileAdd)
			madge([__dirname + '/files/cjs/multibase/1', __dirname + '/files/cjs/multibase/2'], opts);
			(idAdd+fileAdd).should.eql( "1/a2/b" + "module.exports = 'A';module.exports = 'B';" );
		});
	});

	describe('pluggable - scope', function () {
		it('should add idAdd property to the returned madger', function () {
			var opts = {};
			opts.onAddModule = function(obj){
				if(this.idAdd) 
					this.idAdd += obj.id;
				else
					this.idAdd = ""+obj.id;
			};
			var madger = madge([__dirname + '/files/cjs/multibase/1', __dirname + '/files/cjs/multibase/2'], opts);
			madger.idAdd.should.eql( "1/a2/b" );
		});
	});


});