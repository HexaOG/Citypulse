import asyncio
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json

from services.ingestion import simulator
from services.fusion import fusion_engine
from services.narrative import narrative_gen

app = FastAPI(title="CityPulse API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    await simulator.start()

@app.on_event("shutdown")
def shutdown_event():
    simulator.stop()

class ScenarioRequest(BaseModel):
    scenario: str

@app.post("/api/scenario")
async def set_scenario(req: ScenarioRequest):
    simulator.set_scenario(req.scenario)
    return {"status": "success", "scenario": req.scenario}

@app.websocket("/ws/pulse")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    queue = asyncio.Queue()
    simulator.add_subscriber(queue)
    
    try:
        while True:
            try:
                # Send latest CHI state every 2 seconds
                event = await asyncio.wait_for(queue.get(), timeout=2.0)
                fusion_engine.ingest_event(event)
                
                # Recalculate
                status = fusion_engine.calculate_chi()
                narrative = narrative_gen.generate(status)
                anomalies = [a.dict() for a in fusion_engine.detect_anomalies()]
                
                payload = {
                    "type": "PULSE_UPDATE",
                    "event": event.dict(),
                    "status": status.dict(),
                    "narrative": narrative,
                    "anomalies": anomalies
                }
                await websocket.send_json(payload)
            except (asyncio.TimeoutError, TimeoutError):
                # Keep alive / periodic update even if no events
                status = fusion_engine.calculate_chi()
                narrative = narrative_gen.generate(status)
                anomalies = [a.dict() for a in fusion_engine.detect_anomalies()]
                payload = {
                    "type": "PULSE_UPDATE",
                    "status": status.dict(),
                    "narrative": narrative,
                    "anomalies": anomalies
                }
                await websocket.send_json(payload)
    except WebSocketDisconnect:
        simulator.remove_subscriber(queue)
    except Exception as e:
        print(f"WS Error: {e}")
        simulator.remove_subscriber(queue)

