import { select, Selection } from "d3"
import { JSDOM } from "jsdom";

class CreateSvg {
    private svg;
    private window;

    public constructor(width: number, height: number) {
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

    public getWindow() {
        return this.window;
    }

    public getSvg() {
        return this.svg;
    }

    public svgString() {
        const node = this.svg.node();
        return (node) ? node.outerHTML : "";
    }
}

export { CreateSvg };
