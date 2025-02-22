import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function App() {
  return (
    <>
      <div>
        <ModeToggle />
        <Button onClick={() => toast("Hello")}>Hello</Button>
      </div>
    </>
  );
}
