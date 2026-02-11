import os
from dotenv import load_dotenv

if os.path.exists(".env"):
    load_dotenv()

from fastapi import FastAPI, File, UploadFile
from pydantic import BaseModel
from typing import List
from fastapi.middleware.cors import CORSMiddleware
from inference_sdk import InferenceHTTPClient
import numpy as np
import cv2


# Workflows devem usar detect.roboflow.com (serverless retorna 405 para workflows)
client = InferenceHTTPClient(
    api_url="https://detect.roboflow.com",
    api_key=os.getenv("ROBOFLOW_API_KEY"),
)

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
    x: float
    y: float
    width: float
    height: float


detections_db = [
    {
        "label": "Safety Vest",
        "confidence": 0.95,
        "x": 0.1,
        "y": 0.1,
        "width": 0.1,
        "height": 0.1
    },
    {
        "label": "Big Googles",
        "confidence": 0.90,
        "x": 0.2,
        "y": 0.2,
        "width": 0.2,
        "height": 0.2
    },
    {
        "label": "Gloves",
        "confidence": 0.85,
        "x": 0.3,
        "y": 0.3,
        "width": 0.3,
        "height": 0.3
    }
]

@app.get("/detections", response_model=List[Detection])
async def get_detections():
    return detections_db


@app.post("/detections", status_code=201)
async def add_detection(detection: Detection):
    detections_db.append(detection.model_dump())
    return {"message": "Detection added successfully"}

@app.post("/upload", status_code=201)
async def upload_image(file: UploadFile = File(...)):
    image_bytes = await file.read()
    
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    result = client.run_workflow(
        workspace_name="training-qcpue",
        workflow_id="find-red-helmets",
        images={
            "image": img
        }
    )

    # 1. Log do conteúdo no servidor para depuração
    # Remove rle_mask counts from logging to prevent massive output
    if isinstance(result, list):
        for res_item in result:
            if "visualization" in res_item:
                del res_item["visualization"]

            if "predictions" in res_item:
                preds_data = res_item["predictions"]
                if isinstance(preds_data, dict) and "predictions" in preds_data:
                     for p in preds_data["predictions"]:
                         if "rle_mask" in p:
                             del p["rle_mask"]

    print("\n--- ROBOFLOW RESULT ---")
    print(result)
    print("-----------------------\n")

    # 2. Extrair predições e estender o nosso "DB" na memória
    # O formato costuma ser uma lista de resultados (um para cada imagem enviada)
    if result and len(result) > 0:
        # Acessa a lista de predições dentro do primeiro resultado
        predictions = result[0].get("predictions", {}).get("predictions", [])
        
        for pred in predictions:
            new_detection = {
                "label": pred.get("class"),
                "confidence": round(float(pred.get("confidence")), 2),
                "x": pred.get("x"),
                "y": pred.get("y"),
                "width": pred.get("width"),
                "height": pred.get("height")
            }
            detections_db.append(new_detection)
            print(f"Added to DB: {new_detection}")

    return {"message": "Processing complete", "result": result}