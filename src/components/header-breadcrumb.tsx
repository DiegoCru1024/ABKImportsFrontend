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

function toTitle(segment: string) {
  return segment
    .replace(/-/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

export default function HeaderConBreadcrumb() {
  const location = useLocation();
  const segments = location.pathname.split("/").filter(Boolean);
  let path = "";

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink asChild href="/">
                <Link to="/">Inicio</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {segments.map((seg, i) => {
              path += `/${seg}`;
              const isLast = i === segments.length - 1;
              return (
                <>
                  <BreadcrumbSeparator key={`sep-${i}`} className="hidden md:block" />
                  <BreadcrumbItem key={path}>
                    {isLast ? (
                      <BreadcrumbPage>{toTitle(seg)}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild href={path}>
                        <Link to={path}>{toTitle(seg)}</Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>
  );
} 