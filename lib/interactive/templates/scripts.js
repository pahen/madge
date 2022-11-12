'use strict';

/* eslint-disable no-undef */
const SELECTED = 'selected';
const DIMMED = 'dimmed';
const CURRENT = 'current';
const DUAL = 'dual';
const FROM = 'from';
const TO = 'to';

const getTitleFrom = (el) => {
	const titleElement = el.querySelector('title');
	return titleElement ? titleElement.textContent.trim() : null;
};
const getEdgeDirections = (edgeTitle = '') => {
	const [from = '', to = ''] = edgeTitle.split('->');
	return {from: from.trim(), to: to.trim()};
};

const resetAll = () => {
	document.querySelectorAll(`.${DIMMED}`)
		.forEach((edge) => edge.classList.remove(DIMMED));

	document.querySelectorAll(`.${SELECTED}`)
		.forEach((node) => {
			node.classList.remove(SELECTED);
			node.classList.remove(CURRENT);
			node.classList.remove(TO);
			node.classList.remove(FROM);
			node.classList.remove(DUAL);
		});
};

// prepend linear gradient:
const svgEl = document.querySelector('svg');
svgEl.insertAdjacentHTML('afterbegin', `<linearGradient id="dualDirection">
<stop offset="0%" stop-color="var(--color-from)" />
<stop offset="100%" stop-color="var(--color-to)" />
</linearGradient>`);

const nodes = document.querySelectorAll('.node');
const edges = document.querySelectorAll('.edge');

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

// select node or edge:
document.addEventListener('click', ({target}) => {
	const closest = target.closest('.edge, .node');

	if (!closest) {
		return resetAll();
	}

	if (closest.classList.contains(SELECTED)) {
		return;
	}

	const title = getTitleFrom(closest);

	resetAll();
	closest.classList.add(SELECTED);
	(edgesMap.get(title) || []).forEach((edge) => {
		edge.classList.add(SELECTED);
		const {from} = getEdgeDirections(getTitleFrom(edge));
		edge.classList.add(from === title ? FROM : TO);
	});
	document.querySelectorAll(`.edge:not(.${SELECTED})`)
		.forEach((edge) => edge.classList.add(DIMMED));
});

// add node or edge to already selected ones:
document.addEventListener('contextmenu', (event) => {
	event.preventDefault();
	const hasSelected = Boolean(document.querySelector(`.${SELECTED}`));
	if (!hasSelected) {
		return;
	}

	const closest = event.target.closest('.edge, .node');

	if (!closest || closest.classList.contains(SELECTED)) {
		return;
	}

	document.querySelectorAll(`.${CURRENT}`)
		.forEach((node) => node.classList.remove(CURRENT));

	closest.classList.remove(DIMMED);
	closest.classList.add(SELECTED);
	closest.classList.add(CURRENT);

	const title = getTitleFrom(closest);
	(edgesMap.get(title) || []).forEach((edge) => {
		edge.classList.remove(DIMMED);
		edge.classList.add(SELECTED);
		edge.classList.add(CURRENT);
		const {from, to} = getEdgeDirections(getTitleFrom(edge));

		if (edge.classList.contains(FROM) && to === title) {
			edge.classList.remove(FROM);
			edge.classList.add(DUAL);
		} else if (edge.classList.contains(TO) && from === title) {
			edge.classList.remove(TO);
			edge.classList.add(DUAL);
		} else {
			edge.classList.add(from === title ? FROM : TO);
		}
	});
	document.querySelectorAll(`.edge:not(.${CURRENT})`)
		.forEach((edge) => edge.classList.add(DIMMED));
});

document.addEventListener('keydown', ({key}) => key === 'Escape' && resetAll());
