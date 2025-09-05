import React, { useMemo } from "react";

// Utils and Interfaces
import type { TabNavigationProps } from "../utils/interfaces";
import { formatServiceType } from "../utils/formatters";

// UI Components
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Dynamic tab navigation for switching between response groups
 * Auto-generates tabs from response data with active state management
 */
const TabNavigation: React.FC<TabNavigationProps> = ({
  responseGroups,
  activeResponseId,
  onTabChange,
  isLoading = false,
}) => {
  // Generate tab data from response groups
  const tabData = useMemo(() => {
    return Object.entries(responseGroups).map(([serviceType, group]) => ({
      value: group.defaultActive.uniqueId,
      label: formatServiceType(serviceType),
      count: group.count,
      serviceType,
      isActive: group.responses.some(r => r.uniqueId === activeResponseId),
    }));
  }, [responseGroups, activeResponseId]);

  // Find the currently active tab value
  const activeTabValue = useMemo(() => {
    // Try to find the tab that contains the active response
    const activeTab = tabData.find(tab => tab.isActive);
    if (activeTab) return activeTab.value;
    
    // Fallback to the first tab
    return tabData.length > 0 ? tabData[0].value : "";
  }, [tabData, activeResponseId]);

  // Handle tab change
  const handleTabChange = (tabValue: string) => {
    onTabChange(tabValue);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex space-x-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-32" />
        ))}
      </div>
    );
  }

  // Don't render if no tabs
  if (tabData.length === 0) {
    return null;
  }

  // Single tab - render as simple display
  if (tabData.length === 1) {
    const singleTab = tabData[0];
    return (
      <div className="flex items-center justify-center py-2">
        <div className="flex items-center gap-2">
          <span className="font-medium">{singleTab.label}</span>
          <Badge variant="secondary">{singleTab.count}</Badge>
        </div>
      </div>
    );
  }

  // Multiple tabs - render as tab navigation
  return (
    <Tabs value={activeTabValue} onValueChange={handleTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-auto gap-2 h-auto p-1">
        {tabData.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className="flex items-center gap-2 px-4 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <span className="font-medium">{tab.label}</span>
            <Badge 
              variant={tab.isActive ? "secondary" : "outline"}
              className="text-xs"
            >
              {tab.count}
            </Badge>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
};

export default TabNavigation;