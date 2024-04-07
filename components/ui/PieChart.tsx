import React from 'react';
import Svg, { Path, G } from 'react-native-svg';
import { PieChartProps } from '../../types';

export const PieChart: React.FC<PieChartProps> = ({ width, height, data }) => {
    const totalValue = data.reduce((acc, cur) => acc + cur.value, 0);
    const startAngle = -Math.PI / 2;
    const radius = Math.min(width, height) / 2 - 35;
    let cumulativeAngle = startAngle;

    return (
        <Svg width={width} height={height}>
            <G transform={`translate(${width / 2}, ${height / 2})`}>
                {data.map((slice, index) => {
                    const arcLength = (slice.value / totalValue) * 2 * Math.PI;
                    const endAngle = cumulativeAngle + arcLength;
                    const path = `
                        M 0 0
                        L ${radius * Math.cos(cumulativeAngle)} ${radius * Math.sin(cumulativeAngle)}
                        A ${radius} ${radius} 0 ${arcLength > Math.PI ? 1 : 0} 1 ${radius * Math.cos(endAngle)} ${radius * Math.sin(endAngle)}
                        Z
                    `;
                    cumulativeAngle = endAngle;
                    return <Path key={index} d={path} fill={slice.color} />;
                })}
            </G>
        </Svg>
    );
};