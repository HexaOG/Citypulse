import asyncio
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json
import sqlite3
import os

from services.ingestion import simulator
from services.fusion import fusion_engine
from services.narrative import narrative_gen

app = FastAPI(title="CityPulse API")

# -- Database Setup --
DB_FILE = "citypulse.db"

def init_db():
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS community_reports (
            id TEXT PRIMARY KEY,
            category TEXT,
            description TEXT,
            area TEXT,
            street TEXT,
            severity TEXT,
            timestamp TEXT,
            lat REAL,
            lng REAL,
            confirmations INTEGER,
            createdAtHoursAgo REAL
        )
    ''')
    
    # Check if DB is empty, seed with initial Jaipur data if so
    c.execute("SELECT COUNT(*) FROM community_reports")
    if c.fetchone()[0] == 0:
        initial_seeds = [
            ("CP-1082", "Power Outage", "Substation trip caused complete blackout across 4 residential blocks. Traffic signals inoperative.", "Malviya Nagar", "JLN Marg & Calgiri Road", "Critical", "8 mins ago", 26.8505, 75.8118, 19, 0.13),
            ("CP-1083", "Water Main Break", "Significant flooding on main avenue. Pressure dropped in adjacent apartment complexes.", "Pink City", "Moti Dungri & MI Road", "High", "24 mins ago", 26.9240, 75.8267, 42, 0.4),
            ("CP-1084", "Traffic Hazard", "Overturned delivery vehicle blocking two right lanes. EMS on scene.", "Vaishali Nagar", "Gandhi Path", "High", "45 mins ago", 26.9124, 75.7429, 8, 0.75),
            ("CP-1085", "Urban Hazard", "Scaffolding collapse at construction site. Structural team required for assessment.", "Mansarovar", "Madhyam Marg", "Medium", "1 hr ago", 26.8549, 75.7605, 11, 1.0)
        ]
        c.executemany('''
            INSERT INTO community_reports (id, category, description, area, street, severity, timestamp, lat, lng, confirmations, createdAtHoursAgo)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', initial_seeds)
        
    conn.commit()
    conn.close()

init_db()

active_websockets = []

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

class CommunityReportData(BaseModel):
    id: str
    category: str
    description: str
    area: str
    street: str
    severity: str
    timestamp: str
    coordinates: list[float]
    confirmations: int
    createdAtHoursAgo: float

@app.post("/api/scenario")
async def set_scenario(req: ScenarioRequest):
    simulator.set_scenario(req.scenario)
    return {"status": "success", "scenario": req.scenario}

@app.get("/api/reports")
def get_reports():
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute("SELECT id, category, description, area, street, severity, timestamp, lat, lng, confirmations, createdAtHoursAgo FROM community_reports ORDER BY ROWID DESC LIMIT 100")
    rows = c.fetchall()
    conn.close()
    
    reports = []
    for r in rows:
        reports.append({
            "id": r[0],
            "category": r[1],
            "description": r[2],
            "area": r[3],
            "street": r[4],
            "severity": r[5],
            "timestamp": r[6],
            "coordinates": [r[7], r[8]],
            "confirmations": r[9],
            "createdAtHoursAgo": r[10]
        })
    return {"status": "success", "data": reports}

@app.post("/api/reports")
async def create_report(report: CommunityReportData):
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute('''
        INSERT INTO community_reports (id, category, description, area, street, severity, timestamp, lat, lng, confirmations, createdAtHoursAgo)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (report.id, report.category, report.description, report.area, report.street, report.severity, report.timestamp, report.coordinates[0], report.coordinates[1], report.confirmations, report.createdAtHoursAgo))
    conn.commit()
    conn.close()
    
    # Broadcast new report to all WebSocket clients
    payload = {
        "type": "NEW_REPORT",
        "report": report.dict()
    }
    for ws in list(active_websockets):
        try:
            await ws.send_json(payload)
        except:
            active_websockets.remove(ws)
    
    return {"status": "success"}

@app.websocket("/ws/pulse")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    active_websockets.append(websocket)
    queue = asyncio.Queue()
    simulator.add_subscriber(queue)
    
    try:
        while True:
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
    except asyncio.TimeoutError:
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
        if websocket in active_websockets: active_websockets.remove(websocket)
    except Exception as e:
        print(f"WS Error: {e}")
        simulator.remove_subscriber(queue)
        if websocket in active_websockets: active_websockets.remove(websocket)
