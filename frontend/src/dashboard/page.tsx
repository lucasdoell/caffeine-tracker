import { AppSidebar } from "@/components/app-sidebar";
import { CaffeineChart } from "@/components/charts/caffeine-chart";
import { CaffeineOverTimeChart } from "@/components/charts/caffeine-over-time";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { QuickSelectorCard } from "@/dashboard/quick-selector-card";
import { User } from "@/types/auth";
import { useQuery } from "@tanstack/react-query";

function DashboardLayout({ children }: React.PropsWithChildren) {
  return (
    <>
      <AppSidebar />
      {children}
    </>
  );
}

async function getUser(token: string | null) {
  if (!token) return null;
  const res = await fetch("http://localhost:8000/api/users/profile/", {
    headers: {
      Authorization: `Token ${token}`,
    },
  });

  return res.json();
}

export function DashboardPage() {
  const { data: user, isLoading: userLoading } = useQuery<User | null>({
    queryKey: ["user"],
    queryFn: async () => getUser(localStorage.getItem("jwt_token") ?? null),
    staleTime: Infinity,
  });

  const username = userLoading
    ? "Loading..."
    : user
    ? user.username
    : "unknown user";

  return (
    <DashboardLayout>
      <main className="flex flex-col gap-6 p-6">
        <Card>
          <CardHeader>
            <h1 className="text-2xl">Dashboard</h1>
          </CardHeader>
          <section className="px-6">
            <Card>
              <CardHeader>
                <h2 className="text-xl">Caffeine Makes It Possible 💪</h2>
              </CardHeader>
              <CardContent>
                <p className="text-base">
                  Welcome, {username}! 👋 Click{" "}
                  <a href="/login" className="underline">
                    here
                  </a>{" "}
                  to {user ? "log out" : "log in"}.
                </p>
              </CardContent>
            </Card>
          </section>
          <section className="grid gap-6 p-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <div className="gap-6">
              <CaffeineChart />
            </div>
            <div className="gap-6 col-span-full xl:col-span-3">
              <CaffeineOverTimeChart />
            </div>
            <div className="gap-6 col-span-2">
              <QuickSelectorCard />
            </div>
          </section>
        </Card>
      </main>
    </DashboardLayout>
  );
}
