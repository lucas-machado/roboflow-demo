export interface Detection {
  label: string;
  confidence: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface DetectionCardProps {
  data: Detection;
}

export default function DetectionCard({ data }: DetectionCardProps) {
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
  );
}
