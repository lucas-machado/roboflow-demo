import { useState, useRef } from 'react';
import DetectionCard from '@/components/DetectionCard';
import { useDetections } from '@/context/DetectionContext';
import { useFileUpload } from '@/hooks/useFileUpload';

export default function App() {
  const { detections, error, addDetection, fetchDetections } = useDetections();
  const { selectedFile, setSelectedFile, previewUrl, uploadFile } = useFileUpload(fetchDetections);

  const [newLabel, setNewLabel] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLabelChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewLabel(event.target.value);
  };

  const handleAddClick = async () => {
    if (!newLabel) return;
    await addDetection(newLabel);
    setNewLabel("");
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(event.target.files?.[0] ?? null);
  };

  const onUpload = async () => {
    const success = await uploadFile();
    if (success && fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <main
      style={{
        padding: "20px",
        fontFamily: "sans-serif",
        maxWidth: "800px",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <h1 style={{ textAlign: "center" }}>Roboflow Training Lab</h1>

      {error && (
        <div
          style={{
            backgroundColor: "#fee2e2",
            color: "#b91c1c",
            padding: "10px",
            borderRadius: "5px",
            marginBottom: "20px",
            border: "1px solid #f87171",
            width: "100%",
          }}
        >
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
        <button type="button" onClick={handleAddClick}>Add Detection</button>
      </div>

      <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
        />

        {selectedFile && (
          <div
            style={{
              marginTop: "20px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "15px",
            }}
          >
            <img
              src={previewUrl}
              alt="Selected file"
              style={{
                maxWidth: "300px",
                borderRadius: "10px",
                boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
              }}
            />
            <button type="button" onClick={onUpload}>Upload File</button>
          </div>
        )}
      </div>
    </main>
  );
}
