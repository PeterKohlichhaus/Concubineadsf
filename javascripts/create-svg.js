import { select } from "d3";
import { JSDOM } from "jsdom";
class CreateSvg {
    constructor(width, height) {
        const jsdom = new JSDOM();
        this.window = jsdom.window;
        const document = this.window.document;
        const d3Element = select(document.body);
        this.svg = d3Element
            .append("svg")
            .attr("xmlns", "http://www.w3.org/2000/svg")
            .attr("width", width)
            .attr("height", height);
    }
    getWindow() {
        return this.window;
    }
    getSvg() {
        return this.svg;
    }
    svgString() {
        const node = this.svg.node();
        return (node) ? node.outerHTML : "";
    }
}
export { CreateSvg };
