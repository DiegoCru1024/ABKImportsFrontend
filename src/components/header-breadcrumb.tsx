import { useLocation, Link } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SidebarTrigger } from "./ui/sidebar";
import { Separator } from "@radix-ui/react-separator";
import React from "react";
import SocketNotification from "./socket-notification";
import { useTheme } from "../context/theme-provider";
import { Moon, Sun } from "lucide-react";

function toTitle(segment: string) {
  return segment.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

export default function HeaderConBreadcrumb() {
  const location = useLocation();
  const segments = location.pathname.split("/").filter(Boolean);
  let path = "";

  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <header
      className="flex h-12 shrink-0 items-center gap-2 border-b-1 border-border/60  dark:border-border/60  dark:border-b-white/50 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12  
    supports-[backdrop-filter]:bg-background/60 "
    >
      <div className="flex items-center gap-2 px-4 flex-1 justify-between">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink asChild href="/">
                  <Link to="/dashboard">Inicio</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              {segments.map((seg, i) => {
                path += `/${seg}`;
                const isLast = i === segments.length - 1;
                return (
                  <React.Fragment key={`sep-${i}`}>
                    <BreadcrumbSeparator
                      key={`sep-${i}`}
                      className="hidden md:block"
                    />
                    <BreadcrumbItem key={path}>
                      {isLast ? (
                        <BreadcrumbPage>{toTitle(seg)}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink asChild href={path}>
                          <Link to={path}>{toTitle(seg)}</Link>
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                  </React.Fragment>
                );
              })}
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="flex items-center gap-2">
          <div
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className={`flex items-center cursor-pointer transition-transform duration-500 ${
              isDark ? "rotate-180" : "rotate-0"
            }`}
          >
            {isDark ? (
              <Sun className="h-6 w-6 text-yellow-500 rotate-0 transition-all" />
            ) : (
              <Moon className="h-6 w-6 text-blue-500 rotate-0 transition-all" />
            )}
            <span className="sr-only">Toggle theme</span>
          </div>
           <SocketNotification /> 
        </div>
      </div>
    </header>
  );
}
