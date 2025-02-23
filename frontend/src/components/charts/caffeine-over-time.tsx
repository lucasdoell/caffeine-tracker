"use client";

import * as React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  Tooltip,
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
  ChartContainer,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";

type TimeRange = "1d" | "7d" | "30d";

interface CaffeineIntake {
  date: string; // Time of intake (ISO string)
  caffeine_mg: number;
}

interface CaffeineDataPoint {
  date: string; // ISO string
  caffeine_remaining_mg: number;
}

// Simple Chart Config
const chartConfig = {
  caffeine: {
    label: "Caffeine Remaining",
    color: "var(--chart-1)",
  },
};

// 1. Fetch caffeine intake events
async function getCaffeineIntake(): Promise<CaffeineIntake[]> {
  const response = await fetch("/api/caffeine/caffeine-over-time/", {
    method: "GET",
    headers: {
      Authorization: `Token ${localStorage.getItem("jwt_token")}`,
    },
  });
  return response.json();
}

// 2. Calculate caffeine decay at 5-min intervals
function calculateCaffeineDecay(
  intakes: CaffeineIntake[],
  timeRange: TimeRange
): CaffeineDataPoint[] {
  const halfLifeHours = 5;
  const now = new Date();

  // Decide how many minutes to go backward & forward
  const totalHours =
    timeRange === "1d" ? 24 : timeRange === "7d" ? 7 * 24 : 30 * 24;
  const totalMinutes = totalHours * 60;

  const data: CaffeineDataPoint[] = [];

  // Step in 5-minute increments
  for (let m = -totalMinutes; m <= totalMinutes; m += 5) {
    const timestamp = new Date(now);
    timestamp.setMinutes(now.getMinutes() + m);

    let sum = 0;
    // Sum all intakes (decayed) at this time
    for (const { date, caffeine_mg } of intakes) {
      const elapsedHrs =
        (timestamp.getTime() - new Date(date).getTime()) / (1000 * 3600);
      if (elapsedHrs >= 0) {
        sum += caffeine_mg * Math.pow(0.5, elapsedHrs / halfLifeHours);
      }
    }

    data.push({
      date: timestamp.toISOString(),
      caffeine_remaining_mg: Math.round(sum * 100) / 100,
    });
  }

  return data;
}

// 3. For each intake event, find the data point in the decayed dataset
function computeScatterPoints(
  intakes: CaffeineIntake[],
  decayData: CaffeineDataPoint[]
): CaffeineDataPoint[] {
  return intakes.map((intake) => {
    const isoDate = new Date(intake.date).toISOString();
    // Attempt direct match first
    let found = decayData.find(
      (dp) => dp.date.slice(0, 16) === isoDate.slice(0, 16)
    );

    if (!found) {
      // fallback: pick the closest in time
      let minDiff = Infinity;
      let closest: CaffeineDataPoint | null = null;
      for (const dp of decayData) {
        const diff = Math.abs(
          new Date(dp.date).getTime() - new Date(intake.date).getTime()
        );
        if (diff < minDiff) {
          minDiff = diff;
          closest = dp;
        }
      }
      found = closest || { date: isoDate, caffeine_remaining_mg: 0 };
    }
    return found;
  });
}

// 4. X-axis label: day vs. week vs. month
function formatXAxis(dateISO: string, timeRange: TimeRange): string {
  const date = new Date(dateISO);
  if (timeRange === "1d") {
    // e.g. 12:04 AM
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } else {
    // 7d or 30d
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }
}

// 5. Tooltip date: more verbose
function formatTooltipDate(dateISO: string): string {
  const d = new Date(dateISO);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function CaffeineOverTimeChart() {
  const [timeRange, setTimeRange] = React.useState<TimeRange>("1d");
  const { data: caffeineIntakes, isLoading } = useQuery({
    queryKey: ["caffeineIntakes"],
    queryFn: getCaffeineIntake,
    staleTime: Infinity,
  });

  if (isLoading) {
    return <div>Loading caffeine data...</div>;
  }
  if (!caffeineIntakes || caffeineIntakes.length === 0) {
    return <div>No caffeine data available</div>;
  }

  // Decay curve
  const decayData = calculateCaffeineDecay(caffeineIntakes, timeRange);
  // Points for each drink
  const scatterPoints = computeScatterPoints(caffeineIntakes, decayData);

  return (
    <Card>
      <CardHeader className="flex items-center gap-2 border-b py-5 sm:flex-row">
        <div className="flex-1 grid gap-1 text-center sm:text-left">
          <CardTitle>Caffeine Over Time</CardTitle>
          <CardDescription>
            Track your remaining caffeine levels over time
          </CardDescription>
        </div>
        <Select
          value={timeRange}
          onValueChange={(val: string) => setTimeRange(val as TimeRange)}
        >
          <SelectTrigger
            className="w-[160px] rounded-lg sm:ml-auto"
            aria-label="Select a range"
          >
            <SelectValue placeholder="Today" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1d">Today</SelectItem>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>

      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={decayData}>
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
                tickFormatter={(val) => formatXAxis(val, timeRange)}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(val) => `${val}mg`}
              />
              <Tooltip
                labelFormatter={(label) => formatTooltipDate(label)}
                formatter={(val) => [`${val} mg`, "Caffeine Remaining"]}
              />
              <Area
                dataKey="caffeine_remaining_mg"
                name="Caffeine Remaining"
                type="monotone"
                stroke="var(--chart-1)"
                strokeWidth={2}
                fill="url(#fillCaffeine)"
              />
              {/* Distinct, large red dots for intake points */}
              <Scatter
                data={scatterPoints}
                name="Caffeine Intake"
                fill="red"
                shape="circle"
                // Make them large
                r={8}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
