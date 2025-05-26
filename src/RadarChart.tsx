import React, { useRef, useState, useEffect } from 'react';
import { useLadderContext } from './LadderContext';

const RadarChart: React.FC = () => {
  const {
    values,
    levelLabels,
    topLabels,
    topLabelOffsets,
    setTopLabelOffsets,
    levelLabelOffsets,
    setLevelLabelOffsets,
  } = useLadderContext();

  const max = 5;
  const size = 400;
  const numAxes = topLabels.length;
  const padding = 140;
  const svgSize = size + padding * 2;
  const center = svgSize / 2;
  const radius = size * 0.4;
  const svgRef = useRef<SVGSVGElement>(null);
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);
  const [draggingType, setDraggingType] = useState<'top' | 'level' | null>(null);
  const [draggingLevel, setDraggingLevel] = useState<number | null>(null);
  const draggingIdxRef = useRef<number | null>(null);
  const draggingTypeRef = useRef<'top' | 'level' | null>(null);
  const draggingLevelRef = useRef<number | null>(null);
  // For smooth dragging
  const dragStartMouse = useRef<{ x: number; y: number } | null>(null);
  const dragStartOffset = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    draggingIdxRef.current = draggingIdx;
    draggingTypeRef.current = draggingType;
    draggingLevelRef.current = draggingLevel;
  }, [draggingIdx, draggingType, draggingLevel]);

  useEffect(() => {
    // Clean up listeners on unmount
    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
    };
    // eslint-disable-next-line
  }, []);

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

  // Drag handlers for top-level labels
  const handleTopLabelPointerDown = (i: number) => (e: React.MouseEvent) => {
    e.preventDefault();
    setDraggingIdx(i);
    setDraggingType('top');
    setDraggingLevel(null);
    if (svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      dragStartMouse.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      dragStartOffset.current = { ...topLabelOffsets[i] };
    }
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);
  };

  // Drag handlers for level labels
  const handleLevelLabelPointerDown = (axisIdx: number, levelIdx: number) => (e: React.MouseEvent) => {
    e.preventDefault();
    setDraggingIdx(axisIdx);
    setDraggingType('level');
    setDraggingLevel(levelIdx);
    if (svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      dragStartMouse.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      dragStartOffset.current = { ...levelLabelOffsets[axisIdx][levelIdx] };
    }
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);
  };

  const handlePointerMove = (e: MouseEvent) => {
    if (!svgRef.current || !dragStartMouse.current || !dragStartOffset.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const dx = x - dragStartMouse.current.x;
    const dy = y - dragStartMouse.current.y;
    if (draggingTypeRef.current === 'top' && draggingIdxRef.current !== null) {
      // Move top label
      const newOffsets = [...topLabelOffsets];
      newOffsets[draggingIdxRef.current] = {
        x: dragStartOffset.current.x + dx,
        y: dragStartOffset.current.y + dy,
      };
      setTopLabelOffsets(newOffsets);
    } else if (draggingTypeRef.current === 'level' && draggingIdxRef.current !== null && draggingLevelRef.current !== null) {
      // Move level label
      const newOffsets = levelLabelOffsets.map(arr => [...arr]);
      newOffsets[draggingIdxRef.current][draggingLevelRef.current] = {
        x: dragStartOffset.current.x + dx,
        y: dragStartOffset.current.y + dy,
      };
      setLevelLabelOffsets(newOffsets);
    }
  };

  const handlePointerUp = () => {
    setDraggingIdx(null);
    setDraggingType(null);
    setDraggingLevel(null);
    dragStartMouse.current = null;
    dragStartOffset.current = null;
    window.removeEventListener('mousemove', handlePointerMove);
    window.removeEventListener('mouseup', handlePointerUp);
  };

  // User values
  const valuePointsArr = Array.from({ length: numAxes }, (_, i) =>
    getPoint(i, values[i] / max)
  );
  const valuePoints = valuePointsArr.map(([x, y]) => `${x},${y}`).join(' ');

  // Render level labels along each axis
  const levelLabelElements = topLabels.flatMap((_, axisIdx) =>
    levelLabels[axisIdx].map((levelLabel, levelIdx) => {
      const scale = ((levelIdx + 1) / max) * 0.9 + 0.07;
      const [baseX, baseY] = getPoint(axisIdx, scale);
      const { x: dx, y: dy } = levelLabelOffsets[axisIdx][levelIdx];
      return (
        <text
          key={`level-label-${axisIdx}-${levelIdx}`}
          x={baseX + dx}
          y={baseY + dy}
          textAnchor="middle"
          alignmentBaseline="middle"
          fontSize={10}
          fill="#111"
          style={{ pointerEvents: 'all', userSelect: 'none', cursor: 'move' }}
          onMouseDown={handleLevelLabelPointerDown(axisIdx, levelIdx)}
        >
          {levelLabel}
        </text>
      );
    })
  );

  // Encompassing pentagon (slightly larger than the outermost)
  const encompassScale = 1.2;
  const encompassPointsArr = Array.from({ length: numAxes }, (_, i) => getPoint(i, encompassScale));
  const encompassPoints = encompassPointsArr.map(([x, y]) => `${x},${y}`).join(",");

  return (
    <svg
      ref={svgRef}
      width={svgSize}
      height={svgSize}
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
      {/* Top level labels at the tips of the encompassing pentagon, draggable */}
      {encompassPointsArr.map(([x, y], i) => (
        <text
          key={`encompass-label-${i}`}
          x={x + topLabelOffsets[i].x}
          y={y + topLabelOffsets[i].y}
          textAnchor="middle"
          alignmentBaseline="middle"
          fontSize={18}
          fontWeight={600}
          fill="#111"
          style={{ pointerEvents: 'all', userSelect: 'none', cursor: 'move' }}
          onMouseDown={handleTopLabelPointerDown(i)}
        >
          {topLabels[i]}
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
          onMouseDown={e => {
            e.preventDefault();
            setDraggingIdx(i);
            setDraggingType(null);
            setDraggingLevel(null);
            window.addEventListener('mousemove', handlePointerMove);
            window.addEventListener('mouseup', handlePointerUp);
          }}
        />
      ))}
      {/* Level labels, draggable */}
      {levelLabelElements}
    </svg>
  );
};

export default RadarChart; 