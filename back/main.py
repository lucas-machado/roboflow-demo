from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class Detection(BaseModel):
    label: str
    confidence: float


detections_db = [
    {
        "label": "Safety Vest",
        "confidence": 0.95
    },
    {
        "label": "Big Googles",
        "confidence": 0.90
    },
    {
        "label": "Gloves",
        "confidence": 0.85
    }
]

@app.get("/detections", response_model=List[Detection])
async def get_detections():
    return detections_db


@app.post("/detections", status_code=201)
async def add_detection(detection: Detection):
    detections_db.append(detection.model_dump())
    return {"message": "Detection added successfully"}