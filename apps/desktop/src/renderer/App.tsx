import { useState } from 'react';
import { TerminalView } from './components/TerminalView';

type Tab = 'terminal' | 'topics';

export function App() {
  const [activeTab, setActiveTab] = useState<Tab>('terminal');

  return (
    <div style={{ background: '#0d0d0d', color: '#f0f0f0', fontFamily: 'system-ui', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <nav style={{ display: 'flex', gap: '1px', background: '#1a1a1a', padding: '8px 12px', borderBottom: '1px solid #2a2a2a' }}>
        <button
          type="button"
          onClick={() => setActiveTab('terminal')}
          style={{
            background: activeTab === 'terminal' ? '#ff2d20' : 'transparent',
            border: 'none',
            borderRadius: '6px',
            color: '#f0f0f0',
            cursor: 'pointer',
            fontSize: '13px',
            padding: '6px 14px',
          }}
        >
          Terminal
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('topics')}
          style={{
            background: activeTab === 'topics' ? '#ff2d20' : 'transparent',
            border: 'none',
            borderRadius: '6px',
            color: '#f0f0f0',
            cursor: 'pointer',
            fontSize: '13px',
            padding: '6px 14px',
          }}
        >
          Topics
        </button>
      </nav>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {activeTab === 'terminal' && <TerminalView />}
        {activeTab === 'topics' && (
          <div style={{ padding: '24px', color: '#a0a0a0' }}>
            Topics view — coming soon
          </div>
        )}
      </div>
    </div>
  );
}
