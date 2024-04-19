import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import ThreeSidedGrid from './ThreeSidedGrid';
import TetrisShapes from './TetrisShapes';
import { getShapeConfiguration, rotateShape, initialDimensions, initialColors, initialCameraPosition } from './utils';
import { Physics } from '@react-three/cannon';

import { Vector3 } from 'three';

/**
 * Проверяет, можно ли разместить фигуру в указанной позиции на сетке.
 * 
 * @param {number} row - Начальная строка для размещения фигуры.
 * @param {number} col - Начальный столбец для размещения фигуры.
 * @param {Array<Array<number>>} configuration - Конфигурация блоков фигуры.
 * @param {Array<Array<boolean>>} grid - Сетка, где true означает занятую ячейку.
 * @returns {boolean} Возвращает true, если фигуру можно разместить.
 */
function CameraController({ position }) {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.copy(position);
    camera.updateProjectionMatrix();
  }, [position]);

  return null;
}


function App() {

  const [dimensions, setDimensions] = useState(initialDimensions);
  const [colors, setColors] = useState(initialColors);


  const [sceneBackgroundColor, setSceneBackgroundColor] = useState('#ffffff');
  const [currentView, setCurrentView] = useState('default');

  const [cameraPosition, setCameraPosition] = useState(new Vector3(10, 10, 10));
  const [tetrisShapes, setTetrisShapes] = useState([]);
  const [cellSize, setCellSize] = useState(8);
  const [activeShapeIndex, setActiveShapeIndex] = useState(null);



  useEffect(() => {
    const handleKeyDown = (event) => {
      if (activeShapeIndex === null) return;
      switch (event.key) {
        case 'ArrowLeft':
          moveShape(-1, 0, 0);
          break;
        case 'ArrowRight':
          moveShape(1, 0, 0);
          break;
        case 'ArrowUp':
          moveShape(0, 1, 0);
          break;
        case 'ArrowDown':
          moveShape(0, -1, 0);
          break;
        case 'w':
        case 'W':
          moveShape(0, 0, 1);
          break;
        case 's':
        case 'S':
          moveShape(0, 0, -1);
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeShapeIndex, tetrisShapes, moveShape]);

  const [grid, setGrid] = useState(() => {
    const rows = dimensions.depthFront;
    const cols = dimensions.widthBack;
    return Array.from({ length: rows }, () => Array(cols).fill(false));
  });

  const gridRef = useRef(grid);


  useEffect(() => {
    const rows = dimensions.depthFront;
    const cols = dimensions.widthBack;
    const initialGrid = Array.from({ length: rows }, () => Array(cols).fill(false));
    setGrid(initialGrid);
    gridRef.current = initialGrid;
  }, [dimensions.depthFront, dimensions.widthBack]);

  // Улучшенная функция canMove
  function canMove(configuration, dx, dz, dy, grid, shapes, currentShapeIndex) {
    return configuration.every(([x, z]) => {
      const newX = x + dx;
      const newZ = z + dz;
      const newY = dy !== 0 ? Math.floor((currentShapeIndex !== null ? shapes[currentShapeIndex].position.y : 0) / cellSize + dy) : 0;
      return newX >= 0 && newX < dimensions.widthBack &&
        newZ >= 0 && newZ < dimensions.depthFront &&
        newY >= 0 && newY < dimensions.heightLeft &&
        !isPositionOccupied(newX, newZ, newY, shapes, currentShapeIndex);
    });
  }

  const addShape = useCallback((shapeType) => {
    const shapeConfiguration = getShapeConfiguration(shapeType);
    const grid = gridRef.current;
    let placementFound = false;
    let offset = { x: 0, y: 0, z: 0 };

    let centerCol = Math.floor(grid[0].length / 2);
    let centerRow = Math.floor(grid.length / 2);

    if (canPlaceShape(centerRow, centerCol, shapeConfiguration, grid)) {
      markGrid(centerRow, centerCol, shapeConfiguration, true, grid);
      offset = {
        x: centerCol * cellSize + cellSize / 2,
        y: cellSize / 2,
        z: centerRow * cellSize + cellSize / 2 
      };
      placementFound = true;
    } else {
      const attempts = 100;
      for (let i = 0; i < attempts; i++) {
        const row = Math.floor(Math.random() * grid.length);
        const col = Math.floor(Math.random() * grid[0].length);
        if (canPlaceShape(row, col, shapeConfiguration, grid)) {
          markGrid(row, col, shapeConfiguration, true, grid);
          offset = {
            x: col * cellSize + cellSize / 2, 
            y: cellSize / 2,
            z: row * cellSize + cellSize / 2  
          };
          placementFound = true;
          break;
        }
      }
    }

    if (!placementFound) {
      alert("No space available to place the shape.");
      return;
    }

    setTetrisShapes(prevShapes => [...prevShapes, {
      type: shapeType,
      color: '#ff0000',
      position: new Vector3(offset.x, offset.y, offset.z),
      rotation: 0,
      configuration: shapeConfiguration
    }]);
  }, [cellSize, gridRef, setTetrisShapes]);

  const changeShapeColor = (index, newColor) => {
    if (index == null || index >= tetrisShapes.length) {
      console.error("Invalid shape index", index);
      return;
    }

    console.log(`Changing color of shape ${index} to ${newColor}`);
    setTetrisShapes(prevShapes =>
      prevShapes.map((shape, idx) =>
        idx === index ? { ...shape, color: newColor } : shape
      )
    );
  };




  // Проверяем, занята ли позиция другой фигурой
  function isPositionOccupied(x, z, y, shapes, currentShapeIndex) {
    return shapes.some((shape, index) => {
      if (index === currentShapeIndex) return false; // Игнорируем текущую фигуру
      return shape.configuration.some(([sx, sz, sy]) => {
        const shapeX = Math.floor(shape.position.x / cellSize) + sx;
        const shapeZ = Math.floor(shape.position.z / cellSize) + sz;
        const shapeY = Math.floor(shape.position.y / cellSize) + sy;
        return shapeX === x && shapeZ === z && shapeY === y; // Проверяем перекрытие
      });
    });
  }


  // Получаем конфигурацию для текущей позиции фигуры
  function getConfigurationForCurrentPosition(shape) {
    return shape.configuration.map(([x, z, y]) => [
      Math.floor((shape.position.x + x * cellSize) / cellSize),
      Math.floor((shape.position.z + z * cellSize) / cellSize),
      Math.floor((shape.position.y + y * cellSize) / cellSize)
    ]);
  }

  // Обновленная функция движения
  function moveShape(direction) {
    if (activeShapeIndex === null || activeShapeIndex >= tetrisShapes.length) return;
    const shape = tetrisShapes[activeShapeIndex];
    let newPosition = { ...shape.position };
    const shapeConfiguration = getConfigurationForCurrentPosition(shape);

    let dx = 0, dz = 0, dy = 0;
    switch (direction) {
      case 'left': dx = -1; break;
      case 'right': dx = 1; break;
      case 'forward': dz = 1; break;
      case 'backward': dz = -1; break;
      case 'up': dy = 1; break;
      case 'down': dy = -1; break;
    }

    if (canMove(shapeConfiguration, dx, dz, dy, gridRef.current, tetrisShapes, activeShapeIndex)) {
      newPosition.x += dx * cellSize;
      newPosition.z += dz * cellSize;
      newPosition.y += dy * cellSize;
      setTetrisShapes(shapes => shapes.map((s, idx) => idx === activeShapeIndex ? { ...s, position: newPosition } : s));
    } else {
      console.error("Movement blocked by another shape or boundary.");
    }
  }

  const updateSize = useCallback((dimension) => (e) => {
    setDimensions(prevDimensions => ({
      ...prevDimensions,
      [dimension]: Number(e.target.value)
    }));
  }, []);


  const calculateYOffset = (configuration, cellSize) => {
    const yValues = configuration.map(config => config[1]); 
    const minY = Math.min(...yValues); // минимальное значение Y в конфигурации
    return minY < 0 ? -minY * cellSize : 0; // если минимальное значение Y меньше 0, возвращаем положительное смещение
  };


  const rotateActiveShape = useCallback((degrees) => {
    if (activeShapeIndex === null || activeShapeIndex >= tetrisShapes.length) return;
    const shape = tetrisShapes[activeShapeIndex];
    const newRotation = (shape.rotation + degrees) % 360;
    const newConfiguration = rotateShape(shape.type, newRotation);
    const yOffset = calculateYOffset(newConfiguration, dimensions.cellSize);
    const newPosition = new Vector3(shape.position.x, shape.position.y + yOffset, shape.position.z);

    setTetrisShapes(prevShapes => prevShapes.map((s, idx) => {
      if (idx === activeShapeIndex) {
        return { ...s, position: newPosition, rotation: newRotation, configuration: newConfiguration };
      }
      return s;
    }));
  }, [activeShapeIndex, tetrisShapes, dimensions.cellSize]);

  const setView = (view) => {
    const positions = {
      front: new Vector3(0, 10, 50),
      side: new Vector3(50, 10, 0),
      top: new Vector3(0, 50, 0),
      default: new Vector3(10, 10, 10)
    };

    const newCameraPosition = positions[view] || positions['default'];
    setCameraPosition(newCameraPosition); // Это изменение должно отразиться в JSX
    setSceneBackgroundColor(colors[`${view}Color`] || '#ffffff'); // Обновляем фоновый цвет
    setCurrentView(view); // Обновляем текущий вид
  };




  function canPlaceShape(row, col, configuration, grid) {
    return configuration.every(([dy, dx]) => {
      const y = row + dy;
      const x = col + dx;
      // Проверяем, что мы не выходим за границы сетки и что ячейка свободна.
      return y >= 0 && y < grid.length && x >= 0 && x < grid[y].length && !grid[y][x];
    });
  }

  function markGrid(row, col, configuration, value, grid) {
    configuration.forEach(([dy, dx]) => {
      const y = row + dy;
      const x = col + dx;
      if (y >= 0 && y < grid.length && x >= 0 && x < grid[y].length) {
        grid[y][x] = value;
      }
    });
  }



  const saveState = () => {
    const savedState = JSON.stringify({ dimensions, colors, tetrisShapes });
    localStorage.setItem('appState', savedState);
  };

  const loadState = () => {
    const savedState = JSON.parse(localStorage.getItem('appState'));
    if (savedState) {
      setDimensions(savedState.dimensions);
      setColors(savedState.colors);
      setTetrisShapes(savedState.tetrisShapes);
    }
  };

  function updateDimensions(e, dimension) {
    const value = Number(e.target.value);

    // Обновление всех связанных измерений одновременно
    setDimensions(prevDimensions => ({
      ...prevDimensions,
      [dimension]: value,
      // Поддержка пропорциональных изменений для других измерений:
      ...(dimension === 'widthBack' ? { depthFront: value } : {}),
      ...(dimension === 'depthFront' ? { widthBack: value } : {}),
      // Если изменяется одна из размерных осей, соответствующие высоты или глубины также обновляются
      ...(dimension === 'heightLeft' ? { heightLeft: value } : {})
    }));
  }

  return (
    <div style={{ height: "100vh", width: "100vw", backgroundColor: sceneBackgroundColor }}>

      <div style={{ position: "absolute", top: 20, right: 20, zIndex: 100 }}>
        <button onClick={() => addShape('L')}>Добавить L</button>
        <button onClick={() => addShape('J')}>Добавить J</button>
        <button onClick={() => addShape('T')}>Добавить T</button>
        <button onClick={() => addShape('O')}>Добавить O</button>
        <button onClick={() => addShape('Z')}>Добавить Z</button>
        <button onClick={() => addShape('I')}>Добавить I</button>

        <button onClick={saveState}>Сохранить состояние</button>
        <button onClick={loadState}>Загрузить состояние</button>
        <button onClick={() => setView('front')}>Вид спереди</button>
        <button onClick={() => setView('side')}>Вид сбоку</button>
        <button onClick={() => setView('top')}>Вид сверху</button>
      </div>
      <div style={{ position: "absolute", right: 20, middle: "50vh", zIndex: 100 }}>
        <button onClick={() => rotateActiveShape(90)}>Rotate 90°</button>
        <button onClick={() => rotateActiveShape(180)}>Rotate 180°</button>
        <button onClick={() => rotateActiveShape(270)}>Rotate 270°</button>

      </div>
      <div style={{ position: "absolute", bottom: 20, right: 20, zIndex: 100 }}>
        <button onClick={() => changeShapeColor(activeShapeIndex, '#ff0000')}>Красный</button>
        <button onClick={() => changeShapeColor(activeShapeIndex, '#00ff00')}>Зелёный</button>
        <button onClick={() => changeShapeColor(activeShapeIndex, '#0000ff')}>Синий</button>
      </div>
      <Canvas camera={{ fov: 50 }}>
        <ambientLight intensity={0.5} />

        <CameraController position={cameraPosition} />


        <OrbitControls
          enableZoom={true}

          maxPolarAngle={Math.PI / 2}
          minPolarAngle={0}
          maxAzimuthAngle={Math.PI / 2}
          minAzimuthAngle={-Math.PI / 5000}
        />

        <Physics>
          <ThreeSidedGrid {...dimensions} colors={colors} />
          {tetrisShapes.map((shape, index) => (
            <TetrisShapes
              key={index}
              shape={shape.type}
              color={shape.color}
              position={shape.position}
              rotation={shape.rotation}
              cellSize={dimensions.cellSize}
              configuration={shape.configuration}
              dimensions={dimensions}
              onClick={() => setActiveShapeIndex(index)}
              setTetrisShapes={setTetrisShapes}

            />
          ))}
        </Physics>
      </Canvas>

      <div style={{ position: "absolute", top: 20, left: 20, zIndex: 100 }}>


        <button onClick={() => moveShape('left')}>Влево</button>
        <button onClick={() => moveShape('right')}>Вправо</button>
        <button onClick={() => moveShape('forward')}>Вперёд</button>
        <button onClick={() => moveShape('backward')}>Назад</button>
        <button onClick={() => moveShape('up')}>вверз</button>
        <button onClick={() => moveShape('down')}>вниз</button>


        <div>
          <label htmlFor="cellSize">Размер клетки: </label>
          <input
            type="range"
            id="cellSize"
            min="8"
            max="14"
            step="2"
            value={dimensions.cellSize}
            onChange={updateSize('cellSize')}
            style={{ width: '200px' }}
          />
          <span>{dimensions.cellSize}</span>
        </div>

        <div>
          <label htmlFor="widthBack">Ширина: </label>
          <input
            type="number"
            id="widthBack"
            min="1"
            max="20"
            value={dimensions.widthBack}
            onChange={(e) => updateDimensions(e, 'widthBack')}
            style={{ width: '50px' }}
          />
          <label htmlFor="heightLeft">Высота: </label>
          <input
            type="number"
            id="heightLeft"
            min="1"
            max="20"
            value={dimensions.heightLeft}
            onChange={(e) => updateDimensions(e, 'heightLeft')}
            style={{ width: '50px' }}
          />
        </div>

      </div>
    </div>
  );
}

export default App;
