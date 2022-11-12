'use strict';

/* eslint-disable no-undef */
const SELECTED = 'selected';
const DIMMED = 'dimmed';
const FROM = 'from';
const TO = 'to';

const nodes = document.querySelectorAll('.node');
const edges = document.querySelectorAll('.edge');

const getTitleFrom = (el) => {
	const titleElement = el.querySelector('title');
	return titleElement ? titleElement.textContent.trim() : null;
};
const getEdgeDirections = (edgeTitle = '') => {
	const [from = '', to = ''] = edgeTitle.split('->');
	return {from: from.trim(), to: to.trim()};
};

const nodeTitleToNodeMap = new Map();

for (const node of nodes) {
	const title = getTitleFrom(node);
	title && nodeTitleToNodeMap.set(title, node);
}

const edgesMap = new Map();

for (const edge of edges) {
	const title = getTitleFrom(edge);
	const {from, to} = getEdgeDirections(title);

	let nodeList = [nodeTitleToNodeMap.get(from), nodeTitleToNodeMap.get(to)];
	edgesMap.set(title, nodeList);

	nodeList = edgesMap.get(from) || [];
	nodeList.push(edge);
	edgesMap.set(from, nodeList);

	nodeList = edgesMap.get(to) || [];
	nodeList.push(edge);
	edgesMap.set(to, nodeList);
}

let selectedTitle = null;

document.addEventListener('click', ({target}) => {
	const closest = target.closest('.edge, .node');

	if (!closest) {
		return resetAll();
	}

	const title = getTitleFrom(closest);

	if (title === selectedTitle) {
		return;
	}

	resetAll();
	closest.classList.add(SELECTED);
	edgesMap.get(title).forEach((edge) => {
		edge.classList.add(SELECTED);
		const {from} = getEdgeDirections(getTitleFrom(edge));
		edge.classList.add(from === title ? FROM : TO);
	});
	document.querySelectorAll(`.edge:not(.${SELECTED})`)
		.forEach((edge) => edge.classList.add(DIMMED));
	selectedTitle = title;
});


function resetAll() {
	selectedTitle = null;

	document.querySelectorAll(`.edge:not(.${SELECTED})`)
		.forEach((edge) => edge.classList.remove(DIMMED));

	document.querySelectorAll(`.${SELECTED}`)
		.forEach((node) => {
			node.classList.remove(SELECTED);
			node.classList.remove(TO);
			node.classList.remove(FROM);
		});
}
