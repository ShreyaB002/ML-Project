from typing import Any, Dict, Literal

from pydantic import BaseModel, Field


class PredictionRequest(BaseModel):
    model: str = Field(default="dummy", description="Model key to use")
    features: Dict[str, Any] = Field(default_factory=dict)


class PredictionResponse(BaseModel):
    model: str
    prediction: Any
    details: Dict[str, Any] = Field(default_factory=dict)


# Real Estate specific schemas
class RealEstatePredictionRequest(BaseModel):
    """Request schema for Navi Mumbai real estate price prediction."""
    
    location: Literal["Vashi", "Nerul", "Kharghar", "Panvel"] = Field(
        ..., 
        description="Property location in Navi Mumbai"
    )
    area: float = Field(
        ..., 
        gt=0, 
        description="Property area in square feet",
        example=1000
    )
    bhk: int = Field(
        ..., 
        ge=1, 
        le=5, 
        description="Number of bedrooms (1-5)",
        example=2
    )
    bathrooms: int = Field(
        ..., 
        ge=1, 
        le=5, 
        description="Number of bathrooms (1-5)",
        example=2
    )
    age: int = Field(
        ..., 
        ge=0, 
        le=50, 
        description="Property age in years (0-50)",
        example=5
    )
    parking: bool = Field(
        ..., 
        description="Whether parking is available",
        example=True
    )


class RealEstatePredictionResponse(BaseModel):
    """Response schema for real estate price prediction."""
    
    predicted_price: float = Field(
        ..., 
        description="Predicted property price in INR"
    )
    price_per_sqft: float = Field(
        ..., 
        description="Predicted price per square foot in INR"
    )
    market_status: str = Field(
        ..., 
        description="Market comparison: Below Market, Average, or Above Market"
    )
