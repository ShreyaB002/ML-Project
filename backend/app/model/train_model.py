"""
Navi Mumbai Real Estate Price Predictor - Model Training Script

This script trains a Linear Regression model to predict property prices in Navi Mumbai.
It preprocesses the data, encodes categorical features, and saves the trained model.
"""

import os
import pickle
from pathlib import Path

import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

# Get the directory where this script is located
MODEL_DIR = Path(__file__).parent
DATASET_PATH = MODEL_DIR / "navi_mumbai_real_estate.csv"
MODEL_PATH = MODEL_DIR / "model.pkl"


def load_and_prepare_data():
    """Load CSV dataset and prepare it for training."""
    print("Loading dataset...")
    df = pd.read_csv(DATASET_PATH)
    
    print(f"Dataset loaded: {len(df)} rows, {len(df.columns)} columns")
    print(f"Columns: {df.columns.tolist()}")
    
    # Check for any missing values
    if df.isnull().sum().any():
        print("Warning: Missing values detected. Dropping rows with missing values...")
        df = df.dropna()
    
    print(f"Dataset after cleaning: {len(df)} rows")
    return df


def encode_features(df):
    """
    Encode categorical features using One-Hot Encoding.
    Returns encoded dataframe and list of location columns for later use.
    """
    print("\nEncoding categorical features...")
    
    # One-Hot Encode the Location column
    # get_dummies creates binary columns for each location
    df_encoded = pd.get_dummies(df, columns=['Location'], prefix='Location', drop_first=False)
    
    # Get list of all location columns created
    location_columns = [col for col in df_encoded.columns if col.startswith('Location_')]
    print(f"Created location columns: {location_columns}")
    
    return df_encoded, location_columns


def train_model(df_encoded):
    """Train Linear Regression model on the encoded dataset."""
    print("\nPreparing features and target...")
    
    # Separate features (X) and target (y)
    X = df_encoded.drop('Price', axis=1)
    y = df_encoded['Price']
    
    print(f"Features shape: {X.shape}")
    print(f"Target shape: {y.shape}")
    print(f"Feature columns: {X.columns.tolist()}")
    
    # Split data into training and testing sets (80-20 split)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    print(f"\nTraining set: {len(X_train)} samples")
    print(f"Testing set: {len(X_test)} samples")
    
    # Optional: Scale features for better performance
    # Note: Linear Regression doesn't strictly require scaling, but it can help
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Train the Linear Regression model
    print("\nTraining Linear Regression model...")
    model = LinearRegression()
    model.fit(X_train_scaled, y_train)
    
    # Evaluate the model
    train_score = model.score(X_train_scaled, y_train)
    test_score = model.score(X_test_scaled, y_test)
    
    print(f"\nModel Training Complete!")
    print(f"Training R² Score: {train_score:.4f}")
    print(f"Testing R² Score: {test_score:.4f}")
    
    return model, scaler, X.columns.tolist()


def calculate_market_stats(df):
    """Calculate statistics for market comparison logic."""
    avg_price = df['Price'].mean()
    avg_price_per_sqft = (df['Price'] / df['Area']).mean()
    
    print(f"\nMarket Statistics:")
    print(f"Average Property Price: ₹{avg_price:,.0f}")
    print(f"Average Price per Sq.Ft: ₹{avg_price_per_sqft:,.0f}")
    
    return {
        'avg_price': avg_price,
        'avg_price_per_sqft': avg_price_per_sqft,
    }


def save_model_artifacts(model, scaler, feature_columns, location_columns, market_stats):
    """Save the trained model and all preprocessing artifacts."""
    print(f"\nSaving model artifacts to {MODEL_PATH}...")
    
    # Package everything together
    model_artifacts = {
        'model': model,
        'scaler': scaler,
        'feature_columns': feature_columns,
        'location_columns': location_columns,
        'market_stats': market_stats,
    }
    
    # Save using pickle
    with open(MODEL_PATH, 'wb') as f:
        pickle.dump(model_artifacts, f)
    
    print(f"✓ Model saved successfully!")
    print(f"✓ Model file size: {os.path.getsize(MODEL_PATH) / 1024:.2f} KB")


def main():
    """Main training pipeline."""
    print("=" * 60)
    print("Navi Mumbai Real Estate Price Predictor - Model Training")
    print("=" * 60)
    
    # Step 1: Load and prepare data
    df = load_and_prepare_data()
    
    # Step 2: Encode categorical features
    df_encoded, location_columns = encode_features(df)
    
    # Step 3: Train the model
    model, scaler, feature_columns = train_model(df_encoded)
    
    # Step 4: Calculate market statistics
    market_stats = calculate_market_stats(df)
    
    # Step 5: Save everything
    save_model_artifacts(model, scaler, feature_columns, location_columns, market_stats)
    
    print("\n" + "=" * 60)
    print("Training Complete! Model is ready for predictions.")
    print("=" * 60)


if __name__ == "__main__":
    main()
