export default {
	input: './index.js',
	external: [
		'@emmetio/stream-reader',
		'@emmetio/stream-reader-utils'
	],
	output: [{
		file: './dist/xml-tokenizer.es.js',
		sourcemap: true,
		format: 'es'
	}, {
		file: './dist/xml-tokenizer.cjs.js',
		sourcemap: true,
		format: 'cjs'
	}]
};
