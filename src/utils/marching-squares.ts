import { IPolyline, Point, Polyline } from './point';

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
 * Marching squares algorithm options object
 */
interface MarchingSquaresOptions {
  /**
   * Should linear interpolation be used to calculate the controur line
   */
  interpolation?: boolean;
}

/**
 *
 * @param data 2D raster
 * @param contourValue Value of the contour
 * @returns List of lines that make up the contour
 */
export default function marchingSquares(
  data: number[][],
  contourValue: number,
  options: MarchingSquaresOptions = {
    interpolation: true,
  }
): IPolyline[] {
  const contourlines: IPolyline[] = [];

  for (let y = 0; y < data.length - 1; y++) {
    for (let x = 0; x < data[y].length - 1; x++) {
      const ul = data[y][x];
      const ur = data[y][x + 1];
      const ll = data[y + 1][x];
      const lr = data[y + 1][x + 1];

      const intersectionCase = identifyCase(ul, ur, ll, lr, contourValue);

      if (intersectionCase === 'NONE') {
        continue;
      }

      let lines: Polyline[];
      if (options.interpolation) {
        lines = interpolateCase(intersectionCase, ul, ur, ll, lr, contourValue);
      } else {
        lines = CASE_LINE_MAP[intersectionCase];
      }

      const translatedLines = lines.map((line) =>
        line.toTranslated(new Point(x, y))
      );
      contourlines.push(...translatedLines);
    }
  }

  return contourlines;
}

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
    return 'NONE';
  } else if (upperRight === lowerRight && lowerRight === lowerLeft) {
    return 'UPPER_LEFT';
  } else if (upperLeft === lowerRight && lowerRight === lowerLeft) {
    return 'UPPER_RIGHT';
  } else if (upperLeft === upperRight && upperRight === lowerRight) {
    return 'LOWER_LEFT';
  } else if (upperLeft === upperRight && upperRight === lowerLeft) {
    return 'LOWER_RIGHT';
  } else if (upperLeft === upperRight && lowerLeft === lowerRight) {
    return 'HORIZONTAL';
  } else if (upperLeft === lowerLeft && upperRight === lowerRight) {
    return 'VERTICAL';
  }
  return 'AMBIGUOUS';
}

const POINT = {
  top: (x0: number) => new Point(x0, 0),
  left: (x0: number) => new Point(0, x0),
  right: (x0: number) => new Point(1, x0),
  bottom: (x0: number) => new Point(x0, 1),
};

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

      // TODO: Decide on cut or join based on interpolated values

      return [
        new Polyline([POINT.left(leftX), POINT.top(topX)]),
        new Polyline([POINT.bottom(bottomX), POINT.right(rightX)]),
      ];
    }
  }
}

function linearInterpolation(fromY: number, toY: number, contourY: number) {
  return (contourY - fromY) / (toY - fromY);
}
