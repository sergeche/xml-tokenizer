'use strict';

import { eatSection, toCharCodes } from './utils';

const open  = toCharCodes('<![CDATA[');
const close = toCharCodes(']]>');

/**
 * Consumes CDATA from given stream
 * @param  {StreamReader} stream
 * @return {Token}
 */
export default function comment(stream) {
	return eatSection(stream, open, close, 'cdata');
}
