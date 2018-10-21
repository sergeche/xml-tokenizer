import assert from 'assert';
import XmlParser from '../index';

describe('Parser', () => {
	class Node {
		constructor(name, token) {
			this.nodeName = name;
			this.token = token;
			this.childNodes = [];
			this.parentNode = null;
		}

		/**
		 * @param {Node} node 
		 * @returns {Node}
		 */
		appendChild(node) {
			node.parentNode = this;
			this.childNodes.push(node);
			return node;
		}
	}

	it('should pause and resume parsing', () => {
		const doc = new Node('#document');
		let ctx = doc;
		const parser = new XmlParser(
			'<p>item <b>1</b></p><p>item <b>2</b></p><p>item <b>3</b></p>',
			token => {
				if (token.type === 'open') {
					ctx = ctx.appendChild(new Node(token.name.content, token));
				} else if (token.type === 'close') {
					if (ctx.nodeName === token.name.content) {
						if (ctx.nodeName === 'p') {
							parser.pause();
						}
						ctx = ctx.parentNode;
					}
				} else {
					ctx.appendChild(new Node(`#${token.type}`, token));
				}
			});

			
		// Should pause after first <p>
		parser.parse();
		assert.equal(doc.childNodes.length, 1);
		assert.equal(doc.childNodes[0].nodeName, 'p');
		assert.equal(doc.childNodes[0].childNodes.length, 2);
		assert(!parser.eof());

		// Resume, should pause after first <p>
		parser.parse();
		assert.equal(doc.childNodes.length, 2);
		assert.equal(doc.childNodes[1].nodeName, 'p');
		assert.equal(doc.childNodes[1].childNodes.length, 2);
		assert(!parser.eof());

		// Resume, should parse full document
		parser.parse();
		assert.equal(doc.childNodes.length, 3);
		assert.equal(doc.childNodes[2].nodeName, 'p');
		assert.equal(doc.childNodes[2].childNodes.length, 2);
		assert(parser.eof());

		// Nothing to parse
		parser.parse();
		assert.equal(doc.childNodes.length, 3);
	});
});
