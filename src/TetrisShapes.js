import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useBox, usePlane } from '@react-three/cannon';
import { useThree, useFrame } from '@react-three/fiber';
import { Vector3 } from 'three';
import * as THREE from 'three'; 

function TetrisShapes({ shape, color, position, rotation, cellSize, configuration, dimensions, onClick, setTetrisShapes, rotateShape, isValidPosition, setBlocks, startFall }) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState(position);
  const meshRef = useRef();
  const { camera, gl: { domElement } } = useThree();

  const [, api] = useBox(() => ({
    mass: 1,
    position: [position.x, position.y + cellSize / 2, position.z],
    args: [cellSize, cellSize, cellSize],
    rotation: [0, rotation * Math.PI / 180, 0],
    type: 'Static',
    sleep: true 
  }));

  const onPointerDown = useCallback((event) => {
    setIsDragging(true);
    onClick(); // onClick для активации текущей фигуры
    event.stopPropagation();
  }, [onClick]);

  const onPointerUp = useCallback((event) => {
    if (isDragging && dragPosition !== position) {
        setTetrisShapes(prevShapes => prevShapes.map(s =>
            s === shape ? { ...s, position: dragPosition } : s
        ));
    }
    setIsDragging(false);
    event.stopPropagation();
}, [isDragging, dragPosition, setTetrisShapes, shape, position]);

  const onPointerMove = useCallback((event) => {
    if (!isDragging) return;
    event.stopPropagation();

    const mouse = new Vector3(
      (event.clientX / window.innerWidth) * 2 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1,
      0
    );

    mouse.unproject(camera);
    const dir = mouse.sub(camera.position).normalize();
    const distance = -camera.position.z / dir.z;
    const pos = camera.position.clone().add(dir.multiplyScalar(distance));

    pos.x = Math.max(Math.min(Math.round(pos.x / cellSize) * cellSize, dimensions.widthBack * cellSize - cellSize / 2), cellSize / 2);
    pos.z = Math.max(Math.min(Math.round(pos.z / cellSize) * cellSize, dimensions.depthFront * cellSize - cellSize / 2), cellSize / 2);

    setDragPosition(new Vector3(pos.x, position.y, pos.z));
    api.position.set(pos.x, position.y, pos.z);
  }, [isDragging, camera, position.y, cellSize, dimensions.widthBack, dimensions.depthFront]);

  useFrame(() => {
    if (meshRef.current && isDragging) {
      meshRef.current.position.copy(dragPosition);
    }
  });

  // Создание стен с плотностью
  const [floorRef] = usePlane(() => ({
    position: [0, -1, 0],
    rotation: [-Math.PI / 2, 0, 0],
    mass: 1000, // Установка массы в 0 делает объект статическим
    type: 'Static', 
    sleepy: true // состояние покоя
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
  
  function createCubeFrame(cubePosition, cellSize, frameThickness, color, configuration) {
    const sideGeometry = new THREE.BoxGeometry(cellSize, cellSize, frameThickness);
    const sideMaterial = new THREE.MeshStandardMaterial({ color });
  
    const cube = new THREE.Group();
  
    // Позиции и повороты для сторон куба, кроме лицевой стороны
    const positionsRotations = [
      { pos: [cellSize / 2, 0, 0], rot: [0, Math.PI / 2, 0] }, // Правая
      { pos: [-cellSize / 2, 0, 0], rot: [0, -Math.PI / 2, 0] }, // Левая
      { pos: [0, cellSize / 2, 0], rot: [Math.PI / 2, 0, 0] }, // Верхняя
      { pos: [0, -cellSize / 2, 0], rot: [-Math.PI / 2, 0, 0] } // Нижняя
    ];
  
    positionsRotations.forEach(({ pos, rot }) => {
      const mesh = new THREE.Mesh(sideGeometry, sideMaterial);
      mesh.position.set(...pos);
      mesh.rotation.set(...rot);
      cube.add(mesh);
    });
  
    // Устанавливаем позицию и поворот всего куба
    cube.position.set(cubePosition.x, cubePosition.y, cubePosition.z);
    cube.rotation.set(0, rotation * Math.PI / 180, 0);
  
    return cube;
  }
  
  return (
    <>
      {configuration.map(([x, y, z], index) => {
        // Позиция блоков с учетом поворота
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

        const cubePosition = new THREE.Vector3(
          position.x + x * cellSize,
          position.y + y * cellSize,
          position.z + z * cellSize
        );

        const frameThickness = cellSize * 0.1;

        const transparentFaceIndex = 0; 
        const cubeFrame = createCubeFrame(cubePosition, cellSize, frameThickness, color, transparentFaceIndex);
        
        return (
          <primitive
            key={index}
            object={cubeFrame}
            onPointerDown={(event) => onPointerDown(event, index)}
            onPointerUp={onPointerUp}
            onPointerMove={onPointerMove}
          />
        );
      })}
    </>
  );
}

export default TetrisShapes;
