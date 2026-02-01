import numpy as np
# from sklearn.metrics.pairwise import cosine_similarity
from typing import List, Dict

class CompatibilityMatcher:
    def __init__(self):
        self.weights = {
            'location_overlap': 0.25,
            'temporal_overlap': 0.20,
            'interest_similarity': 0.30,
            'behavioral_similarity': 0.15,
            'demographic_fit': 0.10
        }
    
    def calculate_match_score(self, user1: Dict, user2: Dict) -> float:
        """
        Calculate compatibility score (0-1) between two users
        """
        scores = {
            'location_overlap': self._location_similarity(user1, user2),
            'temporal_overlap': self._temporal_similarity(user1, user2),
            'interest_similarity': self._interest_similarity(user1, user2),
            'behavioral_similarity': self._behavioral_similarity(user1, user2),
            'demographic_fit': self._demographic_fit(user1, user2)
        }
        
        # Weighted average
        total_score = sum(
            scores[key] * self.weights[key] 
            for key in scores
        )
        
        return round(total_score, 3)
    
    def _location_similarity(self, user1: Dict, user2: Dict) -> float:
        """
        How much do their location patterns overlap?
        """
        patterns1 = user1.get('location_patterns', {}).get('favorite_spots', [])
        patterns2 = user2.get('location_patterns', {}).get('favorite_spots', [])
        
        if not patterns1 or not patterns2:
            return 0.5  # Neutral score if no data
        
        # Extract place names
        places1 = set(p['place_name'] for p in patterns1)
        places2 = set(p['place_name'] for p in patterns2)
        
        # Jaccard similarity
        intersection = len(places1 & places2)
        union = len(places1 | places2)
        
        return intersection / union if union > 0 else 0
    
    def _temporal_similarity(self, user1: Dict, user2: Dict) -> float:
        """
        Do they visit places at similar times?
        """
        patterns1 = user1.get('location_patterns', {}).get('favorite_spots', [])
        patterns2 = user2.get('location_patterns', {}).get('favorite_spots', [])
        
        if not patterns1 or not patterns2:
            return 0.5
        
        # Compare typical hours for shared places
        shared_places = set(p['place_name'] for p in patterns1) & \
                       set(p['place_name'] for p in patterns2)
        
        if not shared_places:
            return 0.3
        
        hour_diffs = []
        for place in shared_places:
            hour1 = next((p['typical_hour'] for p in patterns1 if p['place_name'] == place), None)
            hour2 = next((p['typical_hour'] for p in patterns2 if p['place_name'] == place), None)
            
            if hour1 and hour2:
                # Circular difference (hour 23 vs 1 = 2 hour diff, not 22)
                diff = min(abs(hour1 - hour2), 24 - abs(hour1 - hour2))
                hour_diffs.append(diff)
        
        if not hour_diffs:
            return 0.5
        
        avg_diff = np.mean(hour_diffs)
        # Score: 0 hour diff = 1.0, 12 hour diff = 0.0
        return max(0, 1 - (avg_diff / 12))
    
    def _interest_similarity(self, user1: Dict, user2: Dict) -> float:
        """
        Cosine similarity of interest vectors
        """
        interests1 = set(user1.get('interests', []))
        interests2 = set(user2.get('interests', []))
        
        if not interests1 or not interests2:
            return 0.5
        
        # Jaccard for simplicity (could use word embeddings for semantic similarity)
        intersection = len(interests1 & interests2)
        union = len(interests1 | interests2)
        
        return intersection / union if union > 0 else 0
    
    def _behavioral_similarity(self, user1: Dict, user2: Dict) -> float:
        """
        Are they similar types of people?
        """
        behavior1 = user1.get('behavioral_metrics', {})
        behavior2 = user2.get('behavioral_metrics', {})
        
        if not behavior1 or not behavior2:
            return 0.5
        
        # Normalize metrics and compare
        metrics = ['app_opens_per_day', 'nudge_response_rate', 'avg_session_minutes']
        
        similarities = []
        for metric in metrics:
            val1 = behavior1.get(metric, 0)
            val2 = behavior2.get(metric, 0)
            
            if val1 == 0 and val2 == 0:
                similarities.append(1.0)
            else:
                # Inverse of percent difference
                similarities.append(1 - abs(val1 - val2) / max(val1, val2, 1))
        
        if not similarities:
            return 0.5

        return np.mean(similarities)
    
    def _demographic_fit(self, user1: Dict, user2: Dict) -> float:
        """
        Age compatibility, gender preferences, etc.
        """
        age1 = user1.get('age', 25)
        age2 = user2.get('age', 25)
        
        # Assume preference for similar age (+/- 5 years)
        age_diff = abs(age1 - age2)
        age_score = max(0, 1 - (age_diff / 20))
        
        return age_score
