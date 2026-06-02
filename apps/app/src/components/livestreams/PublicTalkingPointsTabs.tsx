'use client';

import { useState } from 'react';

type PublicTab = 'prompts' | 'ressources' | 'talking-points';

const TABS: Array<{ label: string; tab: PublicTab }> = [
  { label: 'Talking Points', tab: 'talking-points' },
  { label: 'Ressources', tab: 'ressources' },
  { label: 'Prompts', tab: 'prompts' },
];

export function PublicTalkingPointsTabs({
  prompts,
  ressources,
  talkingPoints,
}: {
  prompts: React.ReactNode;
  ressources: React.ReactNode;
  talkingPoints: React.ReactNode;
}) {
  const [activeTab, setActiveTab] = useState<PublicTab>('talking-points');

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2 border-b border-surface-border">
        {TABS.map(({ label, tab }) => {
          const isActive = tab === activeTab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`-mb-px border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
                isActive
                  ? 'border-accent-red text-text-primary'
                  : 'border-transparent text-text-muted hover:text-text-primary'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {activeTab === 'talking-points' ? talkingPoints : null}
      {activeTab === 'ressources' ? ressources : null}
      {activeTab === 'prompts' ? prompts : null}
    </div>
  );
}
