"""
Predictor Module - Handles ML model predictions

This module loads the trained model once and provides prediction functions.
The model is loaded at module import time, not per request.
"""

import pickle
from pathlib import Path
from typing import Any, Callable, Dict

import pandas as pd

# Get model path
MODEL_DIR = Path(__file__).parent
MODEL_PATH = MODEL_DIR / "model.pkl"

# Global variable to store loaded model artifacts
_model_artifacts = None


def load_model_artifacts():
    """Load the trained model and preprocessing artifacts once."""
    global _model_artifacts
    
    if _model_artifacts is None:
        if not MODEL_PATH.exists():
            raise FileNotFoundError(
                f"Model file not found at {MODEL_PATH}. "
                "Please run train_model.py first to train the model."
            )
        
        with open(MODEL_PATH, 'rb') as f:
            _model_artifacts = pickle.load(f)
        
        print("✓ Model loaded successfully!")
        print(f"✓ Features: {_model_artifacts['feature_columns']}")
    
    return _model_artifacts


def real_estate_predict(features: Dict[str, Any]) -> Dict[str, Any]:
    """
    Predict real estate price for Navi Mumbai properties.
    
    Input features expected:
    - location: str (Vashi, Nerul, Kharghar, Panvel)
    - area: float (square feet)
    - bhk: int (number of bedrooms)
    - bathrooms: int
    - age: int (years)
    - parking: int or bool (1/True for yes, 0/False for no)
    
    Returns:
    - predicted_price: float (INR)
    - price_per_sqft: float (INR)
    - market_status: str (Below Market / Average / Above Market)
    """
    
    # Load model artifacts (only once, cached globally)
    artifacts = load_model_artifacts()
    model = artifacts['model']
    scaler = artifacts['scaler']
    feature_columns = artifacts['feature_columns']
    location_columns = artifacts['location_columns']
    market_stats = artifacts['market_stats']
    
    # Extract input features
    location = features.get('location', '').strip()
    area = float(features.get('area', 0))
    bhk = int(features.get('bhk', 0))
    bathrooms = int(features.get('bathrooms', 0))
    age = int(features.get('age', 0))
    parking = int(features.get('parking', 0))
    
    # Validate inputs
    if not location:
        raise ValueError("Location is required")
    if area <= 0:
        raise ValueError("Area must be greater than 0")
    if bhk <= 0:
        raise ValueError("BHK must be greater than 0")
    
    # Create a dataframe with the input (same structure as training data)
    input_data = {
        'Area': [area],
        'BHK': [bhk],
        'Bathrooms': [bathrooms],
        'Age': [age],
        'Parking': [parking],
    }
    
    # Add location columns (one-hot encoding)
    # All location columns start as 0
    for loc_col in location_columns:
        input_data[loc_col] = [0]
    
    # Set the appropriate location column to 1
    location_col_name = f'Location_{location}'
    if location_col_name in location_columns:
        input_data[location_col_name] = [1]
    else:
        raise ValueError(
            f"Unknown location: {location}. "
            f"Valid locations: {[col.replace('Location_', '') for col in location_columns]}"
        )
    
    # Create DataFrame
    input_df = pd.DataFrame(input_data)
    
    # Ensure columns are in the same order as training
    input_df = input_df[feature_columns]
    
    # Scale the features (same scaling as training)
    input_scaled = scaler.transform(input_df)
    
    # Make prediction
    predicted_price = model.predict(input_scaled)[0]
    
    # Calculate price per square foot
    price_per_sqft = predicted_price / area if area > 0 else 0
    
    # Determine market status (business logic)
    avg_price = market_stats['avg_price']
    avg_price_per_sqft = market_stats['avg_price_per_sqft']
    
    # Market comparison logic
    # Using price per sqft for more accurate comparison
    if price_per_sqft < avg_price_per_sqft * 0.90:
        market_status = "Below Market"
    elif price_per_sqft > avg_price_per_sqft * 1.10:
        market_status = "Above Market"
    else:
        market_status = "Average"
    
    return {
        'predicted_price': round(predicted_price, 2),
        'price_per_sqft': round(price_per_sqft, 2),
        'market_status': market_status,
    }


def dummy_predict(features: Dict[str, Any]) -> Dict[str, Any]:
    """Dummy prediction function for testing."""
    numeric_values = [
        value for value in features.values() if isinstance(value, (int, float))
    ]
    if not numeric_values:
        return {"value": 0, "message": "No numeric features provided."}

    score = sum(numeric_values)
    return {
        "value": score,
        "message": "Dummy prediction is the sum of numeric features.",
    }


class Predictor:
    """Predictor class to manage multiple prediction models."""
    
    def __init__(self) -> None:
        self._models: Dict[str, Callable[[Dict[str, Any]], Any]] = {}

    def register(self, name: str, fn: Callable[[Dict[str, Any]], Any]) -> None:
        if not name:
            raise ValueError("Model name is required.")
        self._models[name] = fn

    def predict(self, name: str, features: Dict[str, Any]) -> Any:
        if name not in self._models:
            raise KeyError(name)
        return self._models[name](features)


# Create global predictor instance and register models
predictor = Predictor()
predictor.register("dummy", dummy_predict)
predictor.register("real_estate", real_estate_predict)
