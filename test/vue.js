/* eslint-env mocha */
'use strict';

const madge = require('../lib/api');
require('should');

describe('Vue', () => {
	const dir = __dirname + '/vue';

	it('finds import in Vue files', (done) => {
		madge(dir + '/BasicComponent.vue').then((res) => {
			res.obj().should.eql({
				'BasicComponent.vue': ['OneNested.vue', 'TwoNested.vue'],
				'OneNested.vue': ['ThreeNested.vue'], // TODO: Should also include 'vue', './NotExistingNested.vue', '../typescript/export'
				'ThreeNested.vue': [],
				'TwoNested.vue': []
			});
			done();
		}).catch(done);
	});
});
