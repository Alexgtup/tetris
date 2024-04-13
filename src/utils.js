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
  switch (angle) {
    case 0:
      return baseConfiguration;
    case 90:
      return baseConfiguration.map(([z, x, y]) => [z, y, -x + baseConfiguration.reduce((max, coord) => Math.max(max, coord[1]), 0)]);
    case 180:
      return baseConfiguration.map(([z, x, y]) => [z, -x + baseConfiguration.reduce((max, coord) => Math.max(max, coord[1]), 0), -y + baseConfiguration.reduce((max, coord) => Math.max(max, coord[2]), 0)]);
    case 270:
      return baseConfiguration.map(([z, x, y]) => [z, -y + baseConfiguration.reduce((max, coord) => Math.max(max, coord[2]), 0), x]);
    default:
      return baseConfiguration;
  }
};




