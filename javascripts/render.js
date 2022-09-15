import { sugiyama } from 'd3-dag';
import { CreateSvg } from './create-svg.js';
import * as d3 from 'd3';
import sharp from 'sharp';
import fs from 'fs';
import { Collision } from './collision-detection/collision.js';
function sqr(x) { return x * x; }
function dist2(v, w) { return sqr(v.x - w.x) + sqr(v.y - w.y); }
function truncate(str, n) {
    return (str.length > n) ? str.slice(0, n - 1) + '..' : str;
}
;
class Render {
    constructor(dag, xMultiplier, yMultiplier, nodeRadius) {
        const layout = sugiyama().size([xMultiplier, yMultiplier]);
        this.dag = dag;
        const { width, height } = layout(this.dag);
        this.svgHelper = new CreateSvg(width, height);
        this.svg = this.svgHelper.getSvg();
        this.render(nodeRadius);
    }
    svgString() {
        return this.svgHelper.svgString();
    }
    async createImage() {
        const buffer = await sharp(Buffer.from(this.svgString()))
            .png()
            .toBuffer();
        fs.writeFileSync('images/dag.png', buffer);
    }
    render(nodeRadius) {
        // How to draw edges
        const line = d3
            .line()
            //.curve(d3.curveCatmullRom)
            .x((d) => d[0])
            .y((d) => d[1]);
        // Background color
        this.svg
            .append('rect')
            .attr('width', '100%')
            .attr('height', '100%')
            .attr('fill', '#ffffff');
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
            const lineData = line(data);
            return (lineData) ? lineData : '';
        })
            .attr('fill', 'none')
            .attr('stroke-width', '2px')
            .attr('stroke', '#000000');
        const nodes = this.svg
            .append('g')
            .selectAll('g')
            .data(this.dag.descendants())
            .enter()
            .append('g')
            .attr('transform', ({ x, y }) => {
            if (x && y) {
                return `translate(${x}, ${y})`;
            }
            return '';
        });
        nodes
            .append('rect')
            .attr('x', -80)
            .attr('y', -40)
            .attr('rx', 46)
            .attr('width', 160)
            .attr('height', 100)
            .attr('fill', (n) => n.data.color);
        nodes
            .append('rect')
            .attr('x', -80)
            .attr('y', -40)
            .attr('rx', 46)
            .attr('width', 160)
            .attr('height', 100)
            .attr('fill', 'none')
            .attr('stroke', '#000000')
            .attr('stroke-width', '3px')
            .attr('opacity', '.70');
        // Arrowheads
        const arrow = d3.symbol().type(d3.symbolTriangle).size(nodeRadius * nodeRadius / 33.0);
        this.svg.append('g')
            .selectAll('path')
            .data(this.dag.links())
            .enter()
            .append('path')
            .attr('d', arrow)
            .attr('transform', ({ points }) => {
            const start = points.at(-2);
            const end = points.at(-1);
            if (start && end) {
                const collision = new Collision();
                const stadiumCollider = collision.stadiumCollider(end.x, end.y, 160, 100, 46, 46);
                const lineCollider = collision.lineCollider(start.x, start.y, end.x, end.y);
                const intersectionPoint = collision.intersectStadium(lineCollider, stadiumCollider);
                if (intersectionPoint) {
                    const tmpLine = collision.lineCollider(start.x, start.y, intersectionPoint.x, intersectionPoint.y);
                    return `translate(${intersectionPoint.x}, ${intersectionPoint.y}), rotate(${tmpLine.angle + 180})`;
                }
            }
            return ``;
        })
            .attr('fill', 'black')
            .attr('stroke', 'none');
        // Add text to nodes
        nodes
            .append('text')
            .text((d) => truncate(d.data.name, 13))
            .attr('font-weight', 'bolder')
            .attr('font-family', 'Arial, Helvetica, sans-serif')
            .attr('text-anchor', 'middle')
            .attr('dy', '0.8em')
            .attr('fill', 'white')
            .attr('font-size', '18px');
    }
}
export { Render };
