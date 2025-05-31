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
      url: "/inspeccion-de-mercancias",
      icon: PackageSearch,
    },
    {
      title: "Tracking de mercancias",
      url: "/tracking-de-mercancias",
      icon: MapPinned,
    },
    {
      title: "Cotización de productos",
      url: "/cotizacion-de-productos",
      icon: IoMdPricetags,
    },
    {
      title: "Mis cotizaciones",
      url: "/mis-cotizaciones",
      icon: IoMdPricetags,
    },
    {
      title: "Calculador de impuestos",
      url: "/calculador-de-impuestos",
      icon: Calculator,
    },
    {
      title: "Educación",
      url: "/educacion",
      icon: BookMarked,
    },
    {
      title: "Herramientas Logísticas",
      url: "/herramientas-logisticas",
      icon: BsTools,
    },
    {
      title: "Tarifas & Servicios",
      url: "/tarifas-servicios",
      icon: Handshake,
    },
  ],

  dashboardSwitcher: [
    {
      title: "Dashboard",
      url: "#",
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
