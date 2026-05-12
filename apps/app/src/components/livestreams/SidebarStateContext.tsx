'use client';

import { createContext, useContext, useState } from 'react';

interface SidebarState {
  collapsed: boolean;
  toggle: () => void;
}

const SidebarStateContext = createContext<SidebarState>({
  collapsed: false,
  toggle: () => {},
});

export function SidebarStateProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <SidebarStateContext.Provider
      value={{ collapsed, toggle: () => setCollapsed((prev) => !prev) }}
    >
      {children}
    </SidebarStateContext.Provider>
  );
}

export function useSidebarState(): SidebarState {
  return useContext(SidebarStateContext);
}
