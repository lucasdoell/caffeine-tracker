"use client";

import * as React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";

type TimeRange = "90d" | "30d" | "7d";

interface CaffeineDataPoint {
  date: string;
  caffeine_remaining_mg: number;
}

const chartConfig = {
  caffeine: {
    label: "Caffeine Remaining",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

async function getCaffeineOverTime(): Promise<CaffeineDataPoint[]> {
  const response = await fetch("/api/caffeine/caffeine-over-time", {
    method: "GET",
    headers: {
      Authorization: `Token ${localStorage.getItem("jwt_token")}`,
    },
  });
  return response.json();
}

export function CaffeineOverTimeChart() {
  const [timeRange, setTimeRange] = React.useState<TimeRange>("90d");
  const { data: caffeineOverTime, isLoading } = useQuery({
    queryKey: ["caffeineOverTime"],
    queryFn: getCaffeineOverTime,
    staleTime: Infinity,
  });

  if (isLoading) {
    return <div role="status">Loading caffeine data...</div>;
  }

  if (!caffeineOverTime) {
    return <div role="status">No caffeine data available</div>;
  }

  const filteredData = caffeineOverTime.filter((item) => {
    const date = new Date(item.date);
    const referenceDate = new Date();
    const daysToSubtract =
      timeRange === "30d" ? 30 : timeRange === "7d" ? 7 : 90;
    const startDate = new Date(referenceDate);
    startDate.setDate(startDate.getDate() - daysToSubtract);
    return date >= startDate;
  });

  return (
    <Card>
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1 text-center sm:text-left">
          <CardTitle>Caffeine Over Time</CardTitle>
          <CardDescription>
            Track your remaining caffeine levels over time
          </CardDescription>
        </div>
        <Select
          value={timeRange}
          onValueChange={(value: string) => setTimeRange(value as TimeRange)}
        >
          <SelectTrigger
            className="w-[160px] rounded-lg sm:ml-auto"
            aria-label="Select time range"
          >
            <SelectValue placeholder="Last 3 months" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="90d">Last 3 months</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="7d">Last 7 days</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={filteredData}>
              <defs>
                <linearGradient id="fillCaffeine" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--chart-1)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--chart-1)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={formatDate}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => `${value}mg`}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent labelFormatter={formatDate} />}
              />
              <Area
                dataKey="caffeine_remaining_mg"
                name="Caffeine Remaining"
                type="natural"
                fill="url(#fillCaffeine)"
                stroke="var(--chart-1)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
