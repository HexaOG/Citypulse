from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime

class CanonicalCivicEvent(BaseModel):
    eventId: str
    sourceFeed: str # 'weather', 'transit', '311', 'aqi'
    timestamp: str
    coordinates: List[float] # [lng, lat]
    h3Index: str # simple string or hex id. We'll use a mocked grid ID or H3 if available
    category: str
    severity: str # 'low', 'medium', 'high', 'critical'
    rawMetrics: Dict[str, Any]
    confidenceScore: float

class DistrictHealthStatus(BaseModel):
    districtId: str
    chiScore: float
    domainScores: Dict[str, float]
    activeAnomalies: List[str]

class AnomalyCluster(BaseModel):
    clusterId: str
    title: str
    description: str
    confidence: float
    supportingEvents: List[CanonicalCivicEvent]
    zoneId: str

class AlertRule(BaseModel):
    ruleId: str
    metric: str
    threshold: float
    operator: str # '>', '<', '=='
    isActive: bool
