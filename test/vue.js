/* eslint-env mocha */
import madge from '../lib/api.js';
import {fileURLToPath} from 'url';
import 'should';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

describe('Vue', () => {
	const dir = __dirname + '/vue';
	// this seems necessary to run the tests successfully
	const emptyTsConfig = {compilerOptions: {}};

	it('finds import in Vue files using TS', (done) => {
		madge(dir + '/BasicComponentTs.vue', {tsConfig: emptyTsConfig}).then((res) => {
			res.obj().should.eql({
				'one.ts': [],
				'BasicComponentTs.vue': ['OneNestedTs.vue', 'TwoNested.vue'],
				'OneNestedTs.vue': ['ThreeNested.vue', 'one.ts'],
				'ThreeNested.vue': [],
				'TwoNested.vue': []
			});
			done();
		}).catch(done);
	});

	it('finds import in Vue files', (done) => {
		madge(dir + '/BasicComponent.vue', {tsConfig: emptyTsConfig}).then((res) => {
			res.obj().should.eql({
				'two.js': [],
				'BasicComponent.vue': ['OneNested.vue', 'TwoNested.vue'],
				'OneNested.vue': ['ThreeNested.vue', 'two.js'],
				'ThreeNested.vue': [],
				'TwoNested.vue': []
			});
			done();
		}).catch(done);
	});
});
