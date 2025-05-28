import * as React from "react";
import {
  BookMarked,

  Calculator,
  Handshake,
  MapPinned,
  PackageSearch,

  SquareTerminal,
} from "lucide-react";
import { IoMdPricetags } from "react-icons/io";
import { BsTools } from "react-icons/bs";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

// This is sample data.
const data = {
  user: {
    name: "Usuario",
    rol: "Admin",
    avatar: "/user.png",
  },
  teams: [
    {
      name: "ABK Imports",
      logo: "/abk-white.png",
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
    },
    {
      title: "Inspección de mercancias",
      url: "#",
      icon: PackageSearch,
    },
    {
      title: "Tracking de mercancias",
      url: "#",
      icon: MapPinned,
    },
    {
      title: "Cotización de productos",
      url: "#",
      icon: IoMdPricetags ,
    },
    {
      title: "Calculador de impuestos",
      url: "#",
      icon: Calculator ,
    },
    {
      title: "Educación",
      url: "#",
      icon: BookMarked,
    },
    {
      title: "Herramientas Logísticas",
      url: "#",
      icon: BsTools,
    },
    {
      title: "Tarifas & Servicios",
      url: "#",
      icon: Handshake ,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
