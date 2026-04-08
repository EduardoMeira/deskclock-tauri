export const GRID_SIZE = 16;

export function snapToGrid(value: number, gridSize = GRID_SIZE): number {
  return Math.round(value / gridSize) * gridSize || 0;
}

export function snapPositionToGrid(
  x: number,
  y: number,
  gridSize = GRID_SIZE,
): { x: number; y: number } {
  return {
    x: snapToGrid(x, gridSize),
    y: snapToGrid(y, gridSize),
  };
}
