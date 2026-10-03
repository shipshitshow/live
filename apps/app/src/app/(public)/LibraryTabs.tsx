'use client';

import { Button } from '@shipshitshow/ui';
import { ArrowUpRight } from 'lucide-react';
import { type KeyboardEvent, type ReactNode, useRef, useState } from 'react';
import styles from './home.module.scss';

type LibraryTab = {
  allHref: string;
  allLabel: string;
  content: ReactNode;
  id: string;
  label: string;
};

export function LibraryTabs({ tabs }: { tabs: LibraryTab[] }) {
  const [selected, setSelected] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  function select(index: number) {
    setSelected(index);
    tabRefs.current[index]?.focus();
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const last = tabs.length - 1;
    const next: number | undefined = (
      {
        ArrowLeft: selected === 0 ? last : selected - 1,
        ArrowRight: selected === last ? 0 : selected + 1,
        End: last,
        Home: 0,
      } as Record<string, number>
    )[event.key];
    if (next === undefined) return;
    event.preventDefault();
    select(next);
  }

  return (
    <>
      <div
        aria-label="Library"
        className={styles.tabList}
        onKeyDown={onKeyDown}
        role="tablist"
      >
        {tabs.map((tab, index) => (
          <Button
            aria-controls={`library-panel-${tab.id}`}
            aria-selected={index === selected}
            className={styles.tab}
            id={`library-tab-${tab.id}`}
            key={tab.id}
            onClick={() => setSelected(index)}
            ref={(node) => {
              tabRefs.current[index] = node;
            }}
            role="tab"
            tabIndex={index === selected ? 0 : -1}
            type="button"
            variant="ghost"
          >
            {tab.label}
          </Button>
        ))}
      </div>
      {tabs.map((tab, index) => (
        <div
          aria-labelledby={`library-tab-${tab.id}`}
          hidden={index !== selected}
          id={`library-panel-${tab.id}`}
          key={tab.id}
          role="tabpanel"
        >
          {tab.content}
          <a className={styles.allLink} href={tab.allHref}>
            {tab.allLabel} <ArrowUpRight aria-hidden="true" size={18} />
          </a>
        </div>
      ))}
    </>
  );
}
