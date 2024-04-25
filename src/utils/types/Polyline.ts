import { IPolyline } from './IPolyline';
import { Point } from './Point';

/**
 * Represents a polyline consisting of multiple points.
 */
export class Polyline implements IPolyline {
  points: Point[] = [];

  constructor(points: Point[] = []) {
    this.points = [...points];
  }

  /**
   * Translates all of the points of the polyline in the x and y direction. Does not modify the calling object.
   * @param vector Point to translate by. Can be though of as a vector.
   * @returns A new translated Polyline object.
   */
  toTranslated(vector: Point) {
    const translatedPoints: Point[] = [];

    for (const point of this.points) {
      translatedPoints.push(point.toTranslated(vector));
    }

    return new Polyline(translatedPoints);
  }
}
