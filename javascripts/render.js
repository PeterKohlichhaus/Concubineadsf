import { sugiyama } from "d3-dag";
import { CreateSvg } from './create-svg.js';
import * as d3 from "d3";
class Render {
    constructor(dag, width, height) {
        const nodeRadius = 60;
        const xMultiplier = 220;
        const yMultiplier = 220;
        const layout = sugiyama();
        this.svgHelper = new CreateSvg(width, height);
        this.svg = this.svgHelper.getSvg();
        layout(dag);
        // How to draw edges
        const line = d3
            .line()
            .curve(d3.curveCatmullRom)
            .x((d) => d[0] * xMultiplier)
            .y((d) => d[1] * yMultiplier);
        // Plot edges
        this.svg
            .append("g")
            .selectAll("path")
            .data(dag.links())
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
            .data(dag.descendants())
            .enter()
            .append("g")
            .attr("transform", ({ x, y }) => {
            if (x && y) {
                return `translate(${xMultiplier * x}, ${yMultiplier * y})`;
            }
            return '';
        });
        // Plot node circles
        nodes
            .append("circle")
            .attr("r", nodeRadius)
            .attr("fill", (n) => n.data.color);
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
            .text((d) => d.data.name + d.value)
            .attr("font-weight", "bold")
            .attr("font-family", "sans-serif")
            .attr("text-anchor", "middle")
            .attr("alignment-baseline", "middle")
            .attr("fill", "white")
            .attr("font-size", "1em");
        // Arrowheads
        const arrow = d3.symbol().type(d3.symbolTriangle).size(nodeRadius * nodeRadius / 8.0);
        this.svg.append('g')
            .selectAll('path')
            .data(dag.links())
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
                const scale = nodeRadius * 1.30 / Math.sqrt(dx * dx + dy * dy);
                const angle = Math.atan2(-dy, -dx) * 180 / Math.PI + 90;
                return `translate(${tx + dx * scale}, ${ty + dy * scale}) rotate(${angle})`;
            }
            return ``;
        })
            .attr('fill', 'black')
            .attr('stroke', 'none');
    }
    getSvg() {
        return this.svg;
    }
    stringifySvg() {
        return this.svgHelper.stringifySvg();
    }
}
export { Render };
