import token from './token';
import { eatPair } from '@emmetio/stream-reader-utils';

export const EXPRESSION_START = 123; // {
export const EXPRESSION_END = 125; // }

/**
 * Consumes expression from current stream location
 * @param {StreamReader} stream 
 * @return {Token}
 */
export default function expression(stream) {
	const start = stream.pos;
	if (eatPair(stream, EXPRESSION_START, EXPRESSION_END)) {
		return {
			type: 'expression',
			range: token(stream, start),
			value: token(stream, start + 1, stream.pos - 1)
		};
	}
}
