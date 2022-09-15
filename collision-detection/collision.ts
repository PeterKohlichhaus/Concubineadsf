import { line } from "d3";

class Collision {
    public stadiumCollider(x: number, y: number, width: number, height: number, rx: number, ry: number): StadiumCollider {
        const halfHeight = height * 0.5;
        const halfWidth = width * 0.5;
        const lineColliders = [
            this.lineCollider(
                x - halfWidth + rx,
                y - halfHeight,
                x + halfWidth - rx,
                y - halfHeight
            ),
            this.lineCollider(
                x - halfWidth + rx,
                y + halfHeight,
                x + halfWidth - rx,
                y + halfHeight
            ),
            this.lineCollider(
                x - halfWidth,
                y - halfHeight + ry,
                x - halfWidth,
                y + halfHeight - ry
            ),
            this.lineCollider(
                x + halfWidth,
                y - halfHeight + ry,
                x + halfWidth,
                y + halfHeight - ry
            )];
        const ellipseColliders = [
            this.ellipseCollider(
                x - halfWidth + rx,
                y - halfHeight + ry,
                rx,
                ry
            ),
            this.ellipseCollider(
                x + halfWidth - rx,
                y - halfHeight + ry,
                rx,
                ry
            ),
            this.ellipseCollider(
                x - halfWidth + rx,
                y + halfHeight - ry,
                rx,
                ry
            ),
            this.ellipseCollider(
                x + halfWidth - rx,
                y + halfHeight - ry,
                rx,
                ry
            )
        ];

        return {
            x,
            y,
            width,
            height,
            rx,
            ry,
            lineColliders,
            ellipseColliders
        };
    }

    public ellipseCollider(x: number, y: number, rx: number, ry: number) {
        return { x, y, rx, ry };
    }

    public lineCollider(x1: number, y1: number, x2: number, y2: number): LineCollider {
        const v = this.vertex(x1, y1);
        const w = this.vertex(x2, y2);
        const angle = (Math.atan2(y1 - y2, x1 - x2) * (180 / Math.PI) + 90) % 360;
        const length = this.lineDistance(v, w);
        return { start: v, end: w, length, angle };
    }

    public vertex(x: number, y: number): Vertex {
        return { x, y };
    }

    public sqr(x: number) {
        return x * x;
    }

    public lineDistance(v: Vertex, w: Vertex) {
        const dx = v.x - w.x;
        const dy = v.y - w.y;
        return Math.hypot(dx, dy);
    }

    // line intercept math by Paul Bourke http://paulbourke.net/geometry/pointlineplane/
    // Determine the intersection point of two line segments
    // Return FALSE if the lines don't intersect
    public intersectLine(l1: LineCollider, l2: LineCollider) {
        const x1 = l1.start.x;
        const y1 = l1.start.y;
        const x2 = l1.end.x;
        const y2 = l1.end.y;
        const x3 = l2.start.x;
        const y3 = l2.start.y;
        const x4 = l2.end.x;
        const y4 = l2.end.y;
        // Check if none of the lines are of length 0
        if ((x1 === x2 && y1 === y2) || (x3 === x4 && y3 === y4)) {
            return;
        }

        const denominator = ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));

        // Lines are parallel
        if (denominator === 0) {
            return;
        }

        let ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denominator;
        let ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denominator;

        // is the intersection along the segments
        if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
            return;
        }

        // Return a object with the x and y coordinates of the intersection
        let x = x1 + ua * (x2 - x1);
        let y = y1 + ua * (y2 - y1);

        return this.vertex(x, y);
    }

    public intersectCircle(line: LineCollider, circle: EllipseCollider) {
        const v = this.vertex(line.end.x - line.start.x, line.end.y - line.start.y);
        const w = this.vertex(line.start.x - circle.x, line.start.y - circle.y);

        let b = (v.x * w.x + v.y * w.y);
        const c = 2 * (v.x * v.x + v.y * v.y);
        b *= -2;
        const d = Math.sqrt(b * b - 2 * c * (w.x * w.x + w.y * w.y - circle.rx * circle.rx));

        const u1 = (b - d) / c;  // these represent the unit distance of point one and two on the line

        let px, py;

        if (u1 <= 1 && u1 >= 0) {  // add point if on the line segment
            px = line.start.x + v.x * u1;
            py = line.start.y + v.y * u1;
            return this.vertex(px, py);
        }
        return;
    }

    public intersectStadium(l: LineCollider, stadiumCollider: StadiumCollider) {
        let shortestDistance = Number.MAX_VALUE;
        let target: Vertex | undefined;

        stadiumCollider.lineColliders.forEach(lineCollider => {
            const intersectionPoint = this.intersectLine(l, lineCollider);
            if (intersectionPoint) {
                const line = this.lineCollider(l.start.x, l.start.y, intersectionPoint.x, intersectionPoint.y);
                if (line.length < shortestDistance) {
                    target = intersectionPoint;
                    shortestDistance = line.length;
                }
            }
        });

        stadiumCollider.ellipseColliders.forEach(ellipseCollider => {
            const intersectionPoint = this.intersectCircle(l, ellipseCollider);
            if (intersectionPoint) {
                const line = this.lineCollider(l.start.x, l.start.y, intersectionPoint.x, intersectionPoint.y);
                if (line.length < shortestDistance) {
                    target = intersectionPoint;
                    shortestDistance = line.length;
                }
            }
        });
        return target;
    }
}

export { Collision };
