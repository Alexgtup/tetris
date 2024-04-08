import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import ThreeSidedGrid from './ThreeSidedGrid';

function App() {
  const [cellSize, setCellSize] = useState(8);
  const [widthBack, setWidthBack] = useState(6);
  const [heightLeft, setHeightLeft] = useState(6);
  const [widthFront, setWidthFront] = useState(widthBack); 
  const [heightRight, setHeightRight] = useState(heightLeft); 

  const fixedSize = 10; 

  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      <Canvas camera={{ position: [10, 10, 10], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <ThreeSidedGrid
          cellSize={cellSize}
          widthBack={widthBack}
          heightLeft={heightLeft}
          fixedSize={fixedSize}
          widthFront={widthFront}
          heightRight={heightRight}
        />
        <OrbitControls
          enableZoom={true}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={0}
          maxAzimuthAngle={Math.PI / 4} 
          minAzimuthAngle={-Math.PI / 4} 
        />
        </Canvas>
      <div style={{ position: "absolute", top: 20, left: 20, zIndex: 100 }}>
        <label htmlFor="cellSize">Размер клетки: </label>
        <input
          type="range"
          id="cellSize"
          min="8"
          max="14"
          step="2"
          value={cellSize}
          onChange={(e) => setCellSize(Number(e.target.value))}
          style={{ width: '200px' }}
        />
        <span>{cellSize}</span>
        <div>
          <label htmlFor="widthBack">Ширина задней сетки: </label>
          <input
            type="number"
            id="widthBack"
            min="1"
            max="20"
            value={widthBack}
            onChange={(e) => setWidthBack(Number(e.target.value))}
            style={{ width: '50px' }}
          />
          <label htmlFor="heightLeft">Высота левой сетки: </label>
          <input
            type="number"
            id="heightLeft"
            min="1"
            max="20"
            value={heightLeft}
            onChange={(e) => setHeightLeft(Number(e.target.value))}
            style={{ width: '50px' }}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
