/**
 * Creates token from given stream
 * @param {StreamReader} stream 
 * @param {number} [start] 
 * @param {number} [end] 
 * @return {Token}
 */
export default function token(stream, start = stream.start, end = stream.pos) {
	return new Token(stream, start, end);
}

export class Token {
	constructor(stream, start, end) {
		this.stream = stream;
		this.start = start;
		this.end = end;
	}

	/**
	 * @returns {string} current token string value
	 */
	get content() {
		return this.stream.substring(this.start, this.end);
	}

	/**
	 * @return {number[]} current token range
	 */
	get range() {
		return [this.start, this.end];
	}

	/**
	 * @returns {number} current token length
	 */
	get length() {
		return this.end - this.start;
	}

	/**
	 * Creates a copy of current tag
	 * @returns {Token}
	 */
	clone() {
		return new this.constructor(this.stream, this.start, this.end);
	}

	/**
	 * @returns {string}
	 */
	toString() {
		return this.content;
	}
}
