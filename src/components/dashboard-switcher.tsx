"use client";

import { Collapsible, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { obtenerUser } from "@/lib/functions";
import { useEffect, useState } from "react";

export function DashboardSwitcher({
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

      <SidebarMenu>
        {isClient && items.filter((item) => item.rolesPermitidos.includes(userRole)).map((item) => (
          <Collapsible
            key={item.title}
            asChild
            defaultOpen={item.isActive}
            className="group/collapsible"
          >
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton tooltip={item.title}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </CollapsibleTrigger>
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
