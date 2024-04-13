import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import ThreeSidedGrid from './ThreeSidedGrid';
import TetrisShapes from './TetrisShapes';
import { getShapeConfiguration, rotateShape } from './utils';
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

function App() {
  const initialDimensions = {
    cellSize: 8,
    widthBack: 6,
    heightLeft: 6,
    depthFront: 6,
  };

  const initialColors = {
    backColor: '#ffffff',
    leftColor: '#ffffff',
    frontColor: '#ffffff',
  };

  const [dimensions, setDimensions] = useState(initialDimensions);
  const [colors, setColors] = useState(initialColors);


  const [sceneBackgroundColor, setSceneBackgroundColor] = useState('#ffffff');
  const [currentView, setCurrentView] = useState('default');
  const cameraRef = useRef(new Vector3(10, 10, 10)); 

  const [cameraPosition, setCameraPosition] = useState(new Vector3(10, 10, 10));
  const [tetrisShapes, setTetrisShapes] = useState([]);
  const [cellSize, setCellSize] = useState(8);
  const [activeShapeIndex, setActiveShapeIndex] = useState(null);

  useEffect(() => {
  }, []);


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

  const addShape = useCallback((shapeType) => {
    const shapeConfiguration = getShapeConfiguration(shapeType);
    const grid = gridRef.current;
    let placementFound = false;
    let offset = { x: 0, y: 0, z: 0 };

    outerLoop:
    for (let row = 0; row < grid.length; row++) {
      for (let col = 0; col < grid[row].length; col++) {
        if (canPlaceShape(row, col, shapeConfiguration, grid)) {
          markGrid(row, col, shapeConfiguration, true, grid);
          offset = { x: col * dimensions.cellSize, y: 0, z: row * dimensions.cellSize };
          placementFound = true;
          break outerLoop;
        }
      }
    }
  
    if (!placementFound) {
      alert("No space available to place the shape.");
      return;
    }

    setTetrisShapes(prevShapes => {
      const newShape = {
        type: shapeType,
        color: '#ff0000',
        position: new Vector3(offset.x, offset.y, offset.z),
        rotation: 0,
        configuration: shapeConfiguration
      };
      const newShapes = [...prevShapes, newShape];
      setActiveShapeIndex(tetrisShapes.length);
      return newShapes;
    });
  }, [dimensions, tetrisShapes.length]);

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


  function moveShape(direction) {
    if (activeShapeIndex === null || activeShapeIndex >= tetrisShapes.length) return;
    const activeShape = tetrisShapes[activeShapeIndex];
    const { x, y, z } = activeShape.position;
  
    let newX = x, newY = y, newZ = z;
  
    switch (direction) {
      case 'up':
        newY += dimensions.cellSize;
        break;
      case 'down':
        newY -= dimensions.cellSize;
        break;
      case 'left':
        newX -= dimensions.cellSize;
        break;
      case 'right':
        newX += dimensions.cellSize;
        break;
      case 'forward':
        newZ += dimensions.cellSize;
        break;
      case 'backward':
        newZ -= dimensions.cellSize;
        break;
    }
  
    // Проверяем, что новая позиция находится в пределах пола и стен
    if (newX >= 0 && newX <= (dimensions.widthBack * dimensions.cellSize) &&
      newZ >= 0 && newZ <= (dimensions.depthFront * dimensions.cellSize) &&
      newY >= 0) { 
      const newPosition = new Vector3(newX, newY, newZ);
      setTetrisShapes(prevShapes => prevShapes.map((shape, index) => {
        if (index === activeShapeIndex) {
          return { ...shape, position: newPosition };
        }
        return shape;
      }));
    }
  }
  
  
  function rotateActiveShape(degrees) {
    if (activeShapeIndex === null || activeShapeIndex >= tetrisShapes.length) return;

    setTetrisShapes(prevShapes => prevShapes.map((shape, index) => {
      if (index === activeShapeIndex) {
        const newRotation = (shape.rotation + degrees) % 360;
        const newConfiguration = rotateShape(shape.type, newRotation);
        const oldCenter = calculateCenter(shape.configuration, shape.position);
        const newCenter = calculateCenter(newConfiguration, new Vector3(0, 0, 0)); 
        const newPosition = new Vector3(
          shape.position.x + oldCenter.x - newCenter.x,
          shape.position.y,
          shape.position.z + oldCenter.z - newCenter.z
        );

        return {
          ...shape,
          position: newPosition,
          rotation: newRotation,
          configuration: newConfiguration
        };
      }
      return shape;
    }));
  }


  function calculateCenter(configuration, position) {
    const xPositions = configuration.map(coord => coord[1]);
    const zPositions = configuration.map(coord => coord[2]);
    const averageX = xPositions.reduce((a, b) => a + b, 0) / configuration.length;
    const averageZ = zPositions.reduce((a, b) => a + b, 0) / configuration.length;
    const centerX = averageX * dimensions.cellSize + position.x;
    const centerZ = averageZ * dimensions.cellSize + position.z;
    return { x: centerX, z: centerZ };
  }

  const setView = (view) => {
    const positions = {
      front: new Vector3(0, 0, 10),
      side: new Vector3(10, 0, 0),
      top: new Vector3(0, 10, 0),
      default: new Vector3(10, 10, 10),
    };
    cameraRef.current = positions[view];
    setSceneBackgroundColor(colors[`${view}Color`]);
    setCurrentView(view);
  };

  const updateSize = (dimension) => (e) => {
    setDimensions(prevDimensions => ({
      ...prevDimensions,
      [dimension]: Number(e.target.value)
    }));
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
      <Canvas camera={{ position: cameraRef.current, fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={cameraRef.current} />

        <OrbitControls
          enableZoom={true}
          cameraPosition={cameraPosition}

          maxPolarAngle={Math.PI / 2}
          minPolarAngle={0}
          maxAzimuthAngle={Math.PI / 2}
          minAzimuthAngle={-Math.PI / 5000}
        />

        <Physics>
          <ThreeSidedGrid {...dimensions} colors={colors} />
          <perspectiveCamera ref={cameraRef} position={cameraPosition} fov={50} />
          {tetrisShapes.map((shape, index) => (
            <TetrisShapes
              key={index}
              shape={shape.type}
              color={shape.color}
              position={shape.position}
              rotation={shape.rotation}
              cellSize={cellSize}
              configuration={shape.configuration}
              onClick={() => setActiveShapeIndex(index)}
            />


          ))}
        </Physics>
      </Canvas>

      <div style={{ position: "absolute", top: 20, left: 20, zIndex: 100 }}>


        <button onClick={() => moveShape('left')}>Влево</button>
        <button onClick={() => moveShape('right')}>Вправо</button>
        <button onClick={() => moveShape('forward')}>Вперёд</button>
        <button onClick={() => moveShape('backward')}>Назад</button>

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
          <label htmlFor="widthBack">Ширина задней сетки: </label>
          <input
            type="number"
            id="widthBack"
            min="1"
            max="20"
            value={dimensions.widthBack}
            onChange={updateSize('widthBack')}
            style={{ width: '50px' }}
          />
          <label htmlFor="depthFront">Глубина передней сетки: </label>
          <input
            type="number"
            id="depthFront"
            min="1"
            max="20"
            value={dimensions.depthFront}
            onChange={updateSize('depthFront')}
            style={{ width: '50px' }}
          />
          <label htmlFor="heightLeft">Высота левой сетки: </label>
          <input
            type="number"
            id="heightLeft"
            min="1"
            max="20"
            value={dimensions.heightLeft}
            onChange={updateSize('heightLeft')}
            style={{ width: '50px' }}
          />
        </div>

      </div>
    </div>
  );
}

export default App;
