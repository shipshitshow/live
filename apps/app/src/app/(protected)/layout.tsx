import { AppSidebar } from '@/components/AppSidebar';
import { AppTitlebar } from '@/components/AppTitlebar';
import { SidebarStateProvider } from '@/components/livestreams/SidebarStateContext';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarStateProvider>
      <div
        id="app-content-shell"
        className="flex h-screen flex-col bg-surface text-text-primary"
      >
        <AppTitlebar />
        <div className="flex min-h-0 flex-1 overflow-hidden">
          <AppSidebar />
          <main className="min-h-0 min-w-0 flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarStateProvider>
  );
}
