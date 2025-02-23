import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { type CaffeineLog } from "@/types/data-fetching";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, Coffee } from "lucide-react";

async function getCaffeineLogs() {
  const response = await fetch("/api/caffeine/logs", {
    method: "GET",
    headers: {
      Authorization: `Token ${localStorage.getItem("jwt_token")}`,
    },
  });
  return response.json() as unknown as CaffeineLog[];
}

function LoadingState() {
  return (
    <TableBody>
      {[...Array(3)].map((_, i) => (
        <TableRow key={i}>
          <TableCell>
            <Skeleton className="h-4 w-12" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-12" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-12" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-12" />
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  );
}

function EmptyState() {
  return (
    <TableRow>
      <TableCell colSpan={4} className="h-48 text-center">
        <div className="flex flex-col items-center justify-center space-y-3">
          <Coffee className="h-8 w-8 text-gray-400" />
          <div className="text-lg font-medium">No drinks logged yet</div>
          <div className="text-sm text-gray-500">
            Start tracking your caffeine intake by adding your first drink.
          </div>
        </div>
      </TableCell>
    </TableRow>
  );
}

function ErrorState({ error }: { error: Error }) {
  return (
    <Alert variant="destructive" className="mt-4">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        Failed to load caffeine logs: {error.message}
      </AlertDescription>
    </Alert>
  );
}

export function CaffeineLog() {
  const {
    data: caffeineLogs,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["caffeineLogs"],
    queryFn: getCaffeineLogs,
    staleTime: Infinity,
  });

  console.log(caffeineLogs);

  const totalAmount = caffeineLogs
    ? caffeineLogs.reduce((acc, log) => acc + log.caffeine_mg!, 0)
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coffee className="h-5 w-5" />
          Caffeine Log
        </CardTitle>
      </CardHeader>
      <CardContent className="max-h-[330px] overflow-y-auto">
        {error ? (
          <ErrorState error={error as Error} />
        ) : (
          <Table>
            <TableCaption>
              Track your daily caffeine and sugar intake
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Date</TableHead>
                <TableHead>Drink</TableHead>
                <TableHead>Caffeine (mg)</TableHead>
                <TableHead className="text-right">Sugar (g)</TableHead>
              </TableRow>
            </TableHeader>
            {isLoading ? (
              <LoadingState />
            ) : caffeineLogs?.length ? (
              <>
                <TableBody>
                  {caffeineLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium">
                        {new Date(log.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{log.beverage_name}</TableCell>
                      <TableCell>{log.caffeine_mg}</TableCell>
                      <TableCell className="text-right">
                        {log.sugars_g}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={2}>Total Caffeine</TableCell>
                    <TableCell colSpan={2} className="text-right">
                      {totalAmount} mg
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </>
            ) : (
              <TableBody>
                <EmptyState />
              </TableBody>
            )}
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
