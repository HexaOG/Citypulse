import numpy as np
from collections import deque, defaultdict
from datetime import datetime, timezone
import math
from models import CanonicalCivicEvent, DistrictHealthStatus, AnomalyCluster

class CivicFusionEngine:
    def __init__(self):
        # Store events for a rolling window of 2 hours
        # In this simulation, we'll keep the last 500 events
        self.event_buffer = deque(maxlen=500)
        self.zone_counts = defaultdict(lambda: defaultdict(list)) # zone -> feed -> counts per minute
        
    def ingest_event(self, event: CanonicalCivicEvent):
        self.event_buffer.append(event)
        
        # Simple tracking for Z-score (mocked per minute buckets)
        minute_bucket = datetime.fromisoformat(event.timestamp).replace(second=0, microsecond=0).isoformat()
        # Ensure list structure
        if not self.zone_counts[event.h3Index][event.sourceFeed]:
            self.zone_counts[event.h3Index][event.sourceFeed] = [0] * 60 # last 60 mins mock
        # Just increment the latest (mocking real rolling window for demo)
        self.zone_counts[event.h3Index][event.sourceFeed][-1] += 1
        
    def calculate_chi(self) -> DistrictHealthStatus:
        # CHI = max(0, 100 - SUM(w_i * SeverityWeight_i * log(1 + Volume_i)) - AnomalyPenalty)
        weights = {'weather': 0.30, 'transit': 0.25, '311': 0.30, 'aqi': 0.15}
        sev_weights = {'low': 1.0, 'medium': 2.5, 'high': 5.0, 'critical': 10.0}
        
        domain_scores = {'weather': 100, 'transit': 100, '311': 100, 'aqi': 100}
        
        penalty_sum = 0
        volume_counts = defaultdict(lambda: defaultdict(int))
        
        for ev in self.event_buffer:
            volume_counts[ev.sourceFeed][ev.severity] += 1
            
        for feed, w in weights.items():
            feed_penalty = 0
            for sev, vol in volume_counts[feed].items():
                s_w = sev_weights.get(sev, 1.0)
                feed_penalty += w * s_w * math.log(1 + vol)
            
            penalty_sum += feed_penalty
            domain_scores[feed] = max(0, 100 - feed_penalty * 10) # rough mapping for domain specific
            
        # Detect Anomalies
        anomalies = self.detect_anomalies()
        anomaly_penalty = 15 if anomalies else 0
        
        chi = max(0.0, 100.0 - penalty_sum - anomaly_penalty)
        
        return DistrictHealthStatus(
            districtId="downtown-core",
            chiScore=round(chi, 1),
            domainScores={k: round(v, 1) for k, v in domain_scores.items()},
            activeAnomalies=[a.clusterId for a in anomalies]
        )

    def detect_anomalies(self) -> list[AnomalyCluster]:
        clusters = []
        # Very simplified Z-score for demo
        for zone, feeds in self.zone_counts.items():
            high_z_feeds = []
            for feed, counts in feeds.items():
                if len(counts) > 10:
                    current = counts[-1]
                    hist = counts[:-1]
                    mean = np.mean(hist)
                    std = np.std(hist)
                    z = (current - mean) / (std + 0.001)
                    if z > 2.5:
                        high_z_feeds.append(feed)
            
            if len(high_z_feeds) >= 2:
                # Get supporting events from buffer
                supporting = [e for e in self.event_buffer if e.h3Index == zone and e.sourceFeed in high_z_feeds][-5:]
                
                clusters.append(AnomalyCluster(
                    clusterId=f"anomaly-{zone}",
                    title="Compound Disruption Detected",
                    description=f"Multi-feed anomaly (Z>2.5) across {', '.join(high_z_feeds)}.",
                    confidence=89.5,
                    supportingEvents=supporting,
                    zoneId=zone
                ))
        return clusters

fusion_engine = CivicFusionEngine()
