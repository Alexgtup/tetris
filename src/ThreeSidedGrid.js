import React from 'react';
import { LineBasicMaterial, BufferGeometry, LineSegments, Vector3, Color } from 'three';
import { Text } from '@react-three/drei';

function getContrastColor(hexColor) {
  const color = new Color(hexColor);
  const d = color.r * 0.299 + color.g * 0.587 + color.b * 0.114;
  return d > 0.5 ? 'black' : 'white';
}

const ThreeSidedGrid = ({ cellSize, widthBack, depthFront, heightLeft, colors }) => {
    const lines = [];
    
    const materialBottom = new LineBasicMaterial({ color: getContrastColor(colors.frontColor) });
    const materialLeft = new LineBasicMaterial({ color: getContrastColor(colors.leftColor) });
    const materialBack = new LineBasicMaterial({ color: getContrastColor(colors.backColor) });

    for (let i = 0; i <= depthFront; i++) {
        const horizontalGeometryBottom = new BufferGeometry().setFromPoints([
            new Vector3(0, 0, i * cellSize), 
            new Vector3(widthBack * cellSize, 0, i * cellSize)
        ]);
        lines.push(<primitive object={new LineSegments(horizontalGeometryBottom, materialBottom)} key={`bottom-h-${i}`} />);
    }

    for (let i = 0; i <= widthBack; i++) {
        const verticalGeometryBottom = new BufferGeometry().setFromPoints([
            new Vector3(i * cellSize, 0, 0), 
            new Vector3(i * cellSize, 0, depthFront * cellSize)
        ]);
        lines.push(<primitive object={new LineSegments(verticalGeometryBottom, materialBottom)} key={`bottom-v-${i}`} />);
    }

    for (let i = 0; i <= heightLeft; i++) {
        const horizontalGeometryLeft = new BufferGeometry().setFromPoints([
            new Vector3(0, i * cellSize, 0), 
            new Vector3(0, i * cellSize, widthBack * cellSize)
        ]);
        lines.push(<primitive object={new LineSegments(horizontalGeometryLeft, materialLeft)} key={`left-h-${i}`} />);
    }

    for (let i = 0; i <= widthBack; i++) {
        const verticalGeometryLeft = new BufferGeometry().setFromPoints([
            new Vector3(0, 0, i * cellSize), 
            new Vector3(0, heightLeft * cellSize, i * cellSize)
        ]);
        lines.push(<primitive object={new LineSegments(verticalGeometryLeft, materialLeft)} key={`left-v-${i}`} />);
    }

    for (let i = 0; i <= heightLeft; i++) {
        const horizontalGeometryBack = new BufferGeometry().setFromPoints([
            new Vector3(0, i * cellSize, 0), 
            new Vector3(widthBack * cellSize, i * cellSize, 0)
        ]);
        lines.push(<primitive object={new LineSegments(horizontalGeometryBack, materialBack)} key={`back-h-${i}`} />);
    }

    for (let i = 0; i <= widthBack; i++) {
        const verticalGeometryBack = new BufferGeometry().setFromPoints([
            new Vector3(i * cellSize, 0, 0), 
            new Vector3(i * cellSize, heightLeft * cellSize, 0)
        ]);
        lines.push(<primitive object={new LineSegments(verticalGeometryBack, materialBack)} key={`back-v-${i}`} />);
    }

    const widthBackSizePosition = new Vector3(widthBack * cellSize / 2, heightLeft * cellSize, 0);
    const heightLeftSizePosition = new Vector3(0, heightLeft * cellSize / 2, widthBack * cellSize);
    lines.push(
        <Text
            position={widthBackSizePosition}
            rotation={[-Math.PI / 2, 0, 0]}
            fontSize={cellSize / 2}
            color={'black'}
            anchorX="center"
            anchorY="middle"
            key="width-back-label"
        >
            {`${widthBack * cellSize}`} см
        </Text>
    );

    lines.push(
        <Text
            position={heightLeftSizePosition}
            rotation={[0, Math.PI / 2, -Math.PI / 2]}
            fontSize={cellSize / 2}
            color={'black'}
            anchorX="center"
            anchorY="middle"
            key="height-left-label"
        >
            {`${heightLeft * cellSize}`} см
        </Text>
    );

    return <group>{lines}</group>;
};

export default ThreeSidedGrid;
