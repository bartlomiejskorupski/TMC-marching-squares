import { IPolyline } from './types/IPolyline';
import { Point } from './types/Point';
import { Polyline } from './types/Polyline';

/**
 * Marching squares algorithm options object.
 * @param interpolation Should linear interpolation be used to calculate the controur line?
 * @param ambiguityResolutionStrategy How should ambiguous contour cases be chosen?
 */
interface MarchingSquaresOptions {
  interpolation?: boolean;
  ambiguityResolutionStrategy?: AmbiguityResolutionStrategy;
}

/**
 * How should ambiguous contour cases be chosen?
 */
type AmbiguityResolutionStrategy = 'UPPER_LEFT' | 'UPPER_RIGHT';

/**
 * Finds the contour of a given 2D raster with a given contour value.
 * @param data A 2D raster containing floating point values.
 * @param contourValue Value of the contour.
 * @param options Options object.
 * @returns The list of lines that make up the contour.
 */
export default function marchingSquares(
  data: number[][],
  contourValue: number,
  options: MarchingSquaresOptions = {
    interpolation: true,
    ambiguityResolutionStrategy: 'UPPER_LEFT',
  }
): IPolyline[] {
  const contourlines: IPolyline[] = [];

  for (let y = 0; y < data.length - 1; y++) {
    for (let x = 0; x < data[y].length - 1; x++) {
      // Take a group of four adjacent raster points.
      // Upper left, upper right, lower left, lower right
      const ul = data[y][x];
      const ur = data[y][x + 1];
      const ll = data[y + 1][x];
      const lr = data[y + 1][x + 1];

      // Identify the contour intersection case
      const intersectionCase = identifyCase(ul, ur, ll, lr, contourValue);

      if (intersectionCase === 'NONE') {
        continue;
      }

      let lines: Polyline[];
      // Generate lines from case
      if (options.interpolation) {
        // Use interpolation to generate lines for a given case
        lines = interpolateCase(intersectionCase, ul, ur, ll, lr, contourValue);
      } else {
        // Lookup case without interpolation
        lines = CASE_LINE_MAP[intersectionCase];
      }

      // Translate calculated lines in reference to the coordinates of the upper left raster point
      const translatedLines = lines.map((line) =>
        line.toTranslated(new Point(x, y))
      );
      contourlines.push(...translatedLines);
    }
  }

  // Return generated contour lines.
  return contourlines;
}

/**
 * Contour intersection case.
 */
type IntersectionCase =
  | 'NONE'
  | 'UPPER_LEFT'
  | 'UPPER_RIGHT'
  | 'LOWER_LEFT'
  | 'LOWER_RIGHT'
  | 'HORIZONTAL'
  | 'VERTICAL'
  | 'AMBIGUOUS';

/**
 * Identifies how four adjacent raster points intersect with the contour.
 * @param upperLeftVal Value of the upper left point.
 * @param upperRightVal Value of the upper right point.
 * @param lowerLeftVal Value of the lower left point.
 * @param lowerRightVal Value of the lower right point.
 * @param contourValue Value of the contour.
 * @returns Intersection case.
 */
function identifyCase(
  upperLeftVal: number,
  upperRightVal: number,
  lowerLeftVal: number,
  lowerRightVal: number,
  contourValue: number
): IntersectionCase {
  const upperLeft = upperLeftVal >= contourValue;
  const upperRight = upperRightVal >= contourValue;
  const lowerLeft = lowerLeftVal >= contourValue;
  const lowerRight = lowerRightVal >= contourValue;

  if (
    upperLeft === upperRight &&
    upperRight === lowerLeft &&
    lowerLeft === lowerRight
  ) {
    // All values are the same - either inside or outside the contour
    return 'NONE';
  } else if (upperRight === lowerRight && lowerRight === lowerLeft) {
    // Upper left point is separated by the contour
    return 'UPPER_LEFT';
  } else if (upperLeft === lowerRight && lowerRight === lowerLeft) {
    // Upper right point is separated by the contour
    return 'UPPER_RIGHT';
  } else if (upperLeft === upperRight && upperRight === lowerRight) {
    // Lower left point is separated by the contour
    return 'LOWER_LEFT';
  } else if (upperLeft === upperRight && upperRight === lowerLeft) {
    // Lower right point is separated by the contour
    return 'LOWER_RIGHT';
  } else if (upperLeft === upperRight && lowerLeft === lowerRight) {
    // Upper points are separated from lower points by the contour
    return 'HORIZONTAL';
  } else if (upperLeft === lowerLeft && upperRight === lowerRight) {
    // Left points are separated from right points by the contour
    return 'VERTICAL';
  }
  // Only ambiguous case is left
  return 'AMBIGUOUS';
}

/**
 * Helper object that creates points intersecting the top, left, right
 * or bottom edges of four adjacent points.
 * @param x0 Offset value 0 - 1
 */
const POINT = {
  top: (x0: number) => new Point(x0, 0),
  left: (x0: number) => new Point(0, x0),
  right: (x0: number) => new Point(1, x0),
  bottom: (x0: number) => new Point(x0, 1),
};

/**
 * Lookup object containing predefined lines for a given case
 */
const CASE_LINE_MAP: Readonly<Record<IntersectionCase, Polyline[]>> =
  Object.freeze({
    NONE: [],
    UPPER_LEFT: [new Polyline([POINT.left(0.5), POINT.top(0.5)])],
    UPPER_RIGHT: [new Polyline([POINT.right(0.5), POINT.top(0.5)])],
    LOWER_LEFT: [new Polyline([POINT.left(0.5), POINT.bottom(0.5)])],
    LOWER_RIGHT: [new Polyline([POINT.right(0.5), POINT.bottom(0.5)])],
    HORIZONTAL: [new Polyline([POINT.left(0.5), POINT.right(0.5)])],
    VERTICAL: [new Polyline([POINT.top(0.5), POINT.bottom(0.5)])],
    AMBIGUOUS: [
      new Polyline([POINT.left(0.5), POINT.top(0.5)]),
      new Polyline([POINT.right(0.5), POINT.bottom(0.5)]),
    ],
  });

/**
 * Generates interpolated contour lines for the given intersection case.
 * @param intersectionCase The calculated intersection case.
 * @param upperLeft Upper left point value.
 * @param upperRight Upper right point value.
 * @param lowerLeft Lower left point value.
 * @param lowerRight Lower right point value.
 * @param contourValue Value of the contour.
 * @returns List of generated contour lines for the case.
 */
function interpolateCase(
  intersectionCase: IntersectionCase,
  upperLeft: number,
  upperRight: number,
  lowerLeft: number,
  lowerRight: number,
  contourValue: number
): Polyline[] {
  switch (intersectionCase) {
    case 'NONE': {
      return [];
    }
    case 'UPPER_LEFT': {
      const topX = linearInterpolation(upperLeft, upperRight, contourValue);
      const leftX = linearInterpolation(upperLeft, lowerLeft, contourValue);
      return [new Polyline([POINT.left(leftX), POINT.top(topX)])];
    }
    case 'UPPER_RIGHT': {
      const topX = linearInterpolation(upperLeft, upperRight, contourValue);
      const rightX = linearInterpolation(upperRight, lowerRight, contourValue);
      return [new Polyline([POINT.right(rightX), POINT.top(topX)])];
    }
    case 'LOWER_LEFT': {
      const leftX = linearInterpolation(upperLeft, lowerLeft, contourValue);
      const bottomX = linearInterpolation(lowerLeft, lowerRight, contourValue);
      return [new Polyline([POINT.left(leftX), POINT.bottom(bottomX)])];
    }
    case 'LOWER_RIGHT': {
      const rightX = linearInterpolation(upperRight, lowerRight, contourValue);
      const bottomX = linearInterpolation(lowerLeft, lowerRight, contourValue);
      return [new Polyline([POINT.right(rightX), POINT.bottom(bottomX)])];
    }
    case 'HORIZONTAL': {
      const leftX = linearInterpolation(upperLeft, lowerLeft, contourValue);
      const rightX = linearInterpolation(upperRight, lowerRight, contourValue);
      return [new Polyline([POINT.left(leftX), POINT.right(rightX)])];
    }
    case 'VERTICAL': {
      const topX = linearInterpolation(upperLeft, upperRight, contourValue);
      const bottomX = linearInterpolation(lowerLeft, lowerRight, contourValue);
      return [new Polyline([POINT.top(topX), POINT.bottom(bottomX)])];
    }
    case 'AMBIGUOUS': {
      const topX = linearInterpolation(upperLeft, upperRight, contourValue);
      const leftX = linearInterpolation(upperLeft, lowerLeft, contourValue);
      const rightX = linearInterpolation(upperRight, lowerRight, contourValue);
      const bottomX = linearInterpolation(lowerLeft, lowerRight, contourValue);

      return [
        new Polyline([POINT.left(leftX), POINT.top(topX)]),
        new Polyline([POINT.bottom(bottomX), POINT.right(rightX)]),
      ];
    }
  }
}

/**
 * Approximates the x value of a point between two other,
 * with a given value of Y. Starting point is at x = 0 and the end point
 * is at x = xLength.
 * @param fromY The value of y of the start point.
 * @param toY The value of y of the end point.
 * @param targetY The value of y of the target point.
 * @param xLength The distance from the start point to the end point (default 1)
 * @returns The approximated x value of the point between.
 */
function linearInterpolation(
  fromY: number,
  toY: number,
  targetY: number,
  xLength: number = 1
): number {
  return ((targetY - fromY) * xLength) / (toY - fromY);
}
