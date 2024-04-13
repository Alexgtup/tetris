import React from 'react';
import { useBox } from '@react-three/cannon';
import { usePlane } from '@react-three/cannon';

function TetrisShapes({ shape, color, position, rotation, cellSize, configuration, onClick }) {
  const [ref, api] = useBox(() => ({
    mass: 1,
    position: [position.x, position.y, position.z],
    rotation: [0, rotation * Math.PI / 180, 0],
  }));

  // Создание стен с плотностью
  const [floorRef] = usePlane(() => ({
    position: [0, -1, 0],
    rotation: [-Math.PI / 2, 0, 0]
  }));

  const [leftWallRef] = usePlane(() => ({
    position: [-cellSize * configuration.length / 2, 0, 0],
    rotation: [0, Math.PI / 2, 0],
    mass: 1000 // Плотность стены
  }));

  const [rightWallRef] = usePlane(() => ({
    position: [cellSize * configuration.length / 2, 0, 0],
    rotation: [0, -Math.PI / 2, 0],
    mass: 1000 // Плотность стены
  }));

  return (
    <>
      {configuration.map(([x, y, z], index) => {
        // Пересчитываем позиции блоков с учетом поворота
        let rotatedX = x, rotatedY = y, rotatedZ = z;
        switch (rotation) {
          case 90:
            [rotatedX, rotatedY] = [y, -x + configuration.length - 1];
            break;
          case 180:
            [rotatedX, rotatedY] = [-x + configuration.length - 1, -y + configuration.length - 1];
            break;
          case 270:
            [rotatedX, rotatedY] = [-y + configuration.length - 1, x];
            break;
          default:
            [rotatedX, rotatedY] = [x, y];
            break;
        }

        const posX = rotatedX * cellSize + position.x;
        const posY = rotatedY * cellSize + position.y;
        const posZ = rotatedZ * cellSize + position.z;

        return (
          <mesh
            key={index}
            position={[posX, posY, posZ]}
            onClick={onClick}
            ref={ref}
          >
            <boxGeometry attach="geometry" args={[cellSize, cellSize, cellSize]} />
            <meshStandardMaterial attach="material" color={color} />
          </mesh>
        );
      })}
    </>
  );
}

export default TetrisShapes;
