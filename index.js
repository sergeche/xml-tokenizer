'use strict';

/**
 * @typedef XmlParserOptions
 * @property {boolean} allowExpressions Allow expression parsing in text and attributes.
 * Expressions are code fragments of `{..}` form
 * @property {boolean} allowUnsafe Allow parsing unescaped `<` characters as text
 * if they are not used for predefined types like tags, comments etc.
 */

import StreamReader from '@emmetio/stream-reader';
import tag from './lib/tag';
import comment from './lib/comment';
import cdata from './lib/cdata';
import text from './lib/text';
import pi from './lib/processing-instruction';

const noop = () => {};

/**
 * Parses given text as XML
 * @param {string} text 
 * @param {XmlParserOptions} [options] 
 * @param {function} callback 
 */
export default function parseXml(text, options, callback) {
	if (typeof options === 'function') {
		callback = options;
		options = null;
	}

	const parser = new XmlParser(text, options);
	parser.parse(callback);
}

/** @type {XmlParserOptions} */
const defaultOptions = {
	allowExpressions: false,
	allowUnsafe: false
};

export class XmlParser {
	/**
	 * @param {string} text 
	 * @param {XmlParserOptions} options 
	 */
	constructor(text, options) {
		this.options = Object.assign({}, defaultOptions, options);
		this.stream = new StreamReader(text);
		this.paused = false;
	}

	/**
	 * Parses current document
	 */
	parse(callback = noop) {
		const { stream, options } = this;
		while (!stream.eof() && !this.paused) {
			const t = next(stream, options);

			if (!t) {
				throw stream.error('Unexpected token');
			}

			callback(t, this);
		}
	}

	/**
	 * Pauses current parsing
	 */
	pause() {
		this.paused = true;
	}

	/**
	 * Resumes parsing
	 */
	resume() {
		if (this.paused) {
			this.paused = false;
			this.parse();
		}
	}
}

/**
 * Consumes next token from given stream stream
 * @param {StreamReader} stream
 * @param {XmlParserOptions} options
 * @return {Token}
 */
function next(stream, options) {
	return tag(stream, options) || comment(stream, options)
		|| cdata(stream, options) || pi(stream, options) || text(stream, options);
}
