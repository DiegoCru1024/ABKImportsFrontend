import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function TeamSwitcher() {

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="flex flex-col items-center justify-center data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground w-full"
        >
          <div className="bg-sidebar-secondary text-sidebar-primary-foreground flex items-center justify-center rounded-lg mb-2 w-full p-2">
            <img
              src="/LOGO-02.webp"
              alt="ABK Imports Logo"
              className="w-full h-auto object-contain max-h-12"
            />
          </div>
          {/* <span className="truncate font-medium text-sm text-center">{activeTeam.name}</span> */}
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
