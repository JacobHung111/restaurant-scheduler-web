// src/stores/useUIStore.ts
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface UIState {
  // Modal and panel states
  isHistoryPanelOpen: boolean;
  isDragOverPage: boolean;
  
  // Loading states
  isImporting: boolean;
  isExporting: boolean;
  
  // UI preferences
  activeTab: number;
  sidebarCollapsed: boolean;
  
  // Actions
  setHistoryPanelOpen: (isOpen: boolean) => void;
  setDragOverPage: (isDragOver: boolean) => void;
  setImporting: (isImporting: boolean) => void;
  setExporting: (isExporting: boolean) => void;
  setActiveTab: (tabIndex: number) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  
  // Combined actions
  resetUIState: () => void;
}

const initialState = {
  isHistoryPanelOpen: false,
  isDragOverPage: false,
  isImporting: false,
  isExporting: false,
  activeTab: 0,
  sidebarCollapsed: false,
};

export const useUIStore = create<UIState>()(
  immer((set) => ({
    ...initialState,
    
    setHistoryPanelOpen: (isOpen) => {
      set((state) => {
        state.isHistoryPanelOpen = isOpen;
      });
    },
    
    setDragOverPage: (isDragOver) => {
      set((state) => {
        state.isDragOverPage = isDragOver;
      });
    },
    
    setImporting: (isImporting) => {
      set((state) => {
        state.isImporting = isImporting;
      });
    },
    
    setExporting: (isExporting) => {
      set((state) => {
        state.isExporting = isExporting;
      });
    },
    
    setActiveTab: (tabIndex) => {
      set((state) => {
        state.activeTab = tabIndex;
      });
    },
    
    setSidebarCollapsed: (collapsed) => {
      set((state) => {
        state.sidebarCollapsed = collapsed;
      });
    },
    
    resetUIState: () => {
      set(() => initialState);
    },
  }))
);