import { ChangeEvent, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  generateContour,
  generateRaster,
  generateRasterNormalDistribution,
  setAutoGenerate,
  setContourValue,
  setInterpolation,
} from '../store/slices/canvas-slice';
import { RootState } from '../store';

export default function ControlPanel() {
  const { contourValue, interpolation, autoGenerate } = useSelector(
    (state: RootState) => state.canvas
  );
  const dispatch = useDispatch();

  const handleGenerateContour = useCallback(() => {
    dispatch(generateContour());
  }, [dispatch]);

  const handleGenerateRaster = useCallback(() => {
    dispatch(generateRaster());
    if (autoGenerate) {
      dispatch(generateContour());
    }
  }, [dispatch, autoGenerate]);

  const handleGenerateRasterNormalDistribution = useCallback(() => {
    dispatch(generateRasterNormalDistribution());
    if (autoGenerate) {
      dispatch(generateContour());
    }
  }, [dispatch, autoGenerate]);

  const handleContourValueChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      dispatch(setContourValue(+e.target.value));
      if (autoGenerate) {
        dispatch(generateContour());
      }
    },
    [dispatch, autoGenerate]
  );

  const handleInterpolationChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      dispatch(setInterpolation(e.target.checked));
      if (autoGenerate) {
        dispatch(generateContour());
      }
    },
    [dispatch, autoGenerate]
  );

  const handleAutoGenerateChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      dispatch(setAutoGenerate(e.target.checked));
    },
    [dispatch]
  );

  return (
    <div className="controls">
      <div className="control-group">
        <label htmlFor="interpolation">Use Interpolation</label>
        <input
          type="checkbox"
          name="interpolation"
          id="interpolation"
          defaultChecked={interpolation}
          onChange={handleInterpolationChange}
        />
      </div>
      <div className="control-group">
        <label htmlFor="contourValue">Contour Value</label>
        <input
          type="range"
          min="0"
          max="10"
          step="0.01"
          name="contourValue"
          id="contourValue"
          value={contourValue}
          onChange={handleContourValueChange}
        />
        <input
          type="number"
          step="0.2"
          value={contourValue}
          onChange={handleContourValueChange}
        />
      </div>
      <button onClick={handleGenerateRaster}>Randomize Raster</button>
      <button onClick={handleGenerateRasterNormalDistribution}>
        Normal Distribution
      </button>
      <button onClick={handleGenerateContour}>Generate Contour</button>
      <div className="control-group">
        <label htmlFor="auto-generate">Auto Generate</label>
        <input
          type="checkbox"
          name="auto-generate"
          id="auto-generate"
          defaultChecked={autoGenerate}
          onChange={handleAutoGenerateChange}
        />
      </div>
    </div>
  );
}
