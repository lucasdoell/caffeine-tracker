import { AppSidebar } from "@/components/app-sidebar";

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
      <main></main>
    </DashboardLayout>
  );
}
