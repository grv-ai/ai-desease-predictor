import os
import joblib
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

MODEL_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(MODEL_DIR, "model.pkl")

np.random.seed(42)

# Create a simple synthetic health dataset.
# Features: age, bmi, glucose, blood_pressure, cholesterol, smoking, activity
# Target 1 means higher disease risk, 0 means lower risk.
num_samples = 1200
age = np.random.randint(20, 80, size=num_samples)
weight = np.random.randint(45, 110, size=num_samples)
height = np.random.randint(145, 190, size=num_samples)
bmi = weight / ((height / 100.0) ** 2)
glucose = np.random.randint(70, 210, size=num_samples)
blood_pressure = np.random.randint(90, 180, size=num_samples)
cholesterol = np.random.randint(150, 310, size=num_samples)
smoking = np.random.choice([0, 1], size=num_samples, p=[0.7, 0.3])
activity = np.random.choice([0, 1, 2], size=num_samples, p=[0.35, 0.45, 0.2])

features = np.vstack([age, bmi, glucose, blood_pressure, cholesterol, smoking, activity]).T

# Use a synthetic target with reasonable medical-style patterns.
risk_score = (
    0.04 * age
    + 0.06 * bmi
    + 0.03 * glucose
    + 0.02 * blood_pressure
    + 0.02 * cholesterol
    + 0.2 * smoking
    - 0.15 * activity
)

# Adjust the scaling to create more balanced classes
probabilities = 1 / (1 + np.exp(-0.1 * (risk_score - np.mean(risk_score))))
labels = (probabilities > 0.4).astype(int)  # Lower threshold for more balanced classes

scaler = StandardScaler()
features_scaled = scaler.fit_transform(features)

X_train, X_test, y_train, y_test = train_test_split(features_scaled, labels, test_size=0.2, random_state=42)

model = LogisticRegression(max_iter=1000)
model.fit(X_train, y_train)

train_score = model.score(X_train, y_train)
test_score = model.score(X_test, y_test)

joblib.dump({"model": model, "scaler": scaler}, MODEL_PATH)

print(f"Model trained and saved to {MODEL_PATH}")
print(f"Train accuracy: {train_score:.3f}")
print(f"Test accuracy: {test_score:.3f}")
