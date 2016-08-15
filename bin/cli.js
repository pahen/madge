#!/usr/bin/env node
'use strict';

const process = require('process');
const path = require('path');
const fs = require('mz/fs');
const program = require('commander');
const rc = require('rc')('madge');
const readPackage = require('read-package-json');
const version = require('../package.json').version;

program
	.version(version)
	.usage('[options] [file|dir]')
	.option('--basedir <path>', 'base directory for resolving paths')
	.option('--list', 'show dependency list (default)')
	.option('--summary', 'show dependency count summary')
	.option('--circular', 'show circular dependencies')
	.option('--depends <name>', 'show module dependents')
	.option('--exclude <regexp>', 'exclude modules using RegExp')
	.option('--json', 'output as JSON')
	.option('--image <file>', 'write graph to file as an image')
	.option('--layout <name>', 'layout engine to use for graph (dot/neato/fdp/sfdp/twopi/circo)')
	.option('--dot', 'show graph using the DOT language')
	.option('--require-config <file>', 'path to RequireJS config')
	.option('--webpack-config <file>', 'path to webpack config')
	.option('--no-color', 'disable color in output and image', false)
	.option('--debug', 'turn on debug output', false)
	.parse(process.argv);

if (program.debug) {
	process.env.DEBUG = '*';
}

if (!program.color) {
	process.env.DEBUG_COLORS = false;
}

const log = require('../lib/log');
const output = require('../lib/output');
const madge = require('../lib/api');
const target = program.args[0] || process.cwd();
const config = Object.assign({}, rc);

delete config._;
delete config.config;
delete config.configs;

if (rc.config) {
	log('using runtime configuration from %s', rc.config);
}

['layout', 'requireConfig', 'webpackConfig'].forEach((option) => {
	if (program[option]) {
		config[option] = program[option];
	}
});

if (program.basedir) {
	config.baseDir = program.basedir;
}

if (program.exclude) {
	config.excludeRegExp = [program.exclude];
}

if (!program.color) {
	config.backgroundColor = '#ffffff';
	config.nodeColor = '#00000';
	config.noDependencyColor = '#00000';
	config.cyclicNodeColor = '#000000';
	config.edgeColor = '#757575';
}

fs
	.stat(target)
	.then((stats) => {
		if (stats.isFile()) {
			return program.args[0];
		}

		const pkgPath = path.join(target, 'package.json');

		return new Promise((resolve, reject) => {
			readPackage(pkgPath, (err, pkg) => {
				if (err) {
					reject('Could not read ' + pkgPath + '. Choose another directory or specify file.');
					return;
				}

				config.baseDir = target;

				if (pkg.bin) {
					log('extracted file path from "bin" entry in ' + pkgPath);
					resolve(path.join(target, pkg.bin[Object.keys(pkg.bin)[0]]));
				} else if (pkg.main) {
					log('extracted file path from "main" entry in ' + pkgPath);
					resolve(path.join(target, pkg.main));
				} else {
					reject('Could not get file to scan by reading package.json. Update package.json or specify a file.');
				}
			});
		});
	})
	.then((filePath) => madge(filePath, config))
	.then((res) => {
		if (program.summary) {
			return output.summary(res.obj(), {
				json: program.json
			});
		}

		if (program.depends) {
			return output.depends(res.depends(program.depends), {
				json: program.json
			});
		}

		if (program.circular) {
			const circular = res.circular();

			output.circular(circular, {
				json: program.json
			});

			if (circular.length) {
				process.exit(1);
			}

			return;
		}

		if (program.image) {
			return res.image(program.image).then((imagePath) => {
				console.log('Image created at %s', imagePath);
			});
		}

		if (program.dot) {
			return res.dot().then((output) => {
				process.stdout.write(output);
			});
		}

		return output.list(res.obj(), {
			json: program.json
		});
	})
	.catch((err) => {
		output.error(err);

		process.exit(1);
	});
