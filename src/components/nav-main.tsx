"use client";

import { Link, useLocation } from "react-router-dom";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: React.ComponentType<any>;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
}) {
  const { pathname } = useLocation();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Plataforma</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.url}>
            <SidebarMenuButton asChild isActive={pathname === item.url} tooltip={item.title}>
              <Link to={item.url}>
                {item.icon && <item.icon />}
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
