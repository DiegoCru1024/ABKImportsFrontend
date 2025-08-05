
import { Outlet } from 'react-router-dom'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import HeaderConBreadcrumb from '@/components/header-breadcrumb'
import { ThemeProvider } from '@/context/theme-provider'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient();
export default function DashboardLayout() {
  return (
    <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light"> 
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <HeaderConBreadcrumb />
        <div className="flex flex-1 flex-col gap-4 px-0 pt-0">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
    </ThemeProvider>
    </QueryClientProvider>
  )
} 