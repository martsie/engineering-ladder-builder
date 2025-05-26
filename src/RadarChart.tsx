import React, { useRef, useState, useEffect } from 'react';

interface RadarChartProps {
  labels: string[];
  values: number[];
  setValues: React.Dispatch<React.SetStateAction<number[]>>;
  max?: number;
  size?: number;
  levelLabels?: string[][]; // New prop: per-axis level labels
}

const RadarChart: React.FC<RadarChartProps> = ({
  labels,
  values,
  setValues,
  max = 5,
  size = 400,
  levelLabels,
}) => {
  const numAxes = labels.length;
  const center = size / 2;
  const radius = size * 0.4;
  const svgRef = useRef<SVGSVGElement>(null);
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);
  const draggingIdxRef = useRef<number | null>(null);

  useEffect(() => {
    draggingIdxRef.current = draggingIdx;
  }, [draggingIdx]);

  useEffect(() => {
    // Clean up listeners on unmount
    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
    };
    // eslint-disable-next-line
  }, []);

  // Provide default level labels if not given
  const defaultLevels = Array.from({ length: max }, (_, i) => `Level ${i + 1}`);
  const levels: string[][] = levelLabels && levelLabels.length === numAxes
    ? levelLabels.map((arr) => arr.length === max ? arr : defaultLevels)
    : Array(numAxes).fill(defaultLevels);

  // Calculate points for a given axis and value scale
  const getPoint = (i: number, valueScale = 1) => {
    const angle = (Math.PI * 2 * i) / numAxes - Math.PI / 2;
    const r = radius * valueScale;
    return [
      center + r * Math.cos(angle),
      center + r * Math.sin(angle),
    ];
  };

  // Draw concentric pentagons for each level
  const levelPolygons = Array.from({ length: max }, (_, levelIdx) => {
    const scale = (levelIdx + 1) / max;
    const points = Array.from({ length: numAxes }, (_, i) =>
      getPoint(i, scale).join(",")
    ).join(" ");
    return (
      <polygon
        key={levelIdx}
        points={points}
        fill="none"
        stroke="#888"
        strokeDasharray="4"
        opacity={0.5}
      />
    );
  });

  // Pentagon outline (outermost)
  const outlinePoints = Array.from({ length: numAxes }, (_, i) =>
    getPoint(i).join(",")
  ).join(" ");

  // Mouse event handlers for dragging
  const handlePointerDown = (idx: number) => (e: React.MouseEvent) => {
    e.preventDefault();
    setDraggingIdx(idx);
    draggingIdxRef.current = idx;
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);
  };

  const handlePointerMove = (e: MouseEvent) => {
    if (draggingIdxRef.current === null || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const dx = x - center;
    const dy = y - center;
    const dist = Math.sqrt(dx * dx + dy * dy);
    // Clamp to [1, max] and round to nearest tenth
    let value = (dist / radius) * max;
    value = Math.max(1, Math.min(max, value));
    value = Math.round(value * 10) / 10;
    setValues((vals) => vals.map((v, i) => (i === draggingIdxRef.current ? value : v)));
  };

  const handlePointerUp = () => {
    setDraggingIdx(null);
    draggingIdxRef.current = null;
    window.removeEventListener('mousemove', handlePointerMove);
    window.removeEventListener('mouseup', handlePointerUp);
  };

  // User values
  const valuePointsArr = Array.from({ length: numAxes }, (_, i) =>
    getPoint(i, values[i] / max)
  );
  const valuePoints = valuePointsArr.map(([x, y]) => `${x},${y}`).join(' ');

  // Render level labels along each axis
  const levelLabelElements = labels.flatMap((_, axisIdx) => {
    return levels[axisIdx].map((levelLabel, levelIdx) => {
      // Place label at the correct radius for this level, slightly offset outward
      const scale = (levelIdx + 1) / max + 0.07;
      const [x, y] = getPoint(axisIdx, scale);
      return (
        <text
          key={`level-label-${axisIdx}-${levelIdx}`}
          x={x}
          y={y}
          textAnchor="middle"
          alignmentBaseline="middle"
          fontSize={12}
          fill="#111"
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          {levelLabel}
        </text>
      );
    });
  });

  // Encompassing pentagon (slightly larger than the outermost)
  const encompassScale = 1.2;
  const encompassPointsArr = Array.from({ length: numAxes }, (_, i) => getPoint(i, encompassScale));
  const encompassPoints = encompassPointsArr.map(([x, y]) => `${x},${y}`).join(",");

  return (
    <svg
      ref={svgRef}
      width={size}
      height={size}
      className="block mx-auto"
      style={{ touchAction: 'none', cursor: draggingIdx !== null ? 'grabbing' : 'default' }}
    >
      {/* Encompassing solid black pentagon */}
      <polygon
        points={encompassPoints}
        fill="none"
        stroke="#000"
        strokeWidth={2}
      />
      {/* Radial lines from center to each tip of the encompassing pentagon */}
      {encompassPointsArr.map(([x, y], i) => (
        <line
          key={`encompass-radial-${i}`}
          x1={center}
          y1={center}
          x2={x}
          y2={y}
          stroke="#000"
          strokeWidth={2}
        />
      ))}
      {/* Top level labels at the tips of the encompassing pentagon */}
      {encompassPointsArr.map(([x, y], i) => (
        <text
          key={`encompass-label-${i}`}
          x={x}
          y={y}
          textAnchor="middle"
          alignmentBaseline="middle"
          fontSize={18}
          fontWeight={600}
          fill="#111"
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          {labels[i]}
        </text>
      ))}
      {/* Concentric pentagons for each level */}
      {levelPolygons}
      {/* Pentagon outline (outermost) */}
      <polygon
        points={outlinePoints}
        fill="none"
        stroke="#888"
        strokeDasharray="4"
      />
      {/* User value shape */}
      <polygon
        points={valuePoints}
        fill="rgba(255, 215, 0, 0.3)"
        stroke="gold"
        strokeWidth={2}
      />
      {/* Draggable handles */}
      {valuePointsArr.map(([x, y], i) => (
        <circle
          key={i}
          cx={x}
          cy={y}
          r={10}
          fill="transparent"
          stroke="transparent"
          strokeWidth={3}
          style={{ cursor: 'grab' }}
          onMouseDown={handlePointerDown(i)}
        />
      ))}
      {/* Level labels */}
      {levelLabelElements}
    </svg>
  );
};

export default RadarChart; 