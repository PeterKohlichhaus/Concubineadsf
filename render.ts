import { sugiyama } from "d3-dag";
import { DefaultSugiyamaOperator } from "d3-dag/dist/sugiyama/index.js";
import { CreateSvg } from './create-svg.js';
import * as d3 from "d3";
import { Dag, Point } from "d3-dag/dist/dag/index.js";
import { NodeData } from "./node-data";

class Render {
    private svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
    private svgHelper: CreateSvg;

    public getSvg(): d3.Selection<SVGSVGElement, unknown, null, undefined> {
        return this.svg;
    }

    public stringifySvg(): string {
        return this.svgHelper.stringifySvg();
    }

    public constructor(dag: Dag<NodeData, undefined>, width: number, height: number) {
        const nodeRadius: number = 60;
        const xMultiplier: number = 200;
        const yMultiplier: number = 150;

        const layout: DefaultSugiyamaOperator = sugiyama();
        this.svgHelper = new CreateSvg(width, height);
        this.svg = this.svgHelper.getSvg();

        layout(dag);

        // How to draw edges
        const line = d3
            .line()
            .curve(d3.curveCatmullRom)
            .x((d: [number, number]): number => d[0] * xMultiplier)
            .y((d: [number, number]): number => d[1] * yMultiplier);

        // Plot edges
        this.svg
            .append("g")
            .selectAll("path")
            .data(dag.links())
            .enter()
            .append("path")
            .attr("d", ({ points }): string => {
                const data: [number, number][] = points.map((point: Point) => {
                    return [point.x, point.y];
                });

                const lineData = line(data);

                return (lineData) ? lineData : '';
            })
            .attr("fill", "none")
            .attr("stroke-width", "2px")
            .attr("stroke", "black");

        const nodes = this.svg
            .append("g")
            .selectAll("g")
            .data(dag.descendants())
            .enter()
            .append("g")
            .attr("transform", ({ x, y }): string => {
                if (x && y) {
                    return `translate(${xMultiplier * x}, ${yMultiplier * y})`;
                }
                return '';
            });

        // Plot node circles
        nodes
            .append("circle")
            .attr("r", nodeRadius)
            .attr("fill", (n): string => n.data.color);

        nodes
            .append("circle")
            .attr("r", nodeRadius - 1)
            .attr("fill", "none")
            .attr("stroke", "black")
            .attr("stroke-width", "3px")
            .attr("opacity", ".5");

        // Add text to nodes
        nodes
            .append("text")
            .text((d): string => d.data.name + d.value)
            .attr("font-weight", "bold")
            .attr("font-family", "sans-serif")
            .attr("text-anchor", "middle")
            .attr("alignment-baseline", "middle")
            .attr("fill", "white")
            .attr("font-size", "1em");
    }
}

export { Render };