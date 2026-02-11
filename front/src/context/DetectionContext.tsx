import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import type { Detection } from '@/components/DetectionCard';

interface DetectionContextType {
  detections: Detection[];
  error: string | null;
  fetchDetections: () => Promise<void>;
  addDetection: (label: string) => Promise<void>;
}

const DetectionContext = createContext<DetectionContextType | undefined>(undefined);

export function DetectionProvider({ children }: { children: React.ReactNode }) {
  const [detections, setDetections] = useState<Detection[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchDetections = async () => {
    try {
      const response = await axios.get('http://localhost:8000/detections');
      setDetections(response.data);
    } catch {
      setError("Falha ao carregar detecções.");
    }
  };

  const addDetection = async (label: string) => {
    const newItem: Detection = { label, confidence: 1.0, x: 0, y: 0, width: 0, height: 0 };
    try {
      const response = await axios.post('http://localhost:8000/detections', newItem);
      if (response.status === 201) setDetections((prev) => [...prev, newItem]);
    } catch {
      setError("Erro ao adicionar manualmente.");
    }
  };

  useEffect(() => {
    fetchDetections();
  }, []);

  return (
    <DetectionContext.Provider value={{ detections, error, fetchDetections, addDetection }}>
      {children}
    </DetectionContext.Provider>
  );
}

export const useDetections = () => {
  const context = useContext(DetectionContext);
  if (!context) throw new Error("useDetections deve ser usado dentro de um DetectionProvider");
  return context;
};
