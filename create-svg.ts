import { select } from "d3"
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
            .attr("height", height)

        this.svg
            .append("style")
            .text("g text { filter: drop-shadow( 0 0 2px #000000 ); }");
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
