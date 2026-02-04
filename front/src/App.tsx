import './App.css'

interface Detection {
  label: string;
  confidence: number;
}

interface DetectionCardProps {
  data: Detection;
}

function DetectionCard({ data }: DetectionCardProps) {
  return (
    <div style={{ border: "1px solid #4A90E2", padding: "15px", borderRadius: "10px", margin: "10px" }}>
      <h3>Object: {data.label}</h3>
      <p>Confidence: {data.confidence}</p>
    </div>
  )
}

export default function App() {
  const detectionList: Detection[] = [
    {
      label: "Safety Vest",
      confidence: 0.95
    },
    {
      label: "Googles",
      confidence: 0.90
    },
    {
      label: "Gloves",
      confidence: 0.85
    }
  ]

  return (
    <main style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>Robloflow Training Lab</h1>
      <p>Active Detections: </p>
      
      <DetectionCard data={sampleDetection} />

    </main>
  )
}