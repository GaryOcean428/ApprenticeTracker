import * as React from 'react';
import classNames from 'classnames';
import styles from './heat-map.module.css';

interface HeatMapProps {
  data: number[][];
  colorScale?: (value: number) => string;
  cellSize?: number;
  gap?: number;
  onCellClick?: (row: number, col: number, value: number) => void;
}

const defaultColorScale = (value: number): string => {
  const hue = ((1 - value) * 120).toString(10);
  return `hsl(${hue}, 70%, 50%)`;
};

export function HeatMap({
  data,
  colorScale = defaultColorScale,
  cellSize = 30,
  gap = 2,
  onCellClick,
}: HeatMapProps): React.ReactElement {
  const [focusPosition, setFocusPosition] = React.useState<[number, number]>([0, 0]);
  const [selectedValue, setSelectedValue] = React.useState<number | null>(null);

  React.useEffect(() => {
    const [focusRow, focusCol] = focusPosition;
    const element = document.querySelector(
      `[data-row="${focusRow}"][data-col="${focusCol}"]`
    ) as HTMLElement;
    element?.focus();
  }, [focusPosition]);

  React.useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--cell-size', `${cellSize}px`);
    root.style.setProperty('--cell-gap', `${gap / 2}px`);
  }, [cellSize, gap]);

  if (!data.length || !data[0]?.length) {
    return (
      <div role="alert" className={styles.empty}>
        No data available for heat map visualization
      </div>
    );
  }

  const maxValue = Math.max(...data.flat());
  const normalizedData = data.map((row) => row.map((value) => value / maxValue));

  const getHeatLevel = (value: number): number => {
    return Math.round(value * 10);
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLDivElement>,
    rowIndex: number,
    colIndex: number,
    value: number
  ): void => {
    const [currentRow, currentCol] = [rowIndex, colIndex];
    const maxRow = data.length - 1;
    const maxCol = (data[0]?.length || 0) - 1;

    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        onCellClick?.(rowIndex, colIndex, value);
        setSelectedValue(value);
        break;
      case 'ArrowUp':
        event.preventDefault();
        setFocusPosition([Math.max(0, currentRow - 1), currentCol]);
        break;
      case 'ArrowDown':
        event.preventDefault();
        setFocusPosition([Math.min(maxRow, currentRow + 1), currentCol]);
        break;
      case 'ArrowLeft':
        event.preventDefault();
        setFocusPosition([currentRow, Math.max(0, currentCol - 1)]);
        break;
      case 'ArrowRight':
        event.preventDefault();
        setFocusPosition([currentRow, Math.min(maxCol, currentCol + 1)]);
        break;
      case 'Home':
        event.preventDefault();
        setFocusPosition([currentRow, 0]);
        break;
      case 'End':
        event.preventDefault();
        setFocusPosition([currentRow, maxCol]);
        break;
    }
  };

  const handleClick = (rowIndex: number, colIndex: number, value: number): void => {
    setSelectedValue(value);
    onCellClick?.(rowIndex, colIndex, value);
  };

  return (
    <div className={styles.container}>
      <div aria-live="polite" className={styles.visuallyHidden}>
        {selectedValue !== null && `Selected value: ${selectedValue}`}
      </div>
      <div className={styles.heatmap} role="grid" aria-label="Heat map visualization">
        {normalizedData.map((row, rowIndex) => (
          <div key={rowIndex} className={styles.row} role="row">
            {row.map((value, colIndex) => {
              const isSelected = rowIndex === focusPosition[0] && colIndex === focusPosition[1];
              const heatLevel = getHeatLevel(value);

              return (
                <div
                  key={colIndex}
                  className={classNames(styles.cell, styles[`heat-${heatLevel}`])}
                  onClick={() => handleClick(rowIndex, colIndex, data[rowIndex][colIndex])}
                  onKeyDown={(e) => handleKeyDown(e, rowIndex, colIndex, data[rowIndex][colIndex])}
                  role="gridcell"
                  aria-label={`Value: ${data[rowIndex][colIndex]}`}
                  data-selected={isSelected}
                  data-row={rowIndex}
                  data-col={colIndex}
                  tabIndex={isSelected ? 0 : -1}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export default HeatMap;
