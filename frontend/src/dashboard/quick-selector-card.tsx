import { CaffeineLogDialog } from "@/components/forms/intake";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function QuickSelectorCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Add</CardTitle>
        <CardContent>
          <div className="flex flex-row gap-2 items-center space-x-4 text-sm">
            {/* Plus button */}
            <div className="flex items-center gap-2">
              <div className="flex flex-col gap-2">
                <ul>
                  <li>Caffeine</li>
                  <li>Water</li>
                  <li>Energy</li>
                </ul>
                <CaffeineLogDialog />
              </div>
            </div>

            {/* Selector */}
            <div className="items-center space-y-2">
              <img
                src={
                  "https://images.unsplash.com/photo-1588483977150-9c2127ab7bcc?q=80&w=2574&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                }
                alt="placeholder"
                className="h-32 w-32 rounded"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter></CardFooter>
      </CardHeader>
    </Card>
  );
}
