import { Collision } from './collision.js';
import { CreateSvg } from '../create-svg.js';
const svgHelper = new CreateSvg(640, 400);
const svg = svgHelper.getSvg();
const collision = new Collision();
const source = collision.vertex(270, 20);
const target = collision.vertex(140, 100);
const lineCollider = collision.lineCollider(source.x, source.y, target.x, target.y);
const stadiumCollider = collision.stadiumCollider(target.x, target.y, 160, 100, 30, 30);
stadiumCollider.lineColliders.forEach(lineCollider => {
    svg
        .append('line')
        .attr('x1', lineCollider.start.x)
        .attr('y1', lineCollider.start.y)
        .attr('x2', lineCollider.end.x)
        .attr('y2', lineCollider.end.y)
        .attr('stroke', '#880088')
        .attr('stroke-width', 0.5);
});
stadiumCollider.ellipseColliders.forEach(ellipseCollider => {
    svg
        .append('ellipse')
        .attr('cx', ellipseCollider.x)
        .attr('cy', ellipseCollider.y)
        .attr('rx', ellipseCollider.rx)
        .attr('ry', ellipseCollider.ry)
        .attr('fill', '#880088');
});
svg
    .append('ellipse')
    .attr('transform', `translate(${source.x}, ${source.y})`)
    .attr('rx', 2)
    .attr('fill', '#0000ff');
svg
    .append('ellipse')
    .attr('transform', `translate(${target.x}, ${target.y})`)
    .attr('rx', 2)
    .attr('fill', '#0000ff');
const intersectionPoint = collision.intersectStadium(lineCollider, stadiumCollider);
if (intersectionPoint) {
    svg
        .append('path')
        .attr('d', `M ${lineCollider.start.x} ${lineCollider.start.y} L ${intersectionPoint.x} ${intersectionPoint.y}`)
        .attr('stroke', '#ff0000')
        .attr('stroke-width', 1);
}
console.log(svgHelper.svgString());
