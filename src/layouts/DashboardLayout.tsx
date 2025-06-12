
import { Outlet } from 'react-router-dom'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import HeaderConBreadcrumb from '@/components/header-breadcrumb'

export default function DashboardLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <HeaderConBreadcrumb />
        <div className="flex flex-1 flex-col gap-4 px-0 pt-0">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
} 