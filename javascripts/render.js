import { sugiyama } from "d3-dag";
import { CreateSvg } from './create-svg.js';
import * as d3 from "d3";
import sharp from 'sharp';
import fs from "fs";
function truncate(str, n) {
    return (str.length > n) ? str.slice(0, n - 1) + '..' : str;
}
;
class Render {
    constructor(dag, xMultiplier, yMultiplier, nodeRadius) {
        const layout = sugiyama();
        this.dag = dag;
        const { width, height } = layout(this.dag);
        this.svgHelper = new CreateSvg(width * xMultiplier, height * yMultiplier);
        this.svg = this.svgHelper.getSvg();
        this.render(nodeRadius, xMultiplier, yMultiplier);
    }
    svgString() {
        return this.svgHelper.svgString();
    }
    async createImage() {
        const buffer = await sharp(Buffer.from(this.svgString()))
            .png()
            .toBuffer();
        fs.writeFileSync("images/dag.png", buffer);
    }
    render(nodeRadius, xMultiplier, yMultiplier) {
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
            .attr("fill", "white");
        // Plot edges
        this.svg
            .append("g")
            .selectAll("path")
            .data(this.dag.links())
            .enter()
            .append("path")
            .attr("d", ({ points }) => {
            const data = points.map((point) => {
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
            .data(this.dag.descendants())
            .enter()
            .append("g")
            .attr("transform", ({ x, y }) => {
            if (x && y) {
                return `translate(${xMultiplier * x}, ${yMultiplier * y})`;
            }
            return '';
        });
        // Plot node circles
        /*nodes
            .append("circle")
            .attr("r", nodeRadius)
            .attr("fill", (n) => n.data.color);

        nodes
            .append("circle")
            .attr("r", nodeRadius - 1)
            .attr("fill", "none")
            .attr("stroke", "black")
            .attr("stroke-width", "3px")
            .attr("opacity", ".5");*/
        /*nodes
            .append("ellipse")
            .attr("rx", 80)
            .attr("ry", 50)
            .attr("fill", (n) => n.data.color);
    
        nodes
            .append("ellipse")
            .attr("rx", 80)
            .attr("ry", 50)
            .attr("fill", "none")
            .attr("stroke", "black")
            .attr("stroke-width", "3px")
            .attr("opacity", ".5");*/
        nodes
            .append("rect")
            .attr("x", -80)
            .attr("y", -40)
            .attr("rx", 40)
            .attr("width", 160)
            .attr("height", 80)
            .attr("fill", (n) => n.data.color);
        nodes
            .append("rect")
            .attr("x", -80)
            .attr("y", -40)
            .attr("rx", 40)
            .attr("width", 160)
            .attr("height", 80)
            .attr("fill", "none")
            .attr("stroke", "black")
            .attr("stroke-width", "3px")
            .attr("opacity", ".5");
        // Add text to nodes
        nodes
            .append("text")
            .text((d) => truncate(d.data.name, 13))
            .attr("font-weight", "bolder")
            .attr("font-family", "Arial, Helvetica, sans-serif")
            .attr("text-anchor", "middle")
            .attr("alignment-baseline", "middle")
            .attr("fill", "white")
            .attr("font-size", "18px");
        // Arrowheads
        const arrow = d3.symbol().type(d3.symbolTriangle).size(nodeRadius * nodeRadius / 16.0);
        this.svg.append('g')
            .selectAll('path')
            .data(this.dag.links())
            .enter()
            .append('path')
            .attr('d', arrow)
            .attr('transform', ({ source, target }) => {
            if (target.x && target.y && source.x && source.y) {
                const sx = source.x * xMultiplier;
                const sy = source.y * yMultiplier;
                const tx = target.x * xMultiplier;
                const ty = target.y * yMultiplier;
                const dx = sx - tx;
                const dy = sy - ty;
                let xPerY = 0;
                let yPerX = 0;
                if ((target.y - source.y) > 0) {
                    xPerY = Math.abs(target.x - source.x) / (target.y - source.y);
                }
                if ((target.x - source.x) > 0) {
                    yPerX = (target.y - source.y) / (target.x - source.x);
                }
                const scale = nodeRadius * 0.74 / Math.sqrt(dx * dx + dy * dy);
                const angle = Math.atan2(-dy, -dx) * 180 / Math.PI + 90;
                return `translate(${tx + dx * scale + (dx / 50)}, ${ty + dy * scale + (xPerY * -8)}) rotate(${angle})`;
            }
            return ``;
        })
            .attr('fill', 'black')
            .attr('stroke', 'none');
    }
}
export { Render };
