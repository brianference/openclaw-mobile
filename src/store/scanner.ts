import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ScannedDocument {
  id: string;
  imageUri: string;
  extractedText: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  savedToBrain: boolean;
}

interface ScannerState {
  documents: ScannedDocument[];
  isLoading: boolean;
  currentScan: {
    imageUri: string | null;
    extractedText: string;
    isProcessing: boolean;
  };

  // Actions
  setCurrentScan: (imageUri: string | null, text?: string) => void;
  setProcessing: (isProcessing: boolean) => void;
  setExtractedText: (text: string) => void;
  saveDocument: (title: string, text: string, imageUri: string) => Promise<ScannedDocument>;
  updateDocument: (id: string, updates: Partial<ScannedDocument>) => void;
  deleteDocument: (id: string) => void;
  clearCurrentScan: () => void;
  markAsSavedToBrain: (id: string) => void;
  setSavedToBrain: (id: string) => void;
  getDocumentById: (id: string) => ScannedDocument | undefined;
}

export const useScannerStore = create<ScannerState>()(
  persist(
    (set, get) => ({
      documents: [],
      isLoading: false,
      currentScan: {
        imageUri: null,
        extractedText: '',
        isProcessing: false,
      },

      setCurrentScan: (imageUri, text = '') => {
        set({
          currentScan: {
            imageUri,
            extractedText: text,
            isProcessing: false,
          },
        });
      },

      setProcessing: (isProcessing) => {
        set((state) => ({
          currentScan: {
            ...state.currentScan,
            isProcessing,
          },
        }));
      },

      setExtractedText: (text) => {
        set((state) => ({
          currentScan: {
            ...state.currentScan,
            extractedText: text,
          },
        }));
      },

      saveDocument: async (title, text, imageUri) => {
        const now = new Date().toISOString();
        const newDoc: ScannedDocument = {
          id: `doc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          imageUri,
          extractedText: text,
          title: title || `Scan ${new Date().toLocaleDateString()}`,
          createdAt: now,
          updatedAt: now,
          savedToBrain: false,
        };

        set((state) => ({
          documents: [newDoc, ...state.documents],
        }));

        return newDoc;
      },

      updateDocument: (id, updates) => {
        set((state) => ({
          documents: state.documents.map((doc) =>
            doc.id === id
              ? { ...doc, ...updates, updatedAt: new Date().toISOString() }
              : doc
          ),
        }));
      },

      deleteDocument: (id) => {
        set((state) => ({
          documents: state.documents.filter((doc) => doc.id !== id),
        }));
      },

      clearCurrentScan: () => {
        set({
          currentScan: {
            imageUri: null,
            extractedText: '',
            isProcessing: false,
          },
        });
      },

      markAsSavedToBrain: (id) => {
        set((state) => ({
          documents: state.documents.map((doc) =>
            doc.id === id ? { ...doc, savedToBrain: true } : doc
          ),
        }));
      },

      setSavedToBrain: (id) => {
        get().markAsSavedToBrain(id);
      },

      getDocumentById: (id) => {
        return get().documents.find((doc) => doc.id === id);
      },
    }),
    {
      name: 'mobileclaw-scanner',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        documents: state.documents,
      }),
    }
  )
);
