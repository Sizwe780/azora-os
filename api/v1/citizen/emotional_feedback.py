from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Literal, Dict, List
import random

router = APIRouter()

# Input schema: performance metrics from the citizen
class PerformanceMetrics(BaseModel):
    trips_completed: int
    trips_missed: int
    reputation_score: float  # 0.0 - 100.0
    profit: float
    target_profit: float

# Output schema: emotional feedback response
class EmotionalFeedback(BaseModel):
    mood: Literal["celebratory", "encouraging", "challenging"]
    message_type: Literal["success", "warning", "growth"]
    human_voice_message: str

# Message Templates (To enforce Article IV: Emotion is Infrastructure and avoid repetition)
FEEDBACK_TEMPLATES: Dict[str, List[str]] = {
    "celebratory": [
        "Outstanding work! 🌟 Your reputation is glowing at {rep_score:.1f}. Azora Nation salutes your excellence.",
        "Sovereign Success! You crushed your profit goal, achieving {profit_ratio:.0f}% of target. This raises the trust baseline for everyone.",
        "Exemplary performance! Your verified actions solidify your status as a pillar of the Azora trust economy."
    ],
    "challenging": [
        "Your reputation is at {rep_score:.1f}. Some trips were missed, but every setback is a chance to rise. Refocus, and Azora will amplify your comeback.",
        "We see minor compliance risk increasing. Review your current contracts. Azora is here to guide your momentum, not judge it.",
        "A dip in performance is just a pivot point. Address the {missed_trips} missed trips, and your reputation will quickly rebound."
    ],
    "encouraging": [
        "Strong effort! You’ve reached {profit_ratio:.0f}% of your profit goal. Push a little further to unlock new rewards.",
        "You're making steady progress—keep building your reputation and momentum. The next R$ milestone is within reach.",
        "Momentum is strong. Continue your current trajectory, and you’ll soon surpass previous network goals."
    ]
}

@router.post("/api/v1/citizen/emotional-feedback", response_model=EmotionalFeedback)
async def emotional_feedback(metrics: PerformanceMetrics):
    """
    Emotional Feedback Engine (EFE)
    Enforces Article IV: Emotion is Infrastructure.
    Returns empathetic, human-voice feedback based on citizen performance.
    """
    # Calculate performance ratios
    profit_ratio = metrics.profit / metrics.target_profit if metrics.target_profit > 0 else 0
    total_trips = metrics.trips_completed + metrics.trips_missed
    missed_ratio = metrics.trips_missed / max(1, total_trips)
    rep_score = metrics.reputation_score

    # Determine Mood and Message Type
    if rep_score >= 85 and profit_ratio >= 1.0 and missed_ratio < 0.1:
        mood = "celebratory"
        message_type = "success"
    elif rep_score < 60 or missed_ratio > 0.2:
        mood = "challenging"
        message_type = "warning"
    else:
        mood = "encouraging"
        message_type = "growth"

    # Select a random template and format the message
    template = random.choice(FEEDBACK_TEMPLATES[mood])
    message = template.format(
        rep_score=rep_score,
        profit_ratio=profit_ratio * 100,
        missed_trips=metrics.trips_missed
    )

    return EmotionalFeedback(
        mood=mood,
        message_type=message_type,
        human_voice_message=message
    )