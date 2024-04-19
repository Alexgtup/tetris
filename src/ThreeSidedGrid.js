import React, { useRef } from 'react';
import { LineBasicMaterial, BufferGeometry, LineSegments, Vector3, Object3D } from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { getContrastColor } from './utils';

const ThreeSidedGrid = ({ cellSize, widthBack, depthFront, heightLeft, colors, manualGridColors }) => {
    const lines = [];
    const gridColorBottom = manualGridColors?.bottomColor || getContrastColor(colors.frontColor);
    const gridColorLeft = manualGridColors?.leftColor || getContrastColor(colors.leftColor);
    const gridColorBack = manualGridColors?.backColor || getContrastColor(colors.backColor);

    const materialBottom = new LineBasicMaterial({ color: gridColorBottom });
    const materialLeft = new LineBasicMaterial({ color: gridColorLeft });
    const materialBack = new LineBasicMaterial({ color: gridColorBack });


    for (let i = 0; i <= depthFront; i++) {
        lines.push(<primitive object={new LineSegments(new BufferGeometry().setFromPoints([new Vector3(0, 0, i * cellSize), new Vector3(widthBack * cellSize, 0, i * cellSize)]), materialBottom)} key={`bottom-h-${i}`} />);
    }
    for (let i = 0; i <= widthBack; i++) {
        lines.push(<primitive object={new LineSegments(new BufferGeometry().setFromPoints([new Vector3(i * cellSize, 0, 0), new Vector3(i * cellSize, 0, depthFront * cellSize)]), materialBottom)} key={`bottom-v-${i}`} />);
    }
    for (let i = 0; i <= heightLeft; i++) {
        lines.push(<primitive object={new LineSegments(new BufferGeometry().setFromPoints([new Vector3(0, i * cellSize, 0), new Vector3(0, i * cellSize, depthFront * cellSize)]), materialLeft)} key={`left-h-${i}`} />);
    }
    for (let i = 0; i <= depthFront; i++) {
        lines.push(<primitive object={new LineSegments(new BufferGeometry().setFromPoints([new Vector3(0, 0, i * cellSize), new Vector3(0, heightLeft * cellSize, i * cellSize)]), materialLeft)} key={`left-v-${i}`} />);
    }
    for (let i = 0; i <= heightLeft; i++) {
        lines.push(<primitive object={new LineSegments(new BufferGeometry().setFromPoints([new Vector3(0, i * cellSize, 0), new Vector3(widthBack * cellSize, i * cellSize, 0)]), materialBack)} key={`back-h-${i}`} />);
    }
    for (let i = 0; i <= widthBack; i++) {
        lines.push(<primitive object={new LineSegments(new BufferGeometry().setFromPoints([new Vector3(i * cellSize, 0, 0), new Vector3(i * cellSize, heightLeft * cellSize, 0)]), materialBack)} key={`back-v-${i}`} />);
    }

    const textGroupRef = useRef(new Object3D());
    const { camera } = useThree();

    const widthTextRef = useRef();
    const depthTextRef = useRef();
    const heightTextRef = useRef();

    useFrame(() => {
    // Получаем позиции для текста на стенках
    const widthTextPosition = new Vector3(widthBack * cellSize / 2, heightLeft * cellSize, -cellSize); // Задняя стенка
    const depthTextPosition = new Vector3(-1, widthBack * cellSize, heightLeft * cellSize / 1.7); // Левая стенка
    const heightTextPosition = new Vector3(widthBack * cellSize, heightLeft * cellSize / 2, -1); // Правая стенка
  
    // Обновляем позицию текста
    if (widthTextRef.current) {
      widthTextRef.current.position.copy(widthTextPosition);
      widthTextRef.current.lookAt(camera.position);
    }
  
    if (depthTextRef.current) {
      depthTextRef.current.position.copy(depthTextPosition);
      depthTextRef.current.lookAt(camera.position);
    }
  
    if (heightTextRef.current) {
      heightTextRef.current.position.copy(heightTextPosition);
      heightTextRef.current.lookAt(camera.position);
    }
  });
  
    return (
        <group>
            {lines}
            <group ref={textGroupRef}>
                <Text 
                  fontSize={cellSize} 
                  color="black" 
                  anchorX="center" 
                  anchorY="middle"
                  ref={widthTextRef}

                  children={`${widthBack * cellSize}`} 
                />
                <Text 
                  fontSize={cellSize} 
                  ref={depthTextRef}

                  color="black" 
                  anchorX="center" 
                  anchorY="middle" 
                  rotation={[0, Math.PI / 2, 0]}
                  children={`${depthFront * cellSize}`} 
                />
                <Text 
                  fontSize={cellSize} 
                  ref={heightTextRef}

                  color="black" 
                  anchorX="center" 
                  anchorY="middle" 
                  rotation={[0, Math.PI / 2, Math.PI / 2]}
                  children={`${heightLeft * cellSize}`} 
                />
            </group>
        </group>
    );
};

export default ThreeSidedGrid;
