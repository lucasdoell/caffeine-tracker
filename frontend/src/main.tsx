import { LoginPage } from "@/components/login/page.tsx";
import { SignupPage } from "@/components/signup/page.tsx";
import { ThemeProvider } from "@/components/theme-provider.tsx";
import { SidebarProvider } from "@/components/ui/sidebar.tsx";
import { Toaster } from "@/components/ui/sonner";
import { DashboardPage } from "@/dashboard/page.tsx";
import "@fontsource/lusitana/400.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import App from "./App.tsx";
import "./global.css";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <QueryClientProvider client={queryClient}>
        <SidebarProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<App />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/sign-up" element={<SignupPage />} />
            </Routes>
          </BrowserRouter>
          <Toaster />
        </SidebarProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>
);
