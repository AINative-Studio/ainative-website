/**
 * Enhanced ZeroDB Tabs Component
 * Advanced tab navigation with categorization, badges, and responsive design
 */

import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { ZeroDBTab, ZeroDBSubTab } from './types';
import { ChevronRight, Sparkles, Zap } from 'lucide-react';

interface EnhancedTabsProps {
  tabs: ZeroDBTab[];
  defaultTab?: string;
  onTabChange?: (tabId: string) => void;
  className?: string;
  children?: React.ReactNode;
}

interface TabTriggerProps {
  tab: ZeroDBTab;
  isActive?: boolean;
  compact?: boolean;
}

interface SubTabNavigationProps {
  subTabs: ZeroDBSubTab[];
  activeSubTab?: string;
  onSubTabChange?: (subTabId: string) => void;
}

const TabTriggerComponent: React.FC<TabTriggerProps> = ({ tab, isActive, compact }) => {
  const IconComponent = tab.icon;
  
  return (
    <TabsTrigger
      value={tab.id}
      className={cn(
        'group relative flex-col gap-2 h-auto p-4 text-left transition-all duration-200',
        'data-[state=active]:bg-background data-[state=active]:shadow-sm',
        'hover:bg-muted/50 hover:scale-[1.02]',
        compact && 'p-3 gap-1',
        isActive && 'ring-2 ring-primary/20'
      )}
    >
      <div className="flex items-center gap-3 w-full">
        <div className={cn(
          'flex-shrink-0 p-2 rounded-lg transition-colors',
          'bg-primary/10 text-primary',
          'group-data-[state=active]:bg-primary group-data-[state=active]:text-primary-foreground'
        )}>
          <IconComponent className={cn('w-5 h-5', compact && 'w-4 h-4')} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={cn(
              'font-medium text-sm text-foreground truncate',
              compact && 'text-xs'
            )}>
              {tab.label}
            </span>
            
          </div>
          
          {!compact && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {tab.description}
            </p>
          )}
        </div>
        
        {tab.subTabs && tab.subTabs.length > 0 && (
          <ChevronRight className="w-4 h-4 text-muted-foreground group-data-[state=active]:text-primary" />
        )}
      </div>
      
      {!compact && tab.apiEndpoints && (
        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/50">
          <span className="text-xs text-muted-foreground">
            {tab.apiEndpoints.length} API{tab.apiEndpoints.length !== 1 ? 's' : ''}
          </span>
          <Separator orientation="vertical" className="h-3" />
          <div className="flex gap-1">
            {tab.apiEndpoints.slice(0, 3).map((_, idx) => (
              <div
                key={idx}
                className="w-2 h-2 rounded-full bg-primary/30 group-data-[state=active]:bg-primary/60"
              />
            ))}
            {tab.apiEndpoints.length > 3 && (
              <span className="text-xs text-muted-foreground ml-1">
                +{tab.apiEndpoints.length - 3}
              </span>
            )}
          </div>
        </div>
      )}
    </TabsTrigger>
  );
};

const SubTabNavigation: React.FC<SubTabNavigationProps> = ({ 
  subTabs, 
  activeSubTab, 
  onSubTabChange 
}) => {
  return (
    <div className="flex flex-wrap gap-2 mb-6 p-4 bg-muted/30 rounded-lg">
      {subTabs.map((subTab) => {
        const IconComponent = subTab.icon;
        const isActive = activeSubTab === subTab.id;
        
        return (
          <Button
            key={subTab.id}
            variant={isActive ? "default" : "ghost"}
            size="sm"
            className={cn(
              'h-auto p-3 flex flex-col items-center gap-2 min-w-0',
              'hover:bg-primary/10 hover:text-primary',
              isActive && 'bg-primary text-primary-foreground shadow-sm'
            )}
            onClick={() => onSubTabChange?.(subTab.id)}
          >
            <IconComponent className="w-4 h-4" />
            <div className="text-center">
              <div className="text-xs font-medium">{subTab.label}</div>
              <div className="text-xs opacity-70 line-clamp-1">
                {subTab.apiEndpoints.length} API{subTab.apiEndpoints.length !== 1 ? 's' : ''}
              </div>
            </div>
          </Button>
        );
      })}
    </div>
  );
};

export const EnhancedTabs: React.FC<EnhancedTabsProps> = ({
  tabs,
  defaultTab,
  onTabChange,
  className,
  children
}) => {
  const [activeTab, setActiveTab] = React.useState(defaultTab || tabs[0]?.id);
  const [activeSubTab, setActiveSubTab] = React.useState<string>();
  const [isCompactView, setIsCompactView] = React.useState(false);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    onTabChange?.(tabId);
    
    // Reset sub-tab when changing main tabs
    const tab = tabs.find(t => t.id === tabId);
    if (tab?.subTabs && tab.subTabs.length > 0) {
      setActiveSubTab(tab.subTabs[0].id);
    } else {
      setActiveSubTab(undefined);
    }
  };

  const currentTab = tabs.find(t => t.id === activeTab);

  // Check screen size for responsive design
  React.useEffect(() => {
    const checkScreenSize = () => {
      setIsCompactView(window.innerWidth < 1024); // lg breakpoint
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return (
    <div className={cn('w-full', className)}>
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        {/* Main Tab Navigation */}
        <div className="relative">
          <ScrollArea className="w-full">
            <TabsList 
              className={cn(
                'grid w-full bg-muted/50 p-1 h-auto rounded-lg',
                isCompactView ? 'grid-cols-2 gap-1' : 'grid-cols-4 gap-2',
                'lg:grid-cols-4 xl:grid-cols-4'
              )}
            >
              {tabs.map((tab) => (
                <TabTriggerComponent
                  key={tab.id}
                  tab={tab}
                  isActive={activeTab === tab.id}
                  compact={isCompactView}
                />
              ))}
            </TabsList>
          </ScrollArea>
        </div>

        {/* Tab Content */}
        {tabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className="space-y-6 mt-0">
            {/* Sub-tab Navigation */}
            {tab.subTabs && tab.subTabs.length > 0 && (
              <SubTabNavigation
                subTabs={tab.subTabs}
                activeSubTab={activeSubTab}
                onSubTabChange={setActiveSubTab}
              />
            )}

            {/* Tab Header */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 text-primary rounded-lg">
                      <tab.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">
                        {tab.label}
                      </h2>
                      <p className="text-muted-foreground">
                        {tab.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <Card className="bg-card/50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4 text-sm">
                      <div className="text-center">
                        <div className="font-medium text-foreground">
                          {tab.apiEndpoints.length}
                        </div>
                        <div className="text-muted-foreground text-xs">
                          API Endpoints
                        </div>
                      </div>
                      {tab.subTabs && (
                        <>
                          <Separator orientation="vertical" className="h-8" />
                          <div className="text-center">
                            <div className="font-medium text-foreground">
                              {tab.subTabs.length}
                            </div>
                            <div className="text-muted-foreground text-xs">
                              Categories
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* API Endpoint Overview */}
              {!isCompactView && (
                <Card className="bg-muted/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Available APIs</CardTitle>
                    <CardDescription>
                      {activeSubTab 
                        ? `APIs for ${currentTab?.subTabs?.find(st => st.id === activeSubTab)?.label || 'this service'}`
                        : `All ${tab.apiEndpoints.length} API endpoints for ${tab.label}`
                      }
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {(activeSubTab 
                        ? currentTab?.subTabs?.find(st => st.id === activeSubTab)?.apiEndpoints
                        : tab.apiEndpoints
                      )?.slice(0, 6).map((endpoint, idx) => (
                        <div
                          key={idx}
                          className="p-2 rounded-md bg-background/50 border text-xs font-mono text-muted-foreground hover:bg-background cursor-pointer transition-colors group relative"
                          title={`Click to copy: ${endpoint}`}
                          onClick={() => {
                            navigator.clipboard.writeText(endpoint).then(() => {
                              // Could add toast notification here
                            });
                          }}
                        >
                          <span className="truncate block pr-6">{endpoint}</span>
                          <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                            📋
                          </div>
                        </div>
                      ))}
                      {tab.apiEndpoints.length > 6 && (
                        <div className="p-2 rounded-md bg-background/50 border text-xs text-center text-muted-foreground">
                          +{tab.apiEndpoints.length - 6} more
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Tab Content Area */}
            <div className="space-y-6">
              {React.Children.map(children, (child) => {
                if (React.isValidElement(child) && (child.props as { id?: string })?.id === activeTab) {
                  return child;
                }
                return null;
              })}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default EnhancedTabs;