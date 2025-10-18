import os
import json
import time
import numpy as np
import pandas as pd
from datetime import datetime
from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import httpx
import logging
import asyncio
from sklearn.ensemble import IsolationForest
from sklearn.cluster import DBSCAN
import joblib
import uvicorn
import os

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Azora AI Spotter",
    description="Advanced AI system for spotting patterns and anomalies in financial transactions",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Environment variables
COMPLIANCE_URL = os.environ.get("COMPLIANCE_URL", "http://localhost:4095")
MODEL_DIR = os.environ.get("MODEL_DIR", "/workspaces/azora-os/data/models")
DATA_DIR = os.environ.get("DATA_DIR", "/workspaces/azora-os/data/ai")

# Ensure directories exist
os.makedirs(MODEL_DIR, exist_ok=True)
os.makedirs(DATA_DIR, exist_ok=True)

# Models
anomaly_model = None
clustering_model = None

# Pydantic models
class Transaction(BaseModel):
    id: str
    amount: float
    sender: str
    recipient: str
    timestamp: str
    currency: str
    country: str
    category: Optional[str] = None
    risk_score: Optional[float] = None
    features: Optional[Dict[str, float]] = None

class TransactionBatch(BaseModel):
    transactions: List[Transaction]
    analyze: bool = True

class AnomalyResult(BaseModel):
    transaction_id: str
    is_anomaly: bool
    anomaly_score: float
    risk_level: str
    features_contribution: Optional[Dict[str, float]] = None

class AnomalyResponse(BaseModel):
    results: List[AnomalyResult]
    batch_id: str
    processing_time: float
    model_version: str
    anomalies_found: int

class PatternGroup(BaseModel):
    group_id: int
    transactions: List[str]
    centroid: Dict[str, float]
    density: float
    risk_score: float

class PatternResponse(BaseModel):
    groups: List[PatternGroup]
    total_groups: int
    processing_time: float
    model_version: str

class ModelTrainingRequest(BaseModel):
    data_source: str
    parameters: Dict[str, Any]
    model_type: str = "anomaly_detection"

class ModelTrainingResponse(BaseModel):
    job_id: str
    status: str
    model_type: str
    estimated_completion: str

# Initialize models on startup
@app.on_event("startup")
async def initialize_models():
    global anomaly_model, clustering_model
    
    try:
        # Try to load existing models
        anomaly_model_path = os.path.join(MODEL_DIR, "anomaly_model.joblib")
        clustering_model_path = os.path.join(MODEL_DIR, "clustering_model.joblib")
        
        if os.path.exists(anomaly_model_path):
            anomaly_model = joblib.load(anomaly_model_path)
            logger.info("Loaded existing anomaly detection model")
        else:
            # Create a default model
            anomaly_model = IsolationForest(
                n_estimators=100, 
                max_samples='auto', 
                contamination=0.01, 
                random_state=42
            )
            logger.info("Created new anomaly detection model")
        
        if os.path.exists(clustering_model_path):
            clustering_model = joblib.load(clustering_model_path)
            logger.info("Loaded existing clustering model")
        else:
            # Create a default model
            clustering_model = DBSCAN(
                eps=0.5,
                min_samples=5,
                metric='euclidean'
            )
            logger.info("Created new clustering model")
            
    except Exception as e:
        logger.error(f"Error initializing models: {e}")

# Helper functions
def extract_features(transaction: Transaction) -> np.ndarray:
    """Extract numerical features from transaction"""
    features = []
    
    # Use provided features if available
    if transaction.features:
        return np.array(list(transaction.features.values()))
    
    # Basic features
    features.append(transaction.amount)
    features.append(datetime.fromisoformat(transaction.timestamp.replace('Z', '+00:00')).hour)
    features.append(float(hash(transaction.sender) % 1000) / 1000)
    features.append(float(hash(transaction.recipient) % 1000) / 1000)
    
    # Add more feature engineering here in production
    
    return np.array(features)

def calculate_risk_level(score: float) -> str:
    """Convert anomaly score to risk level"""
    if score < -0.7:
        return "critical"
    elif score < -0.5:
        return "high"
    elif score < -0.3:
        return "medium"
    elif score < -0.1:
        return "low"
    else:
        return "normal"

async def log_to_compliance(action: str, data: Dict[str, Any]):
    """Log events to compliance service"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{COMPLIANCE_URL}/api/log",
                json={
                    "service": "azora-ai-spotter",
                    "action": action,
                    "timestamp": datetime.now().isoformat(),
                    "data": data
                },
                timeout=5.0
            )
            return response.status_code == 200
    except Exception as e:
        logger.error(f"Failed to log to compliance: {e}")
        return False

# API Endpoints
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "azora-ai-spotter",
        "models": {
            "anomaly_detection": anomaly_model is not None,
            "clustering": clustering_model is not None
        },
        "version": "1.0.0"
    }

@app.post("/api/analyze/anomalies", response_model=AnomalyResponse)
async def detect_anomalies(batch: TransactionBatch, background_tasks: BackgroundTasks):
    if not anomaly_model:
        raise HTTPException(status_code=503, detail="Anomaly detection model not available")
    
    start_time = time.time()
    batch_id = f"batch-{int(time.time())}"
    
    try:
        # Extract features from transactions
        feature_matrix = np.array([extract_features(tx) for tx in batch.transactions])
        
        # Get anomaly scores (-1 to 1, lower is more anomalous)
        scores = anomaly_model.decision_function(feature_matrix)
        
        results = []
        anomalies_count = 0
        
        for i, tx in enumerate(batch.transactions):
            is_anomaly = scores[i] < 0
            if is_anomaly:
                anomalies_count += 1
            
            results.append(AnomalyResult(
                transaction_id=tx.id,
                is_anomaly=is_anomaly,
                anomaly_score=float(scores[i]),
                risk_level=calculate_risk_level(scores[i]),
                features_contribution=None  # Feature importance would be added in production
            ))
        
        # Log anomalies to compliance in background
        if anomalies_count > 0:
            background_tasks.add_task(
                log_to_compliance,
                "anomaly.detected",
                {
                    "batch_id": batch_id,
                    "anomalies": anomalies_count,
                    "total_transactions": len(batch.transactions)
                }
            )
        
        return AnomalyResponse(
            results=results,
            batch_id=batch_id,
            processing_time=time.time() - start_time,
            model_version="1.0.0",
            anomalies_found=anomalies_count
        )
        
    except Exception as e:
        logger.error(f"Error detecting anomalies: {e}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.post("/api/analyze/patterns", response_model=PatternResponse)
async def find_patterns(batch: TransactionBatch):
    if not clustering_model:
        raise HTTPException(status_code=503, detail="Clustering model not available")
    
    start_time = time.time()
    
    try:
        # Extract features from transactions
        feature_matrix = np.array([extract_features(tx) for tx in batch.transactions])
        
        # Apply clustering
        labels = clustering_model.fit_predict(feature_matrix)
        
        # Organize transactions by cluster
        clusters = {}
        for i, label in enumerate(labels):
            if label == -1:  # DBSCAN noise
                continue
                
            if label not in clusters:
                clusters[label] = []
            clusters[label].append(i)
        
        # Build response
        groups = []
        for group_id, indices in clusters.items():
            if len(indices) < 2:  # Skip single-transaction clusters
                continue
                
            # Calculate centroid
            centroid_features = feature_matrix[indices].mean(axis=0)
            centroid = {f"feature_{i}": float(val) for i, val in enumerate(centroid_features)}
            
            # Calculate density (average distance to centroid)
            distances = np.linalg.norm(feature_matrix[indices] - centroid_features, axis=1)
            density = float(np.mean(distances))
            
            # Calculate risk score based on cluster properties
            risk_score = 0.0
            if len(indices) > 20:  # Large clusters might be suspicious
                risk_score += 0.2
            if density < 0.1:  # Very tight clusters might be suspicious
                risk_score += 0.3
                
            groups.append(PatternGroup(
                group_id=int(group_id),
                transactions=[batch.transactions[i].id for i in indices],
                centroid=centroid,
                density=density,
                risk_score=risk_score
            ))
        
        return PatternResponse(
            groups=groups,
            total_groups=len(groups),
            processing_time=time.time() - start_time,
            model_version="1.0.0"
        )
        
    except Exception as e:
        logger.error(f"Error finding patterns: {e}")
        raise HTTPException(status_code=500, detail=f"Pattern analysis failed: {str(e)}")

@app.post("/api/models/train", response_model=ModelTrainingResponse)
async def train_model(request: ModelTrainingRequest, background_tasks: BackgroundTasks):
    """Start asynchronous model training"""
    job_id = f"training-{int(time.time())}"
    
    # In production, this would launch a proper training job
    # Here we just simulate it
    background_tasks.add_task(
        simulate_model_training,
        job_id,
        request.model_type,
        request.parameters
    )
    
    return ModelTrainingResponse(
        job_id=job_id,
        status="started",
        model_type=request.model_type,
        estimated_completion=(
            datetime.now().timestamp() + 300
        ).__str__()
    )

async def simulate_model_training(job_id: str, model_type: str, parameters: Dict[str, Any]):
    """Simulate a model training job"""
    logger.info(f"Started training job {job_id} for {model_type}")
    
    # Simulate training time
    await asyncio.sleep(5)
    
    try:
        if model_type == "anomaly_detection":
            global anomaly_model
            
            # Create a new model with the specified parameters
            contamination = parameters.get("contamination", 0.01)
            n_estimators = parameters.get("n_estimators", 100)
            
            new_model = IsolationForest(
                n_estimators=n_estimators,
                contamination=contamination,
                random_state=42
            )
            
            # In production, you'd fit the model on actual data here
            # For now, we'll just save the initialized model
            anomaly_model = new_model
            joblib.dump(anomaly_model, os.path.join(MODEL_DIR, "anomaly_model.joblib"))
            
        elif model_type == "clustering":
            global clustering_model
            
            eps = parameters.get("eps", 0.5)
            min_samples = parameters.get("min_samples", 5)
            
            new_model = DBSCAN(
                eps=eps,
                min_samples=min_samples
            )
            
            clustering_model = new_model
            joblib.dump(clustering_model, os.path.join(MODEL_DIR, "clustering_model.joblib"))
        
        logger.info(f"Completed training job {job_id}")
        
        # Log to compliance
        await log_to_compliance(
            "model.trained",
            {
                "job_id": job_id,
                "model_type": model_type,
                "parameters": parameters
            }
        )
        
    except Exception as e:
        logger.error(f"Error in training job {job_id}: {e}")

@app.get("/api/models/status/{job_id}")
async def get_training_status(job_id: str):
    """Check status of a training job"""
    # In production, you would check actual job status
    # Here we just simulate completion
    
    if not job_id.startswith("training-"):
        raise HTTPException(status_code=400, detail="Invalid job ID format")
    
    job_timestamp = int(job_id.split("-")[1])
    current_time = int(time.time())
    
    if current_time - job_timestamp < 10:
        status = "running"
        progress = min(100, (current_time - job_timestamp) * 10)
    else:
        status = "completed"
        progress = 100
    
    return {
        "job_id": job_id,
        "status": status,
        "progress": progress,
        "start_time": datetime.fromtimestamp(job_timestamp).isoformat(),
        "estimated_completion": datetime.fromtimestamp(job_timestamp + 10).isoformat()
    }

# Start server when run directly
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 4097))
    uvicorn.run("spotter:app", host="0.0.0.0", port=port, reload=True)