import { SidebarStateProvider } from '@/components/livestreams/SidebarStateContext';
import { ProductionShell } from '@/components/ProductionShell';
export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarStateProvider>
      <ProductionShell>{children}</ProductionShell>
    </SidebarStateProvider>
  );
}
