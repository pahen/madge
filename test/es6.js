var should = require('should'),
  madge = require('../lib/madge');

describe('module format (ES6)', function () {

  it('should behave as expected on ok files', function () {
    madge([__dirname + '/files/es6/normal'], {
      format: 'es6'
    }).obj().should.eql({ 'a': [ 'sub/b' ], 'fancy-main/not-index': [], 'd': [], 'sub/b': [ 'sub/c' ], 'sub/c': [ 'd' ] });
  });

  it('should tackle errors in files', function () {
    madge([__dirname + '/files/es6/error.js'], {
      format: 'es6'
    }).obj().should.eql({ 'error': [] });
  });

  it('should be able to exclude modules', function () {
    madge([__dirname + '/files/es6/normal'], {
      exclude: '^sub',
      format: 'es6'
    }).obj().should.eql({ 'a': [], 'd': [], 'fancy-main/not-index': [] });

    madge([__dirname + '/files/es6/normal'], {
      exclude: '.*\/c$',
      format: 'es6'
    }).obj().should.eql({ 'a': [ 'sub/b' ], 'd': [], 'sub/b': [], 'fancy-main/not-index': [], });
  });

  it('should find circular dependencies', function () {
    madge([__dirname + '/files/es6/circular'], {
      format: 'es6'
    }).circular().getArray().should.eql([ ['a', 'b', 'c'] ]);
  });

  it('should find absolute imports from the root', function () {
    madge([__dirname + '/files/es6/absolute.js', __dirname + '/files/es6/absolute'], {
      format: 'es6'
    }).obj().should.eql({ 'absolute': [ 'absolute/a' ], 'absolute/a': [ 'absolute/b' ], 'absolute/b': [] });
  });

  it('should find imports on files with jsx', function() {
    var result = madge([__dirname + '/files/es6/jsx.js'], {
      format: 'es6'
    }).obj().should.eql({ 'jsx': [ 'absolute/b' ] });
  });

  it('should find imports on files with ES7', function() {
    madge([__dirname + '/files/es6/async.js'], {
      format: 'es6'
    }).obj().should.eql({ 'async': [ 'absolute/b' ] });
  });

  it('should support export x from "./file"', function() {
    madge([__dirname + '/files/es6/re-export'], {
      format: 'es6'
    }).obj().should.eql({ 'a': [], 'b-default': ['a'], 'b-named': ['a'], 'b-star': ['a'], 'c': ['b-default', 'b-named', 'b-star'] });
  });
});
