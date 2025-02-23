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

const caffeineLogs = [
  {
    date: "2023-01-01",
    time: "12:00 PM",
    method: "Coffee",
    amount: 10,
  },
  {
    date: "2023-01-01",
    time: "12:00 PM",
    method: "Coffee",
    amount: 10,
  },
  {
    date: "2023-01-01",
    time: "12:00 PM",
    method: "Coffee",
    amount: 10,
  },
  {
    date: "2023-01-01",
    time: "12:00 PM",
    method: "Coffee",
    amount: 10,
  },
  {
    date: "2023-01-01",
    time: "12:00 PM",
    method: "Coffee",
    amount: 10,
  },
  {
    date: "2023-01-01",
    time: "12:00 PM",
    method: "Coffee",
    amount: 10,
  },
];

const totalAmount = caffeineLogs.reduce((acc, log) => acc + log.amount, 0);

export function CaffeineLog() {
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
              <TableHead>Time</TableHead>
              <TableHead>Method</TableHead>
              <TableHead className="text-right">Amount (g)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {caffeineLogs.map((log) => (
              <TableRow key={log.date}>
                <TableCell className="font-medium">{log.date}</TableCell>
                <TableCell>{log.time}</TableCell>
                <TableCell>{log.method}</TableCell>
                <TableCell className="text-right">{log.amount}</TableCell>
              </TableRow>
            ))}
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
