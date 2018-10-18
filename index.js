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
	return new XmlParser(text, options, callback).parse();
}

/** @type {XmlParserOptions} */
const defaultOptions = {
	allowExpressions: false,
	allowUnsafe: false
};

export class XmlParser {
	/**
	 * @param {string} text 
	 * @param {XmlParserOptions} [options] 
	 * @param {function} callback
	 */
	constructor(text, options, callback) {
		if (typeof options === 'function') {
			callback = options;
			options = null;
		}
		this.options = Object.assign({}, defaultOptions, options);
		this.stream = new StreamReader(text);
		this.callback = callback || noop;
		this.paused = true;
	}

	/**
	 * Parses current document
	 * @returns {XmlParser}
	 */
	parse() {
		this.paused = false;
		const { stream, options, callback } = this;
		while (!stream.eof() && !this.paused) {
			const t = next(stream, options);

			if (!t) {
				throw stream.error('Unexpected token');
			}

			callback(t, this);
		}

		return this;
	}

	/**
	 * Pauses current parsing
	 */
	pause() {
		this.paused = true;
	}

	/**
	 * Check if parser stream is at the end of text stream, e.g.
	 * if document is fully parsed
	 * @returns {boolean}
	 */
	eof() {
		return this.stream.eof();
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
