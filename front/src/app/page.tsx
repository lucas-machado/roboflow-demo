"use client";

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

interface Detection {
  label: string;
  confidence: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

interface DetectionCardProps {
  data: Detection;
}

function DetectionCard({ data }: DetectionCardProps) {
  return (
    <div style={{ border: "1px solid #4A90E2", padding: "15px", borderRadius: "10px", margin: "10px" }}>
      <h3>Object: {data.label}</h3>
      <p>Confidence: {data.confidence}</p>
      {data.x !== undefined && data.y !== undefined && (
        <p>X: {data.x} Y: {data.y}</p>
      )}
      {data.width !== undefined && data.height !== undefined && (
        <p>Width: {data.width} Height: {data.height}</p>
      )}
    </div>
  )
}

export default function Home() {
  const [error, setError] = useState<string | null>(null);
  const [detections, setDetections] = useState<Detection[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDetections = async () => {
    try {
      const response = await axios.get('http://localhost:8000/detections');
      setDetections(response.data);
    } catch (error) {
      const message = (error as Error).message || 'An unknown error occurred';
      console.error('Error fetching detections:', message);
      setError(message);
    }
  }

  useEffect(() => {
    fetchDetections();
  }, [])

  const [newLabel, setNewLabel] = useState<string>("");

  const handleLabelChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewLabel(event.target.value);
  }

  const handleAdd = () => {
    const newItem: Detection = {
      label: newLabel,
      confidence: 1.0
    }

    const addDetection = async () => {
      try {
        const response = await axios.post('http://localhost:8000/detections', newItem);
        if (response.status === 201) {
          setDetections([...detections, newItem]);
          setNewLabel("");
        }
      } catch (error) {
        const message = (error as Error).message || 'An unknown error occurred';
        console.error('Error adding detection:', message);
        setError(message);
      }
    }

    addDetection();
  }

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(undefined);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length === 0) {
      return;
    }
    setSelectedFile(event.target.files?.[0] || null)
  }

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(undefined);
      return;
    }
    const url = URL.createObjectURL(selectedFile)
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [selectedFile]);

  const handleUpload = async () => {
    if (!selectedFile) { return; }

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await axios.post('http://localhost:8000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log("Server response:", response.data);

      if (response.status === 201) {
        fetchDetections();
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    } catch (error) {
      const message = (error as Error).message || 'An unknown error occurred';
      console.error('Error uploading file:', message);
      setError(message);
    }
  }

  return (
    <main style={{ 
      padding: "20px", 
      fontFamily: "sans-serif", 
      maxWidth: "800px", 
      margin: "0 auto", 
      display: "flex", 
      flexDirection: "column", 
      alignItems: "center" 
    }}>
      <h1 style={{ textAlign: "center" }}>Roboflow Training Lab</h1>

      {error && (
        <div style={{
          backgroundColor: "#fee2e2",
          color: "#b91c1c",
          padding: "10px",
          borderRadius: "5px",
          marginBottom: "20px",
          border: "1px solid #f87171",
          width: "100%"
        }}>
          <strong>⚠️ Error:</strong> {error}
        </div>
      )}

      <p style={{ width: "100%", textAlign: "left" }}>Active Detections: </p>
      
      <div style={{ width: "100%" }}>
        {detections.map((item, index) => (
          <DetectionCard key={index} data={item} />
        ))}
      </div>
      
      <div style={{ marginBottom: "20px", display: "flex", gap: "10px", marginTop: "20px" }}>
        <input 
          type="text"
          placeholder="Object name (e.g. Helmet)"
          value={newLabel}
          onChange={handleLabelChange}
          style={{ padding: "8px", borderRadius: "5px", border: "1px solid #ccc" }}
        />
        <button onClick={handleAdd}>Add Detection</button>
      </div>

      <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
        <input 
          ref={fileInputRef}
          type="file" 
          accept="image/*" 
          onChange={handleFileChange} 
        />

        {selectedFile && (
          <div style={{ 
            marginTop: "20px", 
            display: "flex", 
            flexDirection: "column", 
            alignItems: "center", 
            gap: "15px" 
          }}>
            <img 
              src={previewUrl} 
              alt="Selected file" 
              style={{ 
                maxWidth: "300px", 
                borderRadius: "10px", 
                boxShadow: "0 4px 8px rgba(0,0,0,0.2)" 
              }} 
            />
            <button onClick={handleUpload}>Upload File</button>
          </div>
        )}
      </div>
    </main>
  )
}
