import { AppSidebar } from "@/components/app-sidebar";
import { CaffeineChart } from "@/components/charts/caffeine-chart";
import { CaffeineOverTimeChart } from "@/components/charts/caffeine-over-time";
import { CaffeineLog } from "@/components/log/caffeine-log";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { QuickSelectorCard } from "@/dashboard/quick-selector-card";
import { ChatBot } from "@/components/chatbot/chat-bot";
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
  const res = await fetch("/api/users/profile/", {
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
      <main className="flex flex-col gap-6 p-6 w-full">
        <Card>
          <CardHeader>
            <h1 className="text-2xl">Dashboard</h1>
          </CardHeader>
          <section className="px-6">
            <Card className="bg-[#f7f1e9]">
              <CardHeader>
                <h2 className="text-2xl">Caffeine Makes It Possible 💪</h2>
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
          <section className="grid gap-6 p-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
            <div className="gap-6">
              <CaffeineChart />
            </div>
            <div className="gap-6">
              <CaffeineLog />
            </div>
            <div className="gap-6 col-span-full xl:col-span-2">
              <CaffeineOverTimeChart />
            </div>
            <div className="gap-6 col-span-2">
              <QuickSelectorCard />
            </div>
          </section>
        </Card>
        <ChatBot /> 
      </main>
    </DashboardLayout>
  );
}
