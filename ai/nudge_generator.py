from fastapi import FastAPI, Depends
from pydantic import BaseModel
from typing import List, Optional
import numpy as np
# from sklearn.cluster import KMeans # dependency
import datetime
import math

app = FastAPI()

class UserContext(BaseModel):
    user_id: str
    current_location: dict
    current_time: str
    day_of_week: int
    recent_locations: List[dict]
    user_patterns: dict
    nearby_matches: List[dict]

class NudgeResponse(BaseModel):
    nudge_type: str
    message: str
    subcopy: Optional[str]
    target_location: Optional[dict]
    priority: int  # 1-10, higher = more important

NUDGE_TEMPLATES = {
    'coffee_break': [
        ("☕ Kahve molası zamanı!", "{place_name}'de birkaç kişi var şu an"),
        ("☕ Bir kahve ne dersin?", "{place_name} şu an sakin"),
        ("☕ Kafein takviyesi?", "{place_name}'e yakınsın zaten"),
    ],
    'explore_nearby': [
        ("🧭 Çevreyi keşfet", "{place_name}'de hiç bulunmamışsın"),
        ("🧭 Yeni bir yer dene", "{place_name} yakında ve popüler"),
        ("🧭 Adım at", "{place_name} ilgini çekebilir"),
    ],
    'match_proximity': [
        ("💫 Birisi yakında", "Senin gibi düşünen biri {distance}m mesafede"),
        ("💫 İlginç bir tesadüf", "{count} uyumlu kişi yakında"),
        ("💫 Fırsat bu fırsat", "Tam senlik birisi {distance}m ötede"),
    ],
    'social_prompt': [
        ("🎭 Sosyalleşme zamanı", "{place_name}'de tanıdık atmosfer var"),
        ("🎭 Dışarı çık", "Hava güzel, insanlar dışarıda"),
    ],
    'question': [
        ("🤔 Sana soru", "Hangi müzik türünü seversin?"),
        ("🤔 Merak ettik", "{location}'deyken genelde ne yaparsın?"),
    ]
}

@app.post("/generate-nudge")
async def generate_nudge(context: UserContext) -> Optional[NudgeResponse]:
    """
    AI-powered nudge generation based on:
    1. User's current context (location, time, patterns)
    2. Nearby compatible matches
    3. Behavioral patterns
    4. External factors (weather, events, etc.)
    """
    
    # Priority 1: If high-score match is very close (< 200m)
    if context.nearby_matches:
        # Sort by distance
        closest_match = min(context.nearby_matches, key=lambda m: m.get('distance_meters', 9999))
        
        if closest_match.get('distance_meters', 9999) < 200 and closest_match.get('match_score', 0) > 0.7:
            template = NUDGE_TEMPLATES['match_proximity'][0] # Mock random choice
            return NudgeResponse(
                nudge_type='match_proximity',
                message=template[0],
                subcopy=template[1].format(
                    distance=int(closest_match['distance_meters']),
                    count=len(context.nearby_matches)
                ),
                target_location=None,
                priority=10
            )
    
    # Priority 2: If user is stationary for >30min, suggest movement
    if is_user_stationary(context.recent_locations, minutes=30):
        # Find nearby popular spot
        popular_spot = find_nearby_popular_spot(
            context.current_location,
            context.day_of_week,
            # Parse ISO time
            datetime.datetime.fromisoformat(context.current_time.replace('Z', '+00:00')).hour
        )
        
        if popular_spot:
            template = NUDGE_TEMPLATES['coffee_break'][0]
            return NudgeResponse(
                nudge_type='coffee_break',
                message=template[0],
                subcopy=template[1].format(place_name=popular_spot['name']),
                target_location=popular_spot['coordinates'],
                priority=7
            )
    
    # Priority 3: If user has never been to nearby popular spot
    unexplored_spots = find_unexplored_nearby_spots(
        context.user_id,
        context.current_location
    )
    
    if unexplored_spots:
        spot = unexplored_spots[0]
        template = NUDGE_TEMPLATES['explore_nearby'][0]
        return NudgeResponse(
            nudge_type='explore_nearby',
            message=template[0],
            subcopy=template[1].format(place_name=spot['name']),
            target_location=spot['coordinates'],
            priority=5
        )
    
    # Priority 4: Data collection question
    if should_ask_question(context.user_id):
        template = NUDGE_TEMPLATES['question'][0]
        return NudgeResponse(
            nudge_type='question',
            message=template[0],
            subcopy=template[1].format(location=context.current_location.get('place_name', 'burada')),
            target_location=None,
            priority=3
        )
    
    # Default: No nudge
    return None

def is_user_stationary(recent_locations: List[dict], minutes: int) -> bool:
    """Check if user hasn't moved significantly in X minutes"""
    if len(recent_locations) < 2:
        return False
    
    latest = recent_locations[0]
    threshold_time = datetime.datetime.now() - datetime.timedelta(minutes=minutes)
    
    for loc in recent_locations[1:]:
        loc_time = datetime.datetime.fromisoformat(loc['timestamp'].replace('Z', '+00:00'))
        # Note: simplistic time check, real app would standardise TZs
        
        distance = calculate_haversine_distance(
            latest['latitude'], latest['longitude'],
            loc['latitude'], loc['longitude']
        )
        
        if distance > 100:  # Moved more than 100m
            return False
    
    return True

def find_nearby_popular_spot(location: dict, day_of_week: int, hour: int):
    """Query heat_maps table for popular spots nearby"""
    # Placeholder implementation
    return {
        'name': 'Narr Cafe',
        'coordinates': {'lat': 40.9876, 'lng': 29.1234}
    }

def find_unexplored_nearby_spots(user_id: str, location: dict):
    """Find places user hasn't visited that are popular"""
    return []

def should_ask_question(user_id: str) -> bool:
    """Rate limit questions: max 2 per day"""
    return False

def calculate_haversine_distance(lat1, lon1, lat2, lon2):
    """Calculate distance between two coordinates"""
    R = 6371000  # Earth radius in meters
    
    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    
    a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    
    return R * c
