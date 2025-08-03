import React, { useEffect, useRef, useState } from 'react';

export const LabelWithBackgroundSVG = ({
  x,
  y,
  value,
}: {
  x?: string | number;
  y?: string | number;
  value?: string | number;
}) => {
  const textRef = useRef<SVGTextElement | null>(null);
  const [bbox, setBBox] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (textRef.current) {
      const raf = requestAnimationFrame(() => {
        if (textRef.current) {
          setBBox(textRef.current.getBBox());
        }
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [value]);

  if (x == null || y == null || value == null) return null;

  const padding = 4; // px
  // shift label upward so it doesn't overlap the point
  const translateX = x;
  const translateY = typeof y === 'number' ? y - 20 : y;

  return (
    <g transform={`translate(${translateX}, ${translateY})`}>
      {bbox && (
        <rect
          x={bbox.x - padding}
          y={bbox.y - padding}
          width={bbox.width + padding * 2}
          height={bbox.height + padding * 2}
          rx={4}
          fill="#000"
        />
      )}
      <text
        ref={textRef}
        fontSize={12}
        fontWeight="bold"
        fill="white"
        dominantBaseline="middle"
        textAnchor="start"
      >
        {value}
      </text>
    </g>
  );
};
