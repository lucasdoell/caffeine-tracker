"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CirclePlus, Home, Settings, User } from "lucide-react";

const menuItems = [
  { icon: Home, label: "Home", href: "/" },
  { icon: CirclePlus, label: "Quick Add", href: "/add" },
  { icon: User, label: "Profile", href: "/profile" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export function AppSidebar() {
  return (
    <Sidebar variant="floating" collapsible="icon" className="pt-6">
      <SidebarContent className="flex flex-col justify-center h-full py-4 bg-chart-1 rounded-lg">
        <SidebarMenu>
          <TooltipProvider delayDuration={0}>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.label}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <SidebarMenuButton asChild className="h-11 w-11 p-0">
                      <a
                        href={item.href}
                        className="flex items-center justify-center"
                      >
                        <item.icon className="h-6 w-6 text-white" />
                        <span className="sr-only">{item.label}</span>
                      </a>
                    </SidebarMenuButton>
                  </TooltipTrigger>
                  <TooltipContent side="right" sideOffset={10}>
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              </SidebarMenuItem>
            ))}
          </TooltipProvider>
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
