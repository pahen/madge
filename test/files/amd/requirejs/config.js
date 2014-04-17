require.config({
	paths: {
		'jquery': 'vendor/jquery-2.0.3',
		'jquery.foo': 'vendor/jquery.foo-1.0',
		'jquery.bar': 'vendor/jquery.bar-1.0'
	},
	shim: {
		'jquery': { exports: '$' },
		'jquery.foo': { deps: ['jquery'] },
		'jquery.bar': { deps: ['jquery'] }
	}
});