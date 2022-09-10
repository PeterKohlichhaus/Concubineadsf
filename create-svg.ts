import { select, Selection } from "d3"
import { JSDOM } from "jsdom";

class CreateSvg {
    private svg: Selection<SVGSVGElement, unknown, null, undefined>;

    public constructor(width: number, height: number) {
        const jsdom = new JSDOM();
        const window = jsdom.window;
        const document = window.document;

        const d3Element = select(document.body);
        this.svg = d3Element
            .append("svg")
            .attr("xmlns", "http://www.w3.org/2000/svg")
            .attr("width", width)
            .attr("height", height);
    }

    public getSvg(): Selection<SVGSVGElement, unknown, null, undefined> {
        return this.svg;
    }

    public stringifySvg(): string {
        const node = this.svg.node();
        return (node) ? node.outerHTML : "";
    }
}

export { CreateSvg };
