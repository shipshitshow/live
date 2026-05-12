export function CollapsibleSidebar({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <aside className="w-full shrink-0 lg:sticky lg:top-6 lg:w-[380px]">
      {children}
    </aside>
  );
}
