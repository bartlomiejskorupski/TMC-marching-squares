# Documentation

Marching squares project documentation.

## Table of contents

- [Data types](#data-types)
- [Algorithm](#algorithm)
- [Usage in the project](#usage-in-the-project)

## Data types

Helper data types are defined at [/src/utils/types/](/src/utils/types/)

### [IPoint](/src/utils/types/IPoint.ts)

An interface representing a point on a 2D plane with x and y floating point fields.

### [Point](/src/utils/types/Point.ts)

Class implementing IPoint interface.

Methods:

- translate - Translates the point in the x and y direction. Modifies the calling object
- toTranslated - Translates the point in the x and y direction. Does not modify the calling object

### [IPolyline](/src/utils/types/IPolyline.ts)

An interface representing a polyline consisting of multiple points.

### [Polyline](/src/utils/types/Polyline.ts)

Class implementing IPolyline interface.

Methods:

- toTranslated - Translates all of the points of the polyline in the x and y direction. Does not modify the calling object. Returns a new translated Polyline object.

## Algorithm

The marching squares algorithm is located at [/src/utils/](/src/utils/) in the [marching-squares.ts](/src/utils/marching-squares.ts) file.

### [marchingSquares](/src/utils/marching-squares.ts#L27) function

Finds the contour of a given 2D raster with a given contour value.

#### Parameters:

- data (number[][]) - A 2D raster containing floating point values.
- contourValue (number) - Value of the contour.
- options (object) - Marching squares algorithm options object:
  - interpolation (boolean) - Should linear interpolation be used to calculate the controur line?
  - ambiguityResolutionStrategy (enum) - How should ambiguous contour cases be chosen?

Returns the list of lines that make up the contour.

#### Algorithm stages:

1. Take a group of four adjacent raster points.
2. Identify the contour intersection case. ([identifyCase](#identifycase-function) function)
3. If no intersection go to step 6.
4. Generate lines from case:
   - If not using interpolation, lookup case from [CASE_LINE_MAP](/src/utils/marching-squares.ts#L154) object containing predefined lines for a given case.
   - If using interpolation, generate lines for a given case. ([interpolateCase](#interpolatecase-function) function)
5. Translate calculated lines in reference to the coordinates of the upper left raster point.
6. If not at the end of the raster, go to step 1. with the next group of raster points.
7. Return generated contour lines.

### [identifyCase](/src/utils/marching-squares.ts#L97) function

Identifies how four adjacent raster points intersect with the contour.

#### Parameters:

- upperLeftVal (number) - Value of the upper left point.
- upperRightVal (number) - Value of the upper right point.
- lowerLeftVal (number) - Value of the lower left point.
- lowerRightVal (number) - Value of the lower right point.
- contourValue (number) - Value of the contour.

Returns intersection case ([IntersectionCase](/src/utils/marching-squares.ts#L78)).

### [interpolateCase](/src/utils/marching-squares.ts#L179) function

Generates interpolated contour lines for the given intersection case.

Uses [linearInterpolation](/src/utils/marching-squares.ts#L245) function to approximate the point at which the contour value may intersect the edge.

#### Parameters:

- intersectionCase ([IntersectionCase](/src/utils/marching-squares.ts#L78)) - The calculated intersection case.
- upperLeft (number) - Upper left point value.
- upperRight (number) - Upper right point value.
- lowerLeft (number) - Lower left point value.
- lowerRight (number) - Lower right point value.
- contourValue (number) - Value of the contour.

Returns a list of generated contour lines for the case.

## Usage in the project

This section describes how the marching squares algorithm is used in the react project.

### Store

This application uses Redux store to manage its state.

#### Canvas slice

The state of the canvas is stored in a redux store "slice" ([canvas-slice.ts](/src/store/slices/canvas-slice.ts)).

It exposes a reducer function that uses the marching squares algorithm to generate contour lines. ([generateContour](/src/store/slices/canvas-slice.ts#L64) function)

### [Canvas component](/src/components/MainCanvas.tsx)

The canvas component is located at [/src/components/](/src/components/) in [MainCanvas.tsx](/src/components/MainCanvas.tsx) file.

Internally it is an html canvas component that gets updated every time the contour, the raster or the value of the contour changes.

### [Control panel component](/src/components/ControlPanel.tsx)

The control panel component is responsible for dispatching calls to the store to change application state values such as contour value, interpolation or auto generate.

#### Controls:

- Use interpolation (checkbox) - Should interpolation be used to approximate contour lines?
- Contour Value (slider and input number) - Set the value of the contour
- Randomize Raster (button) - Randomizes the raster with values 0-10
- Normal Distribution (button) - Sets the raster values to gaussian distribution.
- Generate Contour (button) - Manually generate the contour and update the canvas
- Auto Generate (checkbox) - Automatically generate the contour and update the canvas after every change

### [Raster editor component](/src/components/RasterEditor.tsx)

The raster editor can be toggled by clicking the "Edit raster" button.

Each input corresponds to a point on a raster. Any change automatically changes the raster and updates the canvas (and the contour if "Auto Generate" is on).
