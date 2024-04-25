import { IPoint } from './IPoint';

/**
 * Represents a point on a 2D plane.
 */
export class Point implements IPoint {
  constructor(public x: number, public y: number) {}

  /**
   * Translates the point in the x and y direction. Modifies the calling object.
   * @param other Point to translate by. Can be though of as a vector.
   */
  translate(other: IPoint) {
    this.x += other.x;
    this.y += other.y;
  }

  /**
   * Translates the point in the x and y direction. Does not modify the calling object.
   * @param other Point to translate by. Can be though of as a vector.
   * @returns New point after translation.
   */
  toTranslated(other: IPoint) {
    return new Point(this.x + other.x, this.y + other.y);
  }
}
