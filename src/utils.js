import { Vector3, Color } from 'three';


/**
 * @param {string} type - The type of Tetris shape ('L', 'J', 'T', 'O', 'Z', 'I').
 * @returns {Array} An array of arrays with coordinates for each block of the shape.
 */
/**
 * Поворачивает конфигурацию фигуры Tetris на указанный угол.
 * 
 * @param {Array<Array<number>>} configuration - Массив координат блоков фигуры.
 * @param {number} angle - Угол поворота в градусах
 * @returns {Array<Array<number>>} Новая конфигурация фигуры после поворота.
 */
export const getShapeConfiguration = (type) => {
    switch (type) {
        case 'L':
            return [[0, 0, 0], [0, 1, 0], [0, 2, 0], [1, 2, 0]];
        case 'J':
            return [[1, 0, 0], [1, 1, 0], [1, 2, 0], [0, 2, 0]];
        case 'T':
            return [[0, 0, 0], [1, 0, 0], [2, 0, 0], [1, 1, 0]];
        case 'O':
            return [[0, 0, 0], [0, 1, 0], [1, 0, 0], [1, 1, 0]];
        case 'Z':
            return [[0, 0, 0], [1, 0, 0], [1, 1, 0], [2, 1, 0]];
        case 'I':
            return [[0, 0, 0], [0, 1, 0], [0, 2, 0], [0, 3, 0]];
        default:
            return [];
    }
};

export const rotateShape = (type, currentRotation) => {
  const baseConfiguration = getShapeConfiguration(type);
  const angle = currentRotation % 360;
  let rotatedConfig;
  switch (angle) {
    case 0:
      rotatedConfig = baseConfiguration;
      break;
    case 90:
      rotatedConfig = baseConfiguration.map(([z, x, y]) => [z, y, -x + baseConfiguration.reduce((max, coord) => Math.max(max, coord[1]), 0)]);
      break;
    case 180:
      rotatedConfig = baseConfiguration.map(([z, x, y]) => [z, -x + baseConfiguration.reduce((max, coord) => Math.max(max, coord[1]), 0), -y + baseConfiguration.reduce((max, coord) => Math.max(max, coord[2]), 0)]);
      break;
    case 270:
      rotatedConfig = baseConfiguration.map(([z, x, y]) => [z, -y + baseConfiguration.reduce((max, coord) => Math.max(max, coord[2]), 0), x]);
      break;
    default:
      rotatedConfig = baseConfiguration;
  }

  const minY = Math.min(...rotatedConfig.map(([, , y]) => y));
  if (minY < 0) {
    rotatedConfig = rotatedConfig.map(([z, x, y]) => [z, x, y - minY]);
  }
  
  return rotatedConfig;
};



export const initialDimensions = {
  cellSize: 8,
  widthBack: 6,
  heightLeft: 12,
  depthFront: 6
};

export const initialColors = {
  backColor: '#ffffff',
  leftColor: '#ffffff',
  frontColor: '#ffffff'
};

export const initialCameraPosition = new Vector3(10, 10, 10);

export function getContrastColor(hexColor) {
  const color = new Color(hexColor);
  const d = color.r * 0.299 + color.g * 0.587 + color.b * 0.114;
  return d > 0.5 ? 'black' : 'white';
}


