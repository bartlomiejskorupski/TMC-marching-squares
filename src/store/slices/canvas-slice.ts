import { createSlice } from '@reduxjs/toolkit';
import { IPolyline } from '../../utils/types/IPolyline';
import marchingSquares from '../../utils/marching-squares';
import {
  generateGaussianRaster,
  generateRandomRaster,
} from '../../utils/generate-raster';

const testRaster = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 1, 1, 0, 0, 0, 0, 0, 0, 0],
  [0, 2, 2, 3, 0, 0, 0, 0, 0, 0],
  [0, 1, 4, 1, 0, 0, 0, 0, 0, 0],
  [0, 1, 2, 1, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

interface CanvasSliceState {
  raster: number[][];
  contourValue: number;
  contour: IPolyline[];
  interpolation: boolean;
  autoGenerate: boolean;
}

const initialState: CanvasSliceState = {
  raster: testRaster,
  contourValue: 1,
  contour: [],
  interpolation: true,
  autoGenerate: true,
};

const canvasSlice = createSlice({
  name: 'canvas',
  initialState,
  reducers: {
    setContourValue(state, action) {
      state.contourValue = action.payload;
    },

    setInterpolation(state, action) {
      state.interpolation = action.payload;
    },

    setAutoGenerate(state, action) {
      state.autoGenerate = action.payload;
    },

    setRaster(state, action) {
      state.raster = action.payload;
    },

    setRasterCell(state, action) {
      const { x, y, value } = action.payload;

      state.raster[y][x] = +value;
    },

    generateContour(state) {
      // Generate contour lines using marching squares algorithm
      const polylines = marchingSquares(state.raster, state.contourValue, {
        interpolation: state.interpolation,
      });

      // Map the lines to plain javascript objects.
      // (Redux doesn't like objects with methods)
      state.contour = polylines.map((line) => ({
        points: line.points.map((p) => ({ x: p.x, y: p.y })),
      }));
    },

    generateRaster(state) {
      state.raster = generateRandomRaster();
    },

    generateRasterNormalDistribution(state) {
      state.raster = generateGaussianRaster();
    },
  },
});

export const {
  generateContour,
  setContourValue,
  generateRaster,
  setRaster,
  setInterpolation,
  setRasterCell,
  setAutoGenerate,
  generateRasterNormalDistribution,
} = canvasSlice.actions;
const canvasReducer = canvasSlice.reducer;
export default canvasReducer;
