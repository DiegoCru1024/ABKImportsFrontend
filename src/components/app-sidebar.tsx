import * as React from "react";
import {
  BookMarked,
  Calculator,
  ClipboardList,
  Handshake,
  MapPinned,
  Package,
  PackageSearch,
  SquareTerminal,
  User,
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

// This is sample data.
const data = {
  navMain: [
    {
      title: "Inspección de mercancias",
      url: "/dashboard/inspeccion-de-mercancias",
      icon: PackageSearch,
      //rolesPermitidos: ["temporal", "guest", "final"],
      rolesPermitidos: ["final", "admin"],
    },
    {
      title: "Gestión de mercancias",
      url: "/dashboard/gestion-de-mercancias",
      icon: PackageSearch,
      rolesPermitidos: ["admin"],
    },
    {
      title: "Tracking de mercancias",
      url: "/dashboard/tracking-de-mercancias",
      icon: MapPinned,
      //rolesPermitidos: ["temporal", "guest", "final"],
      rolesPermitidos: ["final"],
    },
    {
      title: "Gestión de tracking ",
      url: "/dashboard/gestion-de-tracking",
      icon: MapPinned,
      rolesPermitidos: ["admin"],
    },
    {
      title: "Cotizar Productos",
      url: "/dashboard/cotizacion-de-productos",
      icon: ClipboardList,
      rolesPermitidos: ["temporal", "guest", "final"],
    },
    {
      title: "Mis cotizaciones",
      url: "/dashboard/mis-cotizaciones",
      icon: Package,
      rolesPermitidos: ["temporal", "guest", "final"],
    },
    {
      title: "Gestión de cotizaciones",
      url: "/dashboard/gestion-de-cotizacion",
      icon: Package,
      rolesPermitidos: ["admin"],
    },
    {
      title: "Calculador de impuestos",
      url: "/dashboard/calculador-de-impuestos",
      icon: Calculator,
      rolesPermitidos: ["final", "admin"],
      //rolesPermitidos: ["temporal", "guest", "final", "admin", "final"],
    },

    {
      title: "Educación",
      url: "/dashboard/educacion",
      icon: BookMarked,
      //rolesPermitidos: ["temporal", "guest", "final", "admin", "final"],
      rolesPermitidos: ["final", "admin"],
    },

    {
      title: "Herramientas Logísticas",
      url: "/dashboard/herramientas-logisticas",
      icon: BsTools,
      //rolesPermitidos: ["temporal", "guest", "final", "admin", "final"],
      rolesPermitidos: ["final", "admin"],
    },

    {
      title: "Tarifas & Servicios",
      url: "/dashboard/tarifas-servicios",
      icon: Handshake,
      //rolesPermitidos: ["temporal", "guest", "final", "admin", "final"],
      rolesPermitidos: ["final", "admin"],
    },
    {
      title: "Gestión de usuarios",
      url: "/dashboard/gestion-de-usuarios",
      icon: User,
      rolesPermitidos: ["admin"],
    },
  ],

  dashboardSwitcher: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: SquareTerminal,
      isActive: true,
      rolesPermitidos: ["temporal", "guest", "final"],
    },
    {
      title: "Dashboard Admin",
      url: "/dashboard/admin",
      icon: SquareTerminal,
      isActive: true,
      rolesPermitidos: ["admin"],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <DashboardSwitcher items={data.dashboardSwitcher} />
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
