import { sugiyama } from 'd3-dag';
import { CreateSvg } from './create-svg.js';
import * as d3 from 'd3';
import sharp from 'sharp';
import fs from 'fs';
class DagRenderer {
    constructor(dag, xMultiplier, yMultiplier, nodeWidth, nodeHeight, nodeRadius) {
        const layout = sugiyama().size([xMultiplier, yMultiplier]);
        this.dag = dag;
        layout(this.dag);
        this.svgHelper = new CreateSvg(xMultiplier, yMultiplier);
        this.svg = this.svgHelper.getSvg();
        this.render(nodeWidth, nodeHeight, nodeRadius);
    }
    svgString() {
        return this.svgHelper.svgString();
    }
    async createImage() {
        const buffer = await sharp(Buffer.from(this.svgString()))
            .png()
            .toBuffer();
        const background = fs.readFileSync('/home/boom/Concubine/images/backgrounds/cute.jpg');
        await sharp(background)
            .composite([
            { input: buffer }
        ])
            .toFile('images/dag.png');
    }
    render(nodeWidth, nodeHeight, nodeRadius) {
        // How to draw edges
        const line = d3
            .line()
            .curve(d3.curveStepBefore)
            .x((d) => d[0])
            .y((d) => d[1]);
        // Plot edges
        this.svg
            .append('g')
            .selectAll('path')
            .data(this.dag.links())
            .enter()
            .append('path')
            .attr('d', ({ points }) => {
            const data = points.map((point) => {
                return [point.x, point.y];
            });
            const lastPoint = points.at(-1);
            if (lastPoint) {
                data.push([lastPoint.x, lastPoint.y + 50]);
            }
            const lineData = line(data);
            return (lineData) ? lineData : '';
        })
            .attr('fill', 'none')
            .attr('stroke-width', '4px')
            .attr('stroke', '#000000');
        const nodes = this.svg
            .append('g')
            .attr('class', 'nodes')
            .selectAll('g')
            .data(this.dag.descendants())
            .enter()
            .append('g')
            .attr('transform', (blah) => {
            if (blah.value === 0) {
                return `translate(${blah.x}, ${blah.y})`;
            }
            if (blah.x && blah.y) {
                return `translate(${blah.x}, ${blah.y + 50})`;
            }
            return '';
        });
        nodes
            .append('rect')
            .attr('x', -nodeWidth * 0.5)
            .attr('y', -nodeHeight * 0.5)
            .attr('rx', nodeRadius)
            .attr('width', nodeWidth)
            .attr('height', nodeHeight)
            .attr('fill', (n) => n.data.color);
        nodes
            .append('rect')
            .attr('x', -nodeWidth * 0.5)
            .attr('y', -nodeHeight * 0.5)
            .attr('rx', nodeRadius)
            .attr('width', nodeWidth)
            .attr('height', nodeHeight)
            .attr('fill', 'none')
            .attr('stroke', '#000000')
            .attr('stroke-width', '3px')
            .attr('opacity', '.70');
        // Add text to nodes
        nodes
            .append('text')
            .text((d) => 'hello world! 😷 and good bye!')
            .attr('font-weight', 'bolder')
            .attr('font-family', 'Arial, Helvetica, sans-serif')
            .attr('text-anchor', 'middle')
            .attr('dy', '8px')
            //.attr('fill', 'white')
            .attr('font-size', '26px');
    }
}
export { DagRenderer };
