export interface IPoint {
  x: number;
  y: number;
}

export class Point implements IPoint {
  constructor(public x: number, public y: number) {}

  translate(other: IPoint) {
    this.x += other.x;
    this.y += other.y;
  }

  toTranslated(other: IPoint) {
    return new Point(this.x + other.x, this.y + other.y);
  }
}

export interface IPolyline {
  points: IPoint[];
}

export class Polyline implements IPolyline {
  points: Point[] = [];

  constructor(points?: Point[]) {
    points && (this.points = [...points]);
  }

  toTranslated(vector: Point) {
    const translatedPoints: Point[] = [];

    for (const point of this.points) {
      translatedPoints.push(point.toTranslated(vector));
    }

    return new Polyline(translatedPoints);
  }
}
