"use client";

import { Link, useLocation } from "react-router-dom";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useEffect, useState } from "react";
import { obtenerUser } from "@/lib/functions";

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
    rolesPermitidos: string[];
  }[];
}) {
  const { pathname } = useLocation();

  // 🔥 Estado para manejar el rol solo en el cliente
  const [userRole, setUserRole] = useState<string>("temporal");
  const [isClient, setIsClient] = useState(false);

  // 🔥 useEffect para obtener el rol solo en el cliente
  useEffect(() => {
    setIsClient(true);
    const user = obtenerUser();
    setUserRole(user.type || "temporal");
  }, []);

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Plataforma</SidebarGroupLabel>
      <SidebarMenu>
        {isClient &&
          items
            .filter((item) => item.rolesPermitidos.includes(userRole))
            .map((item) => (
              <SidebarMenuItem key={item.url}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.url}
                  tooltip={item.title}
                >
                  <Link to={item.url} className="flex items-center gap-3">
                    {item.icon && <item.icon className="w-6 h-6" />}
                    <span className="text-sm  text-gray-700  font-semibold uppercase">{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
