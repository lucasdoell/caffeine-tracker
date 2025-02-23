"use client";

import { Label, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { CaffeineLog } from "@/types/data-fetching";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp } from "lucide-react";

const chartConfig = {
  intake: {
    label: "Intake",
    color: "var(--chart-1)",
  },
  allowance: {
    label: "Total Allowance",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

async function getCaffeineLogs() {
  const response = await fetch("/api/caffeine/logs", {
    method: "GET",
    headers: {
      Authorization: `Token ${localStorage.getItem("jwt_token")}`,
    },
  });
  return response.json() as unknown as CaffeineLog[];
}

export function CaffeineChart() {
  const { data: caffeineLogs, isLoading } = useQuery({
    queryKey: ["caffeineLogs"],
    queryFn: getCaffeineLogs,
    staleTime: Infinity,
  });

  const todaysCaffeineLogs = caffeineLogs?.filter((log) =>
    log.created_at.includes(new Date().toISOString().split("T")[0])
  );
  const totalAmount = todaysCaffeineLogs?.reduce(
    (acc, log) => acc + log.caffeine_mg!,
    0
  );

  const chartData = [
    {
      intake: totalAmount,
      allowance: 400 - (totalAmount || 0),
    },
  ];

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Caffeine Meter</CardTitle>
        <CardDescription>
          Today ({new Date().toLocaleDateString()})
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 items-center pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square w-full max-w-[250px]"
        >
          <RadialBarChart
            data={chartData}
            endAngle={180}
            innerRadius={80}
            outerRadius={130}
          >
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) - 16}
                          className="fill-foreground text-2xl font-bold"
                        >
                          {totalAmount
                            ? totalAmount.toLocaleString()
                            : isLoading
                            ? "Loading..."
                            : "No data"}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 4}
                          className="fill-muted-foreground"
                        >
                          mg of caffeine
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </PolarRadiusAxis>
            <RadialBar
              dataKey="allowance"
              stackId="a"
              cornerRadius={5}
              fill="var(--color-allowance)"
              className="stroke-transparent stroke-2"
            />
            <RadialBar
              dataKey="intake"
              fill="var(--color-intake)"
              stackId="a"
              cornerRadius={5}
              className="stroke-transparent stroke-2"
            />
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Showing total caffeine intake for today
        </div>
      </CardFooter>
    </Card>
  );
}
