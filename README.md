# MaDGe - Module Dependency Graph

![Last version](https://img.shields.io/github/tag/pahen/madge.svg?style=flat-square)
[![Build Status](http://img.shields.io/travis/pahen/madge/master.svg?style=flat-square)](https://travis-ci.org/pahen/madge)
[![Dependency status](http://img.shields.io/david/pahen/madge.svg?style=flat-square)](https://david-dm.org/pahen/madge)
[![Dev Dependencies Status](http://img.shields.io/david/dev/pahen/madge.svg?style=flat-square)](https://david-dm.org/pahen/madge#info=devDependencies)
[![NPM Status](http://img.shields.io/npm/dm/madge.svg?style=flat-square)](https://www.npmjs.org/package/madge)
[![Donate](https://img.shields.io/badge/donate-paypal-blue.svg?style=flat-square)](https://paypal.me/pahen)

Can be used for creating graphs from your dependencies or find circular dependencies in your code. The dependencies are calculated using Joel Kemp's awesome [dependency-tree](https://github.com/mrjoelkemp/node-dependency-tree).

Works for JS (AMD, CommonJS, ES6 modules) and CSS preprocessors (Sass, Stylus); basically, any filetype supported by [precinct](https://github.com/mrjoelkemp/node-precinct).

  - For CommonJS modules, 3rd party dependencies (npm installed dependencies) are included in the tree by default
  - Dependency path resolutions are handled by [filing-cabinet](https://github.com/mrjoelkemp/node-filing-cabinet)
  - Supports RequireJS and Webpack loaders
  - All core Node modules (assert, path, fs, etc) are removed from the dependency list by default

See [release notes](#release-notes) for latest changes.

## Examples
Here's a very simple example of a generated image.

![](examples/small.png)

 - blue = has dependencies
 - green = has no dependencies
 - red = has circular dependencies

Here's an example generated from the madge source using the command `madge bin/cli.js --directory . --image examples/madge.png`.

![](examples/madge.png)

# Installation

	$ npm -g install madge

## Graphviz (optional)

Only required if you want to generate the visual graphs using [Graphviz](http://www.graphviz.org/).

### Mac OS X

	$ brew install graphviz || port install graphviz

### Ubuntu

	$ apt-get install graphviz

# API

## madge(filename: string, config: object)

> `config` is optional and should be [configuration](#configuration) to be used.

Returns a `Promise` resolved with the Madge instance object.

## Functions

#### .obj()

> Returns an `Object` with all dependencies.

	const madge = require('madge');

	madge('path/to/app.js').then((res) => {
		console.log(res.obj());
	});

#### .circular()

> Returns an `Array` with all modules that has circular dependencies.

	const madge = require('madge');

	madge('path/to/app.js').then((res) => {
		console.log(res.circular());
	});

#### .depends()

> Returns an `Array` with all modules that depends on a given module.

	const madge = require('madge');

	madge('path/to/app.js').then((res) => {
		console.log(res.depends());
	});

#### .dot()

> Returns a `String` with a DOT representation of the module dependency graph.

	const madge = require('madge');

	madge('path/to/app.js').then((res) => {
		console.log(res.dot());
	});

#### .image()

> Returns a `Promise` resolved with an image representation of the module dependency graph.

	const madge = require('madge');

	madge('path/to/app.js')
		.then((res) => res.image())
		.then((image) => {
			// write image to file
		});
	});

# Configuration

Property | Type | Default | Description
--- | --- | --- | ---
`includeNpm` | Boolean | false | If node_modules should be included
`showFileExtension` | Boolean | false | If file extensions should be included in module name
`requireConfig` | String | null | RequireJS config for resolving aliased modules
`webpackConfig` | String | null | Webpack config for resolving aliased modules
`layout` | String | dot | Layout to use in graph
`fontName` | String | Arial | Font name to use in graph
`fontSize` | String | 14px | Font size  to use in graph
`backgroundColor` | String | #000000 | Background color for the graph
`nodeColor` | String | #c6c5fe | The default node color to use in the graph
`noDependenciesColor` | String | #cfffac | Color to use for nodes with dependencies
`circularDependencyColor` | String | #ff6c60 | The color to used for circular dependencies
`edgeColor` | String | #757575 | The edge color to use in the graph

> Note that when running the CLI it's possible to use a runtime configuration file. The config should placed in `.madgerc` in your project or home folder. Look [here](https://github.com/dominictarr/rc#standards) for alternative locations for the file. Here's an example:

	{
		"showFileExtension": true,
		"fontSize": "10px"
	}

# CLI

## Examples

### List all module dependencies

	$ madge path/src/app.js

### Finding circular dependencies

	$ madge --circular path/src/app.js

### Show modules that depends on a given module

	$ madge --depends 'wheels' path/src/app.js

### Excluding modules

	$ madge --exclude '^foo$|^bar$|^tests' path/src/app.js

### Save graph as a PNG image (graphviz required)

	$ madge --image graph.png path/src/app.js

### Save graph as a [DOT](http://en.wikipedia.org/wiki/DOT_language) file for further processing (graphviz required)

	$ madge --dot path/src/app.js > graph.gv

# Debugging

To enable debugging output if you encounter problems, run madge in the following way

	$ DEBUG=* madge path/src/app.js

# Running tests

	$ npm test

# FAQ

## What's the "Error: write EPIPE" when exporting graph to image?

Ensure you have Graphviz installed. And if you're running Windows graphviz is not setting PATH variable during install. You should add folder of gvpr.exe (typically %Graphviz_folder%/bin) to PATH variable.

## The image produced by madge is very hard to read, what's wrong?

Try running madge with a different layout, here's a list of the ones you can try:

* **dot**	"hierarchical" or layered drawings of directed graphs. This is the default tool to use if edges have directionality.

* **neato** "spring model'' layouts.  This is the default tool to use if the graph is not too large (about 100 nodes) and you don't know anything else about it. Neato attempts to
minimize a global energy function, which is equivalent to statistical multi-dimensional scaling.

* **fdp**	"spring model'' layouts similar to those of neato, but does this by reducing forces rather than working with energy.

* **sfdp** multiscale version of fdp for the layout of large graphs.

* **twopi** radial layouts, after Graham Wills 97. Nodes are placed on concentric circles depending their distance from a given root node.

* **circo** circular layout, after Six and Tollis 99, Kauffman and Wiese 02. This is suitable for certain diagrams of multiple cyclic structures, such as certain telecommunications networks.

# Release Notes

## v0.6.0 (July 06, 2016)
* Refactored Madge to use ES6 and now requires Node.js 4 to run.

## v0.5.5 (July 03, 2016)
* Add note about Graphviz and Windows in README.
* Fix matching absolute path in Windows (Thanks to nadejdashed).
* Support for ES6 re-export syntax (Thanks to Oli Lalonde).
* Support files with ES6 (Thanks to Joel Kemp).
* Improve readme circular return object (Thanks to Way Of The Future).

## v0.5.4 (June 13, 2016)
* Improved JSX and ES7 support (Thanks to Joel Kemp).

## v0.5.3 (November 25, 2015)
* Correct regex on CommonJS parser to detect a core module (Thanks to Guillaume Gomez).

## v0.5.2 (October 16, 2015)
* Updated dependency resolve to latest version.

## v0.5.1 (October 15, 2015)
* Updated dependencies to newer versions (Thanks to Martin Kapp).

## v0.5.0 (April 2, 2015)
* Added support for ES6 modules (Thanks to Marc Laval).
* Added support for setting custom file extension name (Thanks to Marc Laval).

## v0.4.1 (December 19, 2014)
* Fixed issues with absolute paths for modules IDs in Windows (all tests should now pass on Windows too).

## v0.4.0 (December 19, 2014)
* Add support for JSX (React) and additional module paths (Thanks to Ben Lowery).
* Fix for detecting presence of AMD or CommonJS modules (Thanks to Aaron Russ).
* Now resolves the module IDs from the RequireJS paths-config properly (Thanks to russaa).
* Added support for option findNestedDependencies to find nested dependencies in AMD modules.

## v0.3.5 (Septemper 22, 2014)
* Fix issue with number of graph node lines increased with each render (Thanks to Colin H. Fredericks).

## v0.3.4 (Septemper 04, 2014)
* Correctly detect circular dependencies when using path aliases in RequireJS config (Thanks to Nicolas Ramz).

## v0.3.3 (July 11, 2014)
* Fixed bug with relative paths in AMD not handled properly when checking for cyclic dependencies.

## v0.3.2 (June 25, 2014)
* Handle anonymous require() as entry in the RequireJS optimized file (Thanks to Benjamin Horsleben).

## v0.3.1 (June 03, 2014)
* Apply exclude to RequireJS shim dependencies (Thanks to Michael White).

## v0.3.0 (May 25, 2014)
* Added support for onParseFile and onAddModule options (Thanks to Brandon Selway).
* Added JSON output option (Thanks to Drew Foehn).
* Fix for optimized files including dependency information for excluded modules (Thanks to Drew Foehn). Fixes [issue](https://github.com/pahen/madge/issues/26).

## v0.2.0 (April 17, 2014)
* Added support for including shim dependencies found in RequiredJS config (specify with option -R).

## v0.1.9 (February 17, 2014)
* Ensure forward slashes are used in modules paths (Windows).

## v0.1.8 (January 27, 2014)
* Added support for reading AMD dependencies from a r.js optimized file by using option -O.

## v0.1.7 (September 20, 2013)
* Added missing fontsize option when generating images.

## v0.1.6 (September 04, 2013)
* AMD plugins are now ignored as dependencies. Fixes [issue](https://github.com/pahen/grunt-madge/issues/1).

## v0.1.5 (September 04, 2013)
* Fixed Windows [issue](https://github.com/pahen/madge/issues/17) when reading from standard input with --read.

## v0.1.4 (January 10, 2013)
* Switched library for walking directory tree which should solve issues on [Windows](https://github.com/pahen/madge/issues/8).

## v0.1.3 (December 28, 2012)
* Added proper exit code when running "madge --circular" so it can be used in build scripts.

## v0.1.2 (November 15, 2012)
* Relative AMD module identifiers (if the first term is "." or "..") are now resolved.

## v0.1.1 (September 3, 2012)
* Tweaked circular dependency path output.

## v0.1.0 (September 3, 2012)
* Complete path in circular dependencies is now printed (and marked as red in image graphs).

## v0.0.5 (August 8, 2012)
* Added support for CoffeeScript. Files with extension .coffee will automatically be compiled on-the-fly.

## v0.0.4 (August 17, 2012)
* Fixed dependency issues with Node.js v0.8.

## v0.0.3 (July 01, 2012)
* Added support for Node.js v0.8 and dropped support for lower versions.

## v0.0.2 (May 21, 2012)
* Added ability to read config file and customize colors.

## v0.0.1 (May 20, 2012)
* Initial release.

# License

MIT License