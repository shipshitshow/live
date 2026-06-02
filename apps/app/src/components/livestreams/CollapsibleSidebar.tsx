export function CollapsibleSidebar({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <aside className="w-full shrink-0 lg:sticky lg:top-6 lg:max-h-[calc(100vh-7rem)] lg:w-[380px] lg:overflow-y-auto lg:pr-1">
      {children}
    </aside>
  );
}
