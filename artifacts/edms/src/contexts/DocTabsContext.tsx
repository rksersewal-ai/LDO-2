import React, { createContext, useContext, useState, useCallback } from 'react';
import { MOCK_DOCUMENTS } from '../lib/mock';

export interface TabDoc {
  id: string;
  name: string;
}

interface DocTabsContextValue {
  tabs: TabDoc[];
  openTab: (docId: string) => void;
  closeTab: (tabId: string) => void;
  clearTabs: () => void;
}

const DocTabsContext = createContext<DocTabsContextValue>({
  tabs: [],
  openTab: () => {},
  closeTab: () => {},
  clearTabs: () => {},
});

export function DocTabsProvider({ children }: { children: React.ReactNode }) {
  const [tabs, setTabs] = useState<TabDoc[]>([]);

  const openTab = useCallback((docId: string) => {
    setTabs(prev => {
      if (prev.find(t => t.id === docId)) return prev;
      const doc = MOCK_DOCUMENTS.find(d => d.id === docId);
      if (!doc) return prev;
      return [...prev, { id: docId, name: (doc as { name: string }).name }];
    });
  }, []);

  const closeTab = useCallback((tabId: string) => {
    setTabs(prev => prev.filter(t => t.id !== tabId));
  }, []);

  const clearTabs = useCallback(() => {
    setTabs([]);
  }, []);

  return (
    <DocTabsContext.Provider value={{ tabs, openTab, closeTab, clearTabs }}>
      {children}
    </DocTabsContext.Provider>
  );
}

export const useDocTabs = () => useContext(DocTabsContext);
