#!/usr/bin/env node

'use strict';

/**
 * Module dependencies
 */
const fs = require('fs');
const version = require('../package.json').version;
const program = require('commander');
const printResult = require('../lib/print');
const madge = require('../lib/madge');

program
	.version(version)
	.usage('[options] <file|dir ...>')
	.option('-f, --format <name>', 'format to parse (amd/cjs/es6)', 'cjs')
	.option('-L, --list', 'show list of all dependencies (default)')
	.option('-s, --summary', 'show summary of all dependencies')
	.option('-c, --circular', 'show circular dependencies')
	.option('-d, --depends <id>', 'show modules that depends on the given id')
	.option('-x, --exclude <regex>', 'a regular expression for excluding modules')
	.option('-t, --dot', 'output graph in the DOT language')
	.option('-i, --image <filename>', 'write graph to file as a PNG image')
	.option('-l, --layout <name>', 'layout engine to use for image graph (dot/neato/fdp/sfdp/twopi/circo)', 'dot')
	.option('-b, --break-on-error', 'break on parse errors & missing modules', false)
	.option('-n, --no-colors', 'skip colors in output and images', false)
	.option('-r, --read', 'skip scanning folders and read JSON from stdin')
	.option('-C, --config <filename>', 'provide a config file')
	.option('-R, --require-config <filename>', 'include shim dependencies and paths found in RequireJS config file')
	.option('-O, --optimized', 'if given file is optimized with r.js', false)
	.option('-N, --find-nested-dependencies', 'find nested dependencies in AMD modules', false)
	.option('-M, --main-require-module <name>', 'name of the primary RequireJS module, if it\'s included with `require()`', '')
	.option('-j --json', 'output dependency tree in json')
	.option('-p --paths <directory>', 'additional comma separated paths to search for dependencies (CJS only)', '')
	.option('-e --extensions <list>', 'comma separated string of valid file extensions', 'js,coffee')
	.parse(process.argv);

if (!program.args.length && !program.read && !program.requireConfig) {
	console.log(program.helpInformation());
	process.exit(1);
}

let src = program.args;

// Check config file
if (program.config && fs.existsSync(program.config)) { // eslint-disable-line no-sync
	const configOptions = JSON.parse(fs.readFileSync(program.config, 'utf8')); // eslint-disable-line no-sync
	// Duck punch the program with the new options
	// Config file take precedence
	for (const k in configOptions) {
		if (configOptions.hasOwnProperty(k)) {
			program[k] = configOptions[k];
		}
	}
}

// Read from standard input
if (program.read) {
	let buffer = '';
	process.stdin.resume();
	process.stdin.setEncoding('utf8');
	process.stdin.on('data', (chunk) => {
		buffer += chunk;
	});
	process.stdin.on('end', () => {
		src = JSON.parse(buffer);
		run();
	});
} else {
	run();
}

function run() {
	// Start parsing
	const res = madge(src, {
		format: program.format,
		breakOnError: program.breakOnError,
		exclude: program.exclude,
		optimized: program.optimized,
		requireConfig: program.requireConfig,
		mainRequireModule: program.mainRequireModule,
		paths: program.paths ? program.paths.split(',') : undefined,
		extensions: program.extensions.split(',').map((str) => '.' + str),
		findNestedDependencies: program.findNestedDependencies
	});

	// Ouput summary
	if (program.summary) {
		printResult.summary(res.obj(), {
			colors: program.colors,
			output: program.output
		});
	}

	// Output circular dependencies
	if (program.circular) {
		printResult.circular(res.circular(), {
			colors: program.colors,
			output: program.output
		});
	}

	// Output module dependencies
	if (program.depends) {
		printResult.depends(res.depends(program.depends), {
			colors: program.colors,
			output: program.output
		});
	}

	// Write image
	if (program.image) {
		res.image({
			colors: program.colors,
			layout: program.layout,
			fontFace: program.font,
			fontSize: program.fontSize,
			imageColors: program.imageColors
		}, (image) => {
			fs.writeFile(program.image, image, (err) => {
				if (err) {
					throw err;
				}
			});
		});
	}

	// Output DOT
	if (program.dot) {
		process.stdout.write(res.dot());
	}

	// Output JSON
	if (program.json) {
		process.stdout.write(JSON.stringify(res.tree) + '\n');
	}

	// Output text (default)
	if (program.list || (!program.summary && !program.circular && !program.depends && !program.image && !program.dot && !program.json)) {
		printResult.list(res.obj(), {
			colors: program.colors,
			output: program.output
		});
	}
}
