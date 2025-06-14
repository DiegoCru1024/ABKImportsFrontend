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
import { DashboardSwitcher } from "./dashboard-switcher";
import userAvatar from '../assets/userlogo.png'
// This is sample data.
const data = {
  user: {
    name: "Usuario",
    rol: "Admin",
    avatar: userAvatar,
  },
  navMain: [
    {
      title: "Inspección de mercancias",
      url: "/dashboard/inspeccion-de-mercancias",
      icon: PackageSearch,
    },
    {
      title: "Tracking de mercancias",
      url: "/dashboard/tracking-de-mercancias",
      icon: MapPinned,
    },
    {
      title: "Cotización de productos",
      url: "/dashboard/cotizacion-de-productos",
      icon: IoMdPricetags,
    },
    {
      title: "Gestión de cotización",
      url: "/dashboard/gestion-de-cotizacion",
      icon: IoMdPricetags,
    },
    {
      title: "Calculador de impuestos",
      url: "/dashboard/calculador-de-impuestos",
      icon: Calculator,
    },
    {
      title: "Educación",
      url: "/dashboard/educacion",
      icon: BookMarked,
    },
    {
      title: "Herramientas Logísticas",
      url: "/dashboard/herramientas-logisticas",
      icon: BsTools,
    },
    {
      title: "Tarifas & Servicios",
      url: "/dashboard/tarifas-servicios",
      icon: Handshake,
    },
  ],

  dashboardSwitcher: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: SquareTerminal,
      isActive: true,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher  />
      </SidebarHeader>
      <SidebarContent>
        <DashboardSwitcher items={data.dashboardSwitcher} />
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
