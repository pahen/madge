#!/usr/bin/env node
'use strict';

const fs = require('fs');
const version = require('../package.json').version;
const program = require('commander');
const printResult = require('../lib/print');
const madge = require('../lib/madge');
const rc = require('rc')('madge');
const debug = require('debug')('madge');

program
	.version(version)
	.usage('[options] <file>')
	.option('--directory <path>', '')
	.option('--list', 'show list of all dependencies (default)')
	.option('--summary', 'show summary of all dependencies')
	.option('--json', 'show list of dependencies as JSON')
	.option('--circular', 'show circular dependencies')
	.option('--depends', 'show modules that depends on the given id')
	.option('--image <filename>', 'write graph to file as a PNG image')
	.option('--layout <name>', 'layout engine to use for graph (dot/neato/fdp/sfdp/twopi/circo)')
	.option('--dot', 'show graph using the DOT language')
	.option('--no-color', 'disable color in output and image', false)
	.option('--require-config <file>', 'path to RequireJS config')
	.option('--webpack-config <file>', 'path to webpack config')
	.parse(process.argv);

if (!program.args.length) {
	console.log(program.helpInformation());
	process.exit(1);
}

if (rc.config) {
	debug('using runtime configuration from %s', rc.config);
}

const config = Object.assign({}, rc);

delete config._;
delete config.config;
delete config.configs;

['directory', 'layout', 'requireConfig', 'webpackConfig'].forEach((option) => {
	if (program[option]) {
		config[option] = program[option];
	}
});

if (!program.color) {
	config.backgroundColor = '#ffffff';
	config.nodeColor = '#00000';
	config.noDependenciesColor = '#00000';
	config.circularDependencyColor = '#000000';
	config.edgeColor = '#757575';
}

const res = madge(program.args[0], config);

if (program.list || (!program.summary && !program.circular && !program.depends && !program.image && !program.dot && !program.json)) {
	printResult.list(res.obj(), {
		colors: program.color,
		output: program.output
	});
}

if (program.summary) {
	printResult.summary(res.obj(), {
		colors: program.color,
		output: program.output
	});
}

if (program.json) {
	process.stdout.write(JSON.stringify(res.tree) + '\n');
}

if (program.circular) {
	const circular = res.circular();

	printResult.circular(circular, {
		colors: program.color,
		output: program.output
	});

	if (circular.length) {
		process.exit(1);
	}
}

if (program.depends) {
	printResult.depends(res.depends(program.depends), {
		colors: program.color,
		output: program.output
	});
}

if (program.image) {
	res.image((image) => {
		fs.writeFile(program.image, image, (err) => {
			if (err) {
				throw err;
			}
		});
	});
}

if (program.dot) {
	process.stdout.write(res.dot());
}
