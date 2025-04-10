import os
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LinearRegression, LogisticRegression
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import mean_squared_error, classification_report, r2_score
from sklearn.pipeline import Pipeline
import joblib
import logging
import sys
from sklearn.impute import SimpleImputer

# === Configure Logging ===
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger(__name__)

# === File Paths ===
DATA_PATH = "esg_agreements.csv"
MODEL_DIR = "model"
SCORE_MODEL_PATH = os.path.join(MODEL_DIR, "esg_score_model.pkl")
VECTORIZER_PATH = os.path.join(MODEL_DIR, "vectorizer.pkl")
VIOLATION_MODEL_PATH = os.path.join(MODEL_DIR, "violation_model.pkl")
MODEL_INFO_PATH = os.path.join(MODEL_DIR, "model_info.txt")

def main():
    # === Check for Dataset ===
    if not os.path.exists(DATA_PATH):
        logger.error(f"Dataset file '{DATA_PATH}' not found.")
        return False
    
    # === Create Model Directory ===
    os.makedirs(MODEL_DIR, exist_ok=True)
    
    # === Load Dataset ===
    try:
        df = pd.read_csv(DATA_PATH)
        logger.info(f"Loaded dataset with {len(df)} records")
    except Exception as e:
        logger.error(f"Failed to load dataset: {e}")
        return False
    
    # === Check Columns ===
    required_columns = ['text', 'esg_score', 'violated_norms']
    missing_cols = [col for col in required_columns if col not in df.columns]
    if missing_cols:
        logger.error(f"Missing required columns: {missing_cols}")
        return False
    
    # === Data Quality Check ===
    logger.info("Data quality check:")
    for col in required_columns:
        missing = df[col].isna().sum()
        logger.info(f"  - {col}: {missing} missing values")
    
    # === Clean Data ===
    # Make a copy to preserve original data
    df_clean = df.copy()
    
    # Handle missing values in text
    if df_clean['text'].isna().any():
        logger.warning(f"Found {df_clean['text'].isna().sum()} rows with missing text. Dropping these rows.")
        df_clean = df_clean.dropna(subset=['text'])
    
    # For ESG scores, we can fill NaNs with the mean
    if df_clean['esg_score'].isna().any():
        mean_score = df_clean['esg_score'].mean()
        logger.warning(f"Filling {df_clean['esg_score'].isna().sum()} missing ESG scores with mean: {mean_score:.2f}")
        df_clean['esg_score'] = df_clean['esg_score'].fillna(mean_score)
    
    # Convert violated_norms to string and handle NaNs
    df_clean['violated_norms'] = df_clean['violated_norms'].astype(str)
    df_clean.loc[df_clean['violated_norms'].isin(['nan', 'None']), 'violated_norms'] = 'None'
    
    logger.info(f"Clean dataset has {len(df_clean)} records")
    
    # === Check if we have enough data ===
    if len(df_clean) < 10:
        logger.warning("Dataset is very small. Models may not be reliable.")
    
    # === TF-IDF Vectorizer ===
    # Using a pipeline to ensure consistent preprocessing
    vectorizer = TfidfVectorizer(
        max_features=min(500, len(df_clean) * 2),  # Adjust features based on data size
        min_df=1,
        ngram_range=(1, 2)  # Include bigrams for better context
    )
    
    X_vec = vectorizer.fit_transform(df_clean['text'])
    logger.info(f"Vectorized text data with {X_vec.shape[1]} features")
    
    # === Train ESG Score Regression Model ===
    train_regression_model(X_vec, df_clean['esg_score'], vectorizer)
    
    # === Train ESG Norm Violation Classifier ===
    train_violation_model(X_vec, df_clean['violated_norms'], vectorizer)
    
    # Save model information
    with open(MODEL_INFO_PATH, 'w') as f:
        f.write(f"Model training completed on {pd.Timestamp.now()}\n")
        f.write(f"Dataset: {DATA_PATH}, {len(df_clean)} records\n")
        f.write(f"Features: {X_vec.shape[1]}\n")
        f.write(f"Class distribution: {df_clean['violated_norms'].value_counts().to_dict()}\n")
    
    logger.info(f"Model information saved to {MODEL_INFO_PATH}")
    return True

def train_regression_model(X_vec, y, vectorizer):
    """Train and evaluate the ESG score regression model"""
    try:
        # Split data for training and testing
        X_train, X_test, y_train, y_test = train_test_split(
            X_vec, y, test_size=0.2, random_state=42
        )
        
        # Train model
        reg_model = LinearRegression()
        reg_model.fit(X_train, y_train)
        
        # Evaluate model
        y_pred_score = reg_model.predict(X_test)
        rmse = np.sqrt(mean_squared_error(y_test, y_pred_score))
        r2 = r2_score(y_test, y_pred_score)
        logger.info(f"ESG Score Model - RMSE: {rmse:.2f}, R²: {r2:.2f}")
        
        # Cross-validation
        cv_scores = cross_val_score(reg_model, X_vec, y, cv=min(5, len(y)), scoring='neg_root_mean_squared_error')
        logger.info(f"Cross-validation RMSE: {-cv_scores.mean():.2f} ± {cv_scores.std():.2f}")
        
        # Save model
        joblib.dump(reg_model, SCORE_MODEL_PATH)
        joblib.dump(vectorizer, VECTORIZER_PATH)
        logger.info(f"ESG Score model saved to {SCORE_MODEL_PATH}")
        
        return True
    except Exception as e:
        logger.error(f"Error training regression model: {e}")
        return False

def train_violation_model(X_vec, y_violation, vectorizer):
    """Train and evaluate the ESG violation classification model"""
    # Check class distribution
    class_counts = y_violation.value_counts()
    logger.info(f"Class distribution:\n{class_counts}")
    
    # Check if we have enough data for classification
    if len(class_counts) < 2 or class_counts.min() < 2:
        logger.warning("Not enough data for classification. Skipping violation model training.")
        return False
    
    try:
        # Split data for training and testing
        X_train_v, X_test_v, y_train_v, y_test_v = train_test_split(
            X_vec, y_violation, test_size=0.2, random_state=42, stratify=y_violation
        )
        
        # Train model with class weighting to handle imbalanced data
        clf_model = LogisticRegression(
            max_iter=1000, 
            class_weight='balanced',
            solver='liblinear',
            multi_class='auto'
        )
        clf_model.fit(X_train_v, y_train_v)
        
        # Evaluate model
        y_pred_v = clf_model.predict(X_test_v)
        logger.info("ESG Norm Violation Classification Report:")
        logger.info("\n" + classification_report(y_test_v, y_pred_v))
        
        # Save model
        joblib.dump(clf_model, VIOLATION_MODEL_PATH)
        logger.info(f"Violation model saved to {VIOLATION_MODEL_PATH}")
        
        return True
    except Exception as e:
        logger.error(f"Error during violation model training: {e}")
        return False

if __name__ == "__main__":
    success = main()
    if success:
        logger.info("✅ Training completed successfully.")
    else:
        logger.error("❌ Training failed.")