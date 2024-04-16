import { ChangeEvent, FormEvent, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import {
  generateContour,
  setRaster,
  setRasterCell,
} from '../store/slices/canvas-slice';

import styles from './RasterEditor.module.css';

export default function RasterEditor() {
  const [visible, setVisible] = useState(false);

  const { raster, autoGenerate } = useSelector(
    (state: RootState) => state.canvas
  );
  const dispatch = useDispatch();

  const handleEdit = useCallback(() => {
    setVisible((prev) => !prev);
  }, []);

  const handleSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const data = new FormData(e.currentTarget);
      const entries = Object.fromEntries(data.entries());

      const rasterHeight = raster.length;
      const rasterWidth = raster[0].length;

      const newRaster = Array(rasterHeight)
        .fill(null)
        .map((_, y) =>
          Array(rasterWidth)
            .fill(null)
            .map((_, x) => +entries[y + ',' + x])
        );

      dispatch(setRaster(newRaster));
      if (autoGenerate) {
        dispatch(generateContour());
      }
    },
    [dispatch, raster, autoGenerate]
  );

  const handleCellChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const { x, y } = e.target.dataset;
      if (!x || !y) {
        return;
      }
      dispatch(setRasterCell({ x: +x, y: +y, value: +e.target.value }));
      if (autoGenerate) {
        dispatch(generateContour());
      }
    },
    [dispatch, autoGenerate]
  );

  return (
    <form className={styles.rasterEditorContainer} onSubmit={handleSubmit}>
      <button onClick={handleEdit} type="button">
        Edit raster
      </button>
      <button type="submit" disabled={!visible}>
        Save raster
      </button>
      {visible && (
        <div className={styles.rasterEditor}>
          {raster.map((row, rI) => (
            <div key={'r' + rI} className={styles.rasterRow}>
              {row.map((cell, cI) => (
                <div key={'c' + cI} className={styles.rasterCell}>
                  <input
                    type="number"
                    // defaultValue={cell}
                    data-x={cI}
                    data-y={rI}
                    id={rI + ',' + cI}
                    name={rI + ',' + cI}
                    step="0.1"
                    value={cell}
                    onChange={handleCellChange}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </form>
  );
}
