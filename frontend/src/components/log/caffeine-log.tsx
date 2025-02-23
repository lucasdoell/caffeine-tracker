import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useQuery } from "@tanstack/react-query";

type CaffeineLog = {
  id: number;
  user: string;
  drink_name: string;
  caffeine_content_mg: number;
  sugar_content_g: number;
  calories_kcal: number;
  consumed_at: string;
};

async function getCaffeineLogs() {
  const response = await fetch("/api/caffeine/logs/", {
    method: "GET",
    headers: {
      Authorization: `Token ${localStorage.getItem("jwt_token")}`,
    },
  });
  return response.json() as unknown as CaffeineLog[];
}

export function CaffeineLog() {
  const { data: caffeineLogs, isLoading } = useQuery({
    queryKey: ["caffeineLogs"],
    queryFn: getCaffeineLogs,
    staleTime: Infinity,
  });

  const totalAmount = caffeineLogs
    ? caffeineLogs.reduce((acc, log) => acc + log.caffeine_content_mg, 0)
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Caffeine Log</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableCaption>A list of your recent invoices.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Date</TableHead>
              <TableHead>Drink</TableHead>
              <TableHead>Caffeine (mg)</TableHead>
              <TableHead className="text-right">Sugar (g)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>Loading...</TableRow>
            ) : caffeineLogs?.length ? (
              caffeineLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">
                    {log.consumed_at.split("T")[0]}
                  </TableCell>
                  <TableCell>{log.drink_name}</TableCell>
                  <TableCell className="text-right">
                    {log.caffeine_content_mg}
                  </TableCell>
                  <TableCell>{log.sugar_content_g}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>No data found</TableRow>
            )}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={3}>Total</TableCell>
              <TableCell className="text-right">{totalAmount} grams</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </CardContent>
    </Card>
  );
}
