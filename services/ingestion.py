import asyncio
import random
import uuid
from datetime import datetime, timezone
from models import CanonicalCivicEvent

# Base coordinates for downtown area
BASE_LAT = 40.7128
BASE_LNG = -74.0060

def generate_random_coords(radius=0.05):
    return [
        BASE_LNG + random.uniform(-radius, radius),
        BASE_LAT + random.uniform(-radius, radius)
    ]

def get_h3_mock(lng, lat):
    # Mocking H3 index by rounding coordinates
    return f"h3_8_{round(lng, 3)}_{round(lat, 3)}"

class MultiStreamSimulator:
    def __init__(self):
        self.running = False
        self.subscribers = []
        self.active_scenario = "normal"
        self.time_offset = 0 # For time travel replay

    def add_subscriber(self, queue: asyncio.Queue):
        self.subscribers.append(queue)

    def remove_subscriber(self, queue: asyncio.Queue):
        if queue in self.subscribers:
            self.subscribers.remove(queue)

    def set_scenario(self, scenario: str):
        self.active_scenario = scenario

    async def broadcast(self, event: CanonicalCivicEvent):
        for q in self.subscribers:
            await q.put(event)

    async def start(self):
        self.running = True
        asyncio.create_task(self._weather_loop())
        asyncio.create_task(self._transit_loop())
        asyncio.create_task(self._311_loop())
        asyncio.create_task(self._aqi_loop())

    def stop(self):
        self.running = False

    async def _weather_loop(self):
        while self.running:
            coords = [BASE_LNG, BASE_LAT]
            severity = 'low'
            category = 'clear'
            precip = 0
            wind = random.uniform(5, 15)
            
            if self.active_scenario == 'storm':
                severity = random.choice(['high', 'critical'])
                category = 'rain'
                precip = random.uniform(20, 50)
                wind = random.uniform(40, 80)
            
            event = CanonicalCivicEvent(
                eventId=str(uuid.uuid4()),
                sourceFeed='weather',
                timestamp=datetime.now(timezone.utc).isoformat(),
                coordinates=coords,
                h3Index=get_h3_mock(coords[0], coords[1]),
                category=category,
                severity=severity,
                rawMetrics={'precipitation': precip, 'windSpeed': wind},
                confidenceScore=1.0
            )
            await self.broadcast(event)
            await asyncio.sleep(random.uniform(5, 10))

    async def _transit_loop(self):
        while self.running:
            coords = generate_random_coords()
            severity = 'low'
            delay = random.uniform(0, 5)
            
            if self.active_scenario == 'storm':
                severity = random.choice(['medium', 'high'])
                delay = random.uniform(15, 60)
            
            event = CanonicalCivicEvent(
                eventId=str(uuid.uuid4()),
                sourceFeed='transit',
                timestamp=datetime.now(timezone.utc).isoformat(),
                coordinates=coords,
                h3Index=get_h3_mock(coords[0], coords[1]),
                category='bus_delay',
                severity=severity,
                rawMetrics={'delay_minutes': delay},
                confidenceScore=0.95
            )
            await self.broadcast(event)
            await asyncio.sleep(random.uniform(2, 6))

    async def _311_loop(self):
        while self.running:
            coords = generate_random_coords()
            category = random.choice(['noise', 'parking', 'street_light'])
            severity = 'low'
            
            if self.active_scenario == 'storm':
                category = random.choice(['flood', 'power_outage', 'fallen_tree'])
                severity = random.choice(['high', 'critical'])
                
            event = CanonicalCivicEvent(
                eventId=str(uuid.uuid4()),
                sourceFeed='311',
                timestamp=datetime.now(timezone.utc).isoformat(),
                coordinates=coords,
                h3Index=get_h3_mock(coords[0], coords[1]),
                category=category,
                severity=severity,
                rawMetrics={},
                confidenceScore=0.9
            )
            await self.broadcast(event)
            # 311 events happen less frequently normally, more frequently in storm
            sleep_time = random.uniform(1, 3) if self.active_scenario == 'storm' else random.uniform(10, 20)
            await asyncio.sleep(sleep_time)

    async def _aqi_loop(self):
        while self.running:
            coords = generate_random_coords()
            aqi_val = random.uniform(20, 50)
            severity = 'low'
            
            if self.active_scenario == 'smog':
                aqi_val = random.uniform(150, 300)
                severity = 'high' if aqi_val < 200 else 'critical'
                
            event = CanonicalCivicEvent(
                eventId=str(uuid.uuid4()),
                sourceFeed='aqi',
                timestamp=datetime.now(timezone.utc).isoformat(),
                coordinates=coords,
                h3Index=get_h3_mock(coords[0], coords[1]),
                category='air_quality',
                severity=severity,
                rawMetrics={'us_aqi': aqi_val},
                confidenceScore=0.98
            )
            await self.broadcast(event)
            await asyncio.sleep(random.uniform(8, 15))

simulator = MultiStreamSimulator()
