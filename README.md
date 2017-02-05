# MaDGe - Module Dependency Graph

![Last version](https://img.shields.io/github/tag/pahen/madge.svg?style=flat-square)
[![Build Status](http://img.shields.io/travis/pahen/madge/master.svg?style=flat-square)](https://travis-ci.org/pahen/madge)
[![Dependency status](http://img.shields.io/david/pahen/madge.svg?style=flat-square)](https://david-dm.org/pahen/madge)
[![Dev Dependencies Status](http://img.shields.io/david/dev/pahen/madge.svg?style=flat-square)](https://david-dm.org/pahen/madge#info=devDependencies)
[![NPM Status](http://img.shields.io/npm/dm/madge.svg?style=flat-square)](https://www.npmjs.org/package/madge)
[![Donate](https://img.shields.io/badge/donate-paypal-blue.svg?style=flat-square)](https://paypal.me/pahen)

**Madge** is a developer tool for generating a visual graph of your module dependencies, finding circular dependencies, and give you other useful info. Joel Kemp's awesome [dependency-tree](https://github.com/mrjoelkemp/node-dependency-tree) is used for extracting the dependency tree.

* Works for JavaScript (AMD, CommonJS, ES6 modules) and CSS preprocessors (Sass, Stylus)
* NPM installed dependencies are excluded by default (can be enabled)
* All core Node.js modules (assert, path, fs, etc) are excluded
* Will traverse child dependencies automatically

Read the [changelog](CHANGELOG.md) for latest changes.

## Examples

> Graph generated from madge's own code and dependencies.

<a href="http://pahen.github.io/madge/madge.svg">
	<img src="http://pahen.github.io/madge/madge.svg" width="888"/>
</a>

> A graph with circular dependencies. Blue has dependencies, green has no dependencies, and red has circular dependencies.

<a href="http://pahen.github.io/madge/simple.svg">
	<img src="http://pahen.github.io/madge/simple.svg" width="300"/>
</a>

## See it in action

<a href="https://asciinema.org/a/8zhzdbpisjqtwgrsifclyqpuz?autoplay=1">
	<img src="https://asciinema.org/a/8zhzdbpisjqtwgrsifclyqpuz.png" width="590"/>
</a>

# Installation

```sh
$ npm -g install madge
```

## Graphviz (optional)

> Only required if you want to generate the visual graphs using [Graphviz](http://www.graphviz.org/).

### Mac OS X

```sh
$ brew install graphviz || port install graphviz
```

### Ubuntu

```sh
$ apt-get install graphviz
```

# API

## madge(path: string|array|object, config: object)

> `path` is a single file or directory, or an array of files/directories to read. A predefined tree can also be passed in as an object.

> `config` is optional and should be the [configuration](#configuration) to use.

> Returns a `Promise` resolved with the Madge instance object.

## Functions

#### .obj()

> Returns an `Object` with all dependencies.

```javascript
const madge = require('madge');

madge('path/to/app.js').then((res) => {
	console.log(res.obj());
});
```

#### .warnings()

> Returns an `Object` of warnings.

```javascript
const madge = require('madge');

madge('path/to/app.js').then((res) => {
	console.log(res.warnings());
});
```

#### .circular()

> Returns an `Array` with all modules that has circular dependencies.

```javascript
const madge = require('madge');

madge('path/to/app.js').then((res) => {
	console.log(res.circular());
});
```

#### .depends()

> Returns an `Array` with all modules that depends on a given module.

```javascript
const madge = require('madge');

madge('path/to/app.js').then((res) => {
	console.log(res.depends());
});
```

#### .dot()

> Returns a `Promise` resolved with a DOT representation of the module dependency graph.

```javascript
const madge = require('madge');

madge('path/to/app.js')
	.then((res) => res.dot())
	.then((output) => {
		console.log(output);
	});
```

#### .image(imagePath: string)

> Write the graph as an image to the given image path. The [image format](http://www.graphviz.org/content/output-formats) to use is determined from the file extension. Returns a `Promise` resolved with a full path to the written image.

```javascript
const madge = require('madge');

madge('path/to/app.js')
	.then((res) => res.image('path/to/image.svg'))
	.then((writtenImagePath) => {
		console.log('Image written to ' + writtenImagePath);
	});
});
```

# Configuration

Property | Type | Default | Description
--- | --- | --- | ---
`baseDir` | String | null | Base directory to use instead of the default
`includeNpm` | Boolean | false | If shallow NPM modules should be included
`fileExtensions` | Array | ['js'] | Valid file extensions used to find files in directories
`showFileExtension` | Boolean | false | If file extension should be included in module name
`excludeRegExp` | Array | false | An array of RegExp for excluding modules
`requireConfig` | String | null | RequireJS config for resolving aliased modules
`webpackConfig` | String | null | Webpack config for resolving aliased modules
`layout` | String | dot | Layout to use in the graph
`fontName` | String | Arial | Font name to use in the graph
`fontSize` | String | 14px | Font size to use in the graph
`backgroundColor` | String | #000000 | Background color for the graph
`nodeColor` | String | #c6c5fe | Default node color to use in the graph
`noDependencyColor` | String | #cfffac | Color to use for nodes with no dependencies
`cyclicNodeColor` | String | #ff6c60 | Color to use for circular dependencies
`edgeColor` | String | #757575 | Edge color to use in the graph
`graphVizOptions` | Object | false | Custom GraphViz [options](http://www.graphviz.org/content/attrs)
`graphVizPath` | String | null | Custom GraphViz path
`detectiveOptions` | Object | false | Custom `detective` options for [dependency-tree](https://github.com/dependents/node-dependency-tree)
`dependencyFilter` | Function | false | Function called with a dependency filepath (exclude substree by returning false)

> Note that when running the CLI it's possible to use a runtime configuration file. The config should placed in `.madgerc` in your project or home folder. Look [here](https://github.com/dominictarr/rc#standards) for alternative locations for the file. Here's an example:

```json
{
	"showFileExtension": true,
	"fontSize": "10px",
	"graphVizOptions": {
		"G": {
			"rankdir": "LR"
		}
	}
}
```

# CLI

## Examples

> List dependencies from a single file

```sh
$ madge path/src/app.js
```

> List dependencies from multiple files

```sh
$ madge path/src/foo.js path/src/bar.js
```

> List dependencies from all *.js files found in a directory

```sh
$ madge path/src
```

> List dependencies from multiple directories

```sh
$ madge path/src/foo path/src/bar
```

> List dependencies from all *.js and *.jsx files found in a directory

```sh
$ madge --extensions js,jsx path/src
```

> Finding circular dependencies

```sh
$ madge --circular path/src/app.js
```

> Show modules that depends on a given module

```sh
$ madge --depends 'wheels' path/src/app.js
```

> Excluding modules

```sh
$ madge --exclude '^(foo|bar)$' path/src/app.js
```

> Save graph as a SVG image (graphviz required)

```sh
$ madge --image graph.svg path/src/app.js
```

> Save graph as a [DOT](http://en.wikipedia.org/wiki/DOT_language) file for further processing (graphviz required)

```sh
$ madge --dot path/src/app.js > graph.gv
```

> Using pipe to transform tree (this example will uppercase all paths)

```sh
$ madge --json path/src/app.js | tr '[a-z]' '[A-Z]' | madge --stdin
```

# Debugging

> To enable debugging output if you encounter problems, run madge with the `--debug` option then throw the result in a gist when creating issues on GitHub.

```sh
$ madge --debug path/src/app.js
```

# Running tests

```sh
$ npm test
```

# FAQ

## Missing dependencies?

It could happen that the files you're not seeing have been skipped due to errors or that they can't be resolved. Run madge with the `--warning` option to see skipped files. If you need even more info run with the `--debug` option.

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

# License

MIT License
