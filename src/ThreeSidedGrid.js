import React from 'react';
import { LineBasicMaterial, BufferGeometry, LineSegments, Vector3 } from 'three';
import { Text } from '@react-three/drei';

const ThreeSidedGrid = ({ cellSize, widthBack, heightLeft }) => {
    const lines = [];
    const material = new LineBasicMaterial({ color: 'gray' });

    // горизонт и вертикальные линии для нижней сетки
    for (let i = 0; i <= widthBack; i++) {
        const horizontalLinePointsBottom = [new Vector3(0, 0, i * cellSize), new Vector3(widthBack * cellSize, 0, i * cellSize)];
        const horizontalGeometryBottom = new BufferGeometry().setFromPoints(horizontalLinePointsBottom);
        lines.push(<primitive object={new LineSegments(horizontalGeometryBottom, material)} key={`h-bottom-${i}`} />);

        const verticalLinePointsBottom = [new Vector3(i * cellSize, 0, 0), new Vector3(i * cellSize, 0, widthBack * cellSize)];
        const verticalGeometryBottom = new BufferGeometry().setFromPoints(verticalLinePointsBottom);
        lines.push(<primitive object={new LineSegments(verticalGeometryBottom, material)} key={`v-bottom-${i}`} />);
    }

    // горизонт и вертикальные линии для левой сетки
    for (let i = 0; i <= heightLeft; i++) {
        const horizontalLinePointsLeft = [new Vector3(0, i * cellSize, 0), new Vector3(0, i * cellSize, widthBack * cellSize)];
        const horizontalGeometryLeft = new BufferGeometry().setFromPoints(horizontalLinePointsLeft);
        lines.push(<primitive object={new LineSegments(horizontalGeometryLeft, material)} key={`h-left-${i}`} />);
    }
    for (let i = 0; i <= widthBack; i++) {
        const verticalLinePointsLeft = [new Vector3(0, 0, i * cellSize), new Vector3(0, heightLeft * cellSize, i * cellSize)];
        const verticalGeometryLeft = new BufferGeometry().setFromPoints(verticalLinePointsLeft);
        lines.push(<primitive object={new LineSegments(verticalGeometryLeft, material)} key={`v-left-${i}`} />);
    }

    // горизонт и вертикальные линии для задней сетки
    for (let i = 0; i <= heightLeft; i++) {
        const horizontalLinePointsBack = [new Vector3(0, i * cellSize, 0), new Vector3(widthBack * cellSize, i * cellSize, 0)];
        const horizontalGeometryBack = new BufferGeometry().setFromPoints(horizontalLinePointsBack);
        lines.push(<primitive object={new LineSegments(horizontalGeometryBack, material)} key={`h-back-${i}`} />);
    }
    for (let i = 0; i <= widthBack; i++) {
        const verticalLinePointsBack = [new Vector3(i * cellSize, 0, 0), new Vector3(i * cellSize, heightLeft * cellSize, 0)];
        const verticalGeometryBack = new BufferGeometry().setFromPoints(verticalLinePointsBack);
        lines.push(<primitive object={new LineSegments(verticalGeometryBack, material)} key={`v-back-${i}`} />);
    }
    // текст ширины задней сетки (сверху сетки)
    const widthBackSizePosition = new Vector3(widthBack * cellSize / 2, heightLeft * cellSize, 0);

    // текст для высоты левой сетки (сбоку сетки)
    const heightLeftSizePosition = new Vector3(0, heightLeft * cellSize / 2, widthBack * cellSize);


    lines.push(
        <Text
            position={widthBackSizePosition}
            rotation={[-Math.PI / 2, 0, 0]}
            fontSize={cellSize / 2}
            color={'black'}
            anchorX="center"
            anchorY="middle"
        >
            {`${widthBack * cellSize}`}см
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
        >
            {`${heightLeft * cellSize}`}см
        </Text>
    );
    return <group>{lines}</group>;
};

export default ThreeSidedGrid;
