import { sugiyama } from "d3-dag";
import { CreateSvg } from './create-svg.js';
import * as d3 from "d3";
import { Dag, Point } from "d3-dag/dist/dag/index.js";
import { NodeData } from "./node-data";
import sharp from 'sharp';
import fs from "fs";

function truncate(str: string, n: number) {
    return (str.length > n) ? str.slice(0, n - 1) + '..' : str;
};

class Render {
    private svg;
    private svgHelper;
    private dag;

    public constructor(dag: Dag<NodeData, undefined>, xMultiplier: number, yMultiplier: number, nodeRadius: number) {
        const layout = sugiyama();

        this.dag = dag;

        const { width, height } = layout(this.dag);
        this.svgHelper = new CreateSvg(width * xMultiplier, height * yMultiplier);
        this.svg = this.svgHelper.getSvg();
        this.render(nodeRadius, xMultiplier, yMultiplier);
    }

    public svgString() {
        return this.svgHelper.svgString();
    }

    public async createImage() {
        const buffer =
            await sharp(Buffer.from(this.svgString()))
                .png()
                .toBuffer();

        fs.writeFileSync("images/dag.png", buffer);
    }

    private render(nodeRadius: number, xMultiplier: number, yMultiplier: number) {
        // How to draw edges
        const line = d3
            .line()
            .curve(d3.curveCatmullRom)
            .x((d) => d[0] * xMultiplier)
            .y((d) => d[1] * yMultiplier);

        // Background color
        this.svg
            .append("rect")
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("fill", "#ffffff");

        // Plot edges
        this.svg
            .append("g")
            .selectAll("path")
            .data(this.dag.links())
            .enter()
            .append("path")
            .attr("d", ({ points }) => {
                const data: [number, number][] = points.map((point: Point) => {
                    return [point.x, point.y];
                });

                const lineData = line(data);

                return (lineData) ? lineData : '';
            })
            .attr("fill", "none")
            .attr("stroke-width", "2px")
            .attr("stroke", "#000000");

        const nodes = this.svg
            .append("g")
            .selectAll("g")
            .data(this.dag.descendants())
            .enter()
            .append("g")
            .attr("transform", ({ x, y }): string => {
                if (x && y) {
                    return `translate(${xMultiplier * x}, ${yMultiplier * y})`;
                }
                return '';
            });

        nodes
            .append("rect")
            .attr("x", -80)
            .attr("y", -40)
            .attr("rx", 46)
            .attr("width", 160)
            .attr("height", 100)
            .attr("fill", (n) => n.data.color);

        nodes
            .append("rect")
            .attr("x", -80)
            .attr("y", -40)
            .attr("rx", 46)
            .attr("width", 160)
            .attr("height", 100)
            .attr("fill", "none")
            .attr("stroke", "#000000")
            .attr("stroke-width", "3px")
            .attr("opacity", ".70");

        // Arrowheads
        const arrow = d3.symbol().type(d3.symbolTriangle).size(nodeRadius * nodeRadius / 28.0);
        this.svg.append('g')
            .selectAll('path')
            .data(this.dag.links())
            .enter()
            .append('path')
            .attr('d', arrow)
            .attr('transform', ({
                points
            }) => {
                const start = points.at(-2);
                const end = points.at(-1);
                if (start && end) {
                    const sx: number = start.x * xMultiplier;
                    const sy = start.y * yMultiplier;

                    const tx = end.x * xMultiplier;
                    const ty = end.y * yMultiplier;

                    const dx = sx - tx;
                    const dy = sy - ty;

                    let xPerY = 0;
                    let yPerX = 0;

                    if ((end.y - start.y) > 0) {
                        xPerY = Math.abs(end.x - start.x) / (end.y - start.y);
                    }
                    if ((end.x - start.x) > 0) {
                        yPerX = (end.y - start.y) / (end.x - start.x);
                    }

                    const scale = nodeRadius * 0.69 / Math.sqrt(dx * dx + dy * dy);

                    const angle = Math.atan2(-dy, -dx) * 180 / Math.PI + 90;

                    return `translate(${tx + dx * scale + (dx / 26)}, ${ty + dy * scale + (xPerY * -16)}) rotate(${angle})`;
                }
                return ``
            })
            .attr('fill', 'black')
            .attr('stroke', 'none');

        // Add text to nodes
        nodes
            .append("text")
            .text((d) => truncate(d.data.name, 13))
            .attr("font-weight", "bolder")
            .attr("font-family", "Arial, Helvetica, sans-serif")
            .attr("text-anchor", "middle")
            .attr("dy", "0.8em")
            .attr("fill", "white")
            .attr("font-size", "18px");

    }
}

export { Render };
