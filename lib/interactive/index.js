'use strict';

const {resolve} = require('path');
const {promisify} = require('util');
const readFile = promisify(require('fs').readFile);

function toHtml(styles, content, scripts) {
	return `<!DOCTYPE html>
<html lang="en" dir="ltr">
	<head>
		<meta charset="utf-8" />
		<title>Interactive Graph</title>
		<style>
${styles}
		</style>
	</head>
	<body>
${content}
		<script>
${scripts}
		</script>
	</body>
</html>
	`;
}

module.exports.generateInteractiveHtml = function (svg) {
	return Promise.all([
		readFile(resolve(__dirname, './templates/styles.css')),
		readFile(resolve(__dirname, './templates/scripts.js'))
	]).then(([styles, scripts]) => toHtml(styles, svg, scripts));
};
