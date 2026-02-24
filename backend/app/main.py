from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .model.predictor import predictor
from .schemas import (
    PredictionRequest,
    PredictionResponse,
    RealEstatePredictionRequest,
    RealEstatePredictionResponse,
)

import os

app = FastAPI(title="Prediction API", version="0.1.0")

# 1. FIX FastAPI CORS - Allowing Vercel and *
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://prediction-frontend-mauve.vercel.app",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. VERIFY API ROUTES - Root and Predict
@app.get("/")
def root():
    return {"status": "API is running successfully", "environment": "Production"}


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.post("/predict", response_model=PredictionResponse)
def predict(payload: PredictionRequest) -> PredictionResponse:
    try:
        result = predictor.predict(payload.model, payload.features)
    except KeyError:
        raise HTTPException(status_code=400, detail=f"Unknown model '{payload.model}'.")
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))

    return PredictionResponse(
        model=payload.model,
        prediction=result,
        details={"input_features": payload.features},
    )


@app.post("/predict/real-estate", response_model=RealEstatePredictionResponse)
def predict_real_estate(payload: RealEstatePredictionRequest) -> RealEstatePredictionResponse:
    """
    Predict real estate prices for Navi Mumbai properties.
    
    This endpoint uses a trained Linear Regression model to predict property prices
    based on location, area, number of bedrooms/bathrooms, age, and parking availability.
    """
    try:
        # Convert Pydantic model to dictionary
        features = {
            'location': payload.location,
            'area': payload.area,
            'bhk': payload.bhk,
            'bathrooms': payload.bathrooms,
            'age': payload.age,
            'parking': 1 if payload.parking else 0,
        }
        
        # Get prediction from the real_estate model
        result = predictor.predict('real_estate', features)
        
        return RealEstatePredictionResponse(
            predicted_price=result['predicted_price'],
            price_per_sqft=result['price_per_sqft'],
            market_status=result['market_status'],
        )
        
    except KeyError as exc:
        raise HTTPException(
            status_code=500, 
            detail=f"Model error: {str(exc)}. Make sure the model is trained."
        )
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    except Exception as exc:
        raise HTTPException(
            status_code=500, 
            detail=f"Prediction failed: {str(exc)}"
        )
