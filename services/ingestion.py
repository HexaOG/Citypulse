import asyncio
import random
import uuid
import json
import urllib.request
from datetime import datetime, timezone
from models import CanonicalCivicEvent

# Base coordinates for downtown area (Jaipur, India)
BASE_LAT = 26.9124
BASE_LNG = 75.7873

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
        last_fetch = 0
        cached_wx = None
        while self.running:
            coords = [BASE_LNG, BASE_LAT]
            severity = 'low'
            category = 'clear'
            precip = 0
            wind = random.uniform(5, 15)
            temp = 20
            
            if self.active_scenario == 'storm':
                severity = random.choice(['high', 'critical'])
                category = 'rain'
                precip = random.uniform(20, 50)
                wind = random.uniform(40, 80)
            else:
                now = datetime.now().timestamp()
                if now - last_fetch > 60:
                    try:
                        def get_wx():
                            url = f"https://api.open-meteo.com/v1/forecast?latitude={BASE_LAT}&longitude={BASE_LNG}&current=temperature_2m,precipitation,wind_speed_10m,weather_code"
                            req = urllib.request.Request(url, headers={'User-Agent': 'CityPulse/1.0'})
                            with urllib.request.urlopen(req, timeout=5) as r:
                                return json.loads(r.read())
                        data = await asyncio.to_thread(get_wx)
                        cached_wx = data.get("current", {})
                        last_fetch = now
                    except Exception as e:
                        print(f"Weather fetch error: {e}")
                
                if cached_wx:
                    precip = cached_wx.get("precipitation", 0)
                    wind = cached_wx.get("wind_speed_10m", 0)
                    temp = cached_wx.get("temperature_2m", 20)
                    wmo_code = cached_wx.get("weather_code", 0)
                    
                    if wmo_code == 0: category = 'Sunny'
                    elif wmo_code in [1, 2]: category = 'Partly Cloudy'
                    elif wmo_code == 3: category = 'Overcast'
                    elif wmo_code in [45, 48]: category = 'Foggy'
                    elif 50 <= wmo_code <= 69 or 80 <= wmo_code <= 82: category = 'Rainy'
                    elif 70 <= wmo_code <= 79 or 85 <= wmo_code <= 86: category = 'Snowy'
                    elif wmo_code >= 95: category = 'Thunderstorm'
                    else: category = 'Clear'
                    
                    severity = 'low'
                    if precip > 5 or wind > 30: severity = 'medium'
                    if precip > 20 or wind > 50 or wmo_code >= 95: severity = 'high'
            
            event = CanonicalCivicEvent(
                eventId=str(uuid.uuid4()),
                sourceFeed='weather',
                timestamp=datetime.now(timezone.utc).isoformat(),
                coordinates=coords,
                h3Index=get_h3_mock(coords[0], coords[1]),
                category=category,
                severity=severity,
                rawMetrics={'temperature': temp, 'precipitation': precip, 'windSpeed': wind},
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
        last_fetch = 0
        cached_aqi = None
        while self.running:
            coords = generate_random_coords()
            aqi_val = random.uniform(20, 50)
            severity = 'low'
            
            if self.active_scenario == 'smog':
                aqi_val = random.uniform(150, 300)
                severity = 'high' if aqi_val < 200 else 'critical'
            else:
                now = datetime.now().timestamp()
                if now - last_fetch > 60:
                    try:
                        def get_aqi():
                            url = f"https://air-quality-api.open-meteo.com/v1/air-quality?latitude={BASE_LAT}&longitude={BASE_LNG}&current=us_aqi"
                            req = urllib.request.Request(url, headers={'User-Agent': 'CityPulse/1.0'})
                            with urllib.request.urlopen(req, timeout=5) as r:
                                return json.loads(r.read())
                        data = await asyncio.to_thread(get_aqi)
                        current = data.get("current", {})
                        cached_aqi = current.get("us_aqi", None)
                        last_fetch = now
                    except Exception as e:
                        print(f"AQI fetch error: {e}")
                
                if cached_aqi is not None:
                    aqi_val = cached_aqi + random.uniform(-2, 2)
                    if aqi_val > 150: severity = 'high'
                    elif aqi_val > 100: severity = 'medium'
                
            event = CanonicalCivicEvent(
                eventId=str(uuid.uuid4()),
                sourceFeed='aqi',
                timestamp=datetime.now(timezone.utc).isoformat(),
                coordinates=coords,
                h3Index=get_h3_mock(coords[0], coords[1]),
                category='air_quality',
                severity=severity,
                rawMetrics={'us_aqi': round(aqi_val, 1)},
                confidenceScore=0.98
            )
            await self.broadcast(event)
            await asyncio.sleep(random.uniform(8, 15))

simulator = MultiStreamSimulator()
