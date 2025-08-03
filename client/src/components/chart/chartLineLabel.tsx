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
import { LabelWithBackgroundSVG } from './internal/labelWithBackgroundSVG';

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
              left: 10,
              right: 50,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={true}
              tickMargin={8}
              tickFormatter={(date) => new Date(date).toLocaleDateString()}
            />
            <YAxis
              domain={[yAxisMin, yAxisMax]}
              tickLine={false}
              axisLine={true}
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
