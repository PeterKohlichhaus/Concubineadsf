import { select } from 'd3';
import { JSDOM } from 'jsdom';
class CreateSvg {
    constructor(width, height) {
        const jsdom = new JSDOM();
        this.window = jsdom.window;
        const document = this.window.document;
        const d3Element = select(document.body);
        this.svg = d3Element
            .append('svg')
            .attr('xmlns', 'http://www.w3.org/2000/svg')
            .attr('width', width)
            .attr('height', height);
        this.svg
            .append('style')
            .text(`g text { filter: drop-shadow(0 0 2px #000000); }
                .nodes text { font-family: Twitter Color Emoji; src: '/usr/share/fonts/truetype/emoji/TwitterColorEmoji-SVGinOT.ttf' }`);
    }
    getWindow() {
        return this.window;
    }
    getSvg() {
        return this.svg;
    }
    svgString() {
        const node = this.svg.node();
        return (node) ? node.outerHTML : '';
    }
}
export { CreateSvg };
