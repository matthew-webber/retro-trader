'use client';

import { useStock } from '@/contexts/useStock';

import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

import {
  CartesianGrid,
  LabelList,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { useState, useRef, useEffect } from 'react';

export const ChartLineLabel = () => {
  const { stock, loading, error } = useStock();

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error || !stock) {
    return <p>Error loading chart</p>;
  }

  const chartData = [
    ...stock.previous_closes,
    { date: stock.date, close: stock.close },
  ];

  // Calculate dynamic Y-axis range
  const prices = chartData.map((item) => item.close);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  // Add padding (e.g., 5% above and below)
  const padding = (maxPrice - minPrice) * 0.05;
  const yAxisMin = Math.max(0, minPrice - padding); // Don't go below 0
  const yAxisMax = maxPrice + padding;

  const chartConfig = {
    close: {
      label: `${stock.symbol} Close`,
      color: 'var(--chart-1)',
    },
  } satisfies ChartConfig;

  const LabelWithBackgroundSVG = ({
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>{stock.symbol} Closing Prices</CardTitle>
        <CardDescription>
          {chartData[0].date} - {chartData[chartData.length - 1].date}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              top: 20,
              left: 30,
              right: 30,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(date) => new Date(date).toLocaleDateString()}
            />
            <YAxis
              domain={[yAxisMin, yAxisMax]}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `$${value.toFixed(2)}`}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Line
              dataKey="close"
              type="linear"
              stroke="var(--color-close)"
              strokeWidth={2}
              dot={{
                fill: 'var(--color-close)',
              }}
              activeDot={{
                r: 6,
              }}
            >
              <LabelList
                position="bottom"
                offset={12}
                className="fill-foreground"
                fontSize={12}
                content={(props) => <LabelWithBackgroundSVG {...props} />}
              />
            </Line>
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          {stock.symbol} last {chartData.length} days
        </div>
        <div className="text-muted-foreground leading-none">Closing prices</div>
      </CardFooter>
    </Card>
  );
};

export default ChartLineLabel;
