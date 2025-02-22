import { AppSidebar } from "@/components/app-sidebar";
import { CaffeineChart } from "@/components/charts/caffeine-chart";
import { Card, CardHeader } from "@/components/ui/card";

function DashboardLayout({ children }: React.PropsWithChildren) {
  return (
    <>
      <AppSidebar />
      {children}
    </>
  );
}

export function DashboardPage() {
  return (
    <DashboardLayout>
      <main className="flex flex-col gap-6 p-6">
        <Card>
          <CardHeader>
            <h1 className="text-2xl">Dashboard</h1>
          </CardHeader>
          <section className="grid gap-6 p-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <div className="gap-6">
              <CaffeineChart />
            </div>
          </section>
        </Card>
      </main>
    </DashboardLayout>
  );
}
