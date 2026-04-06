import os
import joblib
from datetime import datetime
from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient

load_dotenv()
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(os.path.dirname(BASE_DIR), "model", "model.pkl")
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("MONGO_DB", "health_ai")
COLLECTION_NAME = os.getenv("MONGO_COLLECTION", "predictions")

app = Flask(__name__)
CORS(app)

client = MongoClient(MONGO_URI)
db = client[DB_NAME]
collection = db[COLLECTION_NAME]

if not os.path.exists(MODEL_PATH):
    raise FileNotFoundError(f"Model not found: {MODEL_PATH}. Run model/train_model.py first.")

saved = joblib.load(MODEL_PATH)
model = saved.get("model")
scaler = saved.get("scaler")
if model is None or scaler is None:
    raise ValueError("Saved model file must contain 'model' and 'scaler'. Run model/train_model.py first.")

def predict_label(probability):
    if probability >= 0.65:
        return "High"
    if probability >= 0.35:
        return "Medium"
    return "Low"

def advice_for_level(level):
    if level == "High":
        return "Please consult a medical professional and follow a healthy diet, exercise, and medication plan."
    if level == "Medium":
        return "Maintain a balanced lifestyle with regular checkups and moderate exercise."
    return "Keep up a healthy diet, stay active, and monitor your numbers regularly."

@app.route("/", methods=["GET"])
def index():
    return jsonify({"message": "Health AI Flask backend is running."})

@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"message": "JSON body required."}), 400

    required_fields = ["age", "weight", "height", "glucose", "blood_pressure", "cholesterol", "smoking", "activity"]
    if not all(field in data for field in required_fields):
        return jsonify({"message": "Missing required fields."}), 400

    try:
        age = float(data["age"])
        weight = float(data["weight"])
        height = float(data["height"])
        glucose = float(data["glucose"])
        blood_pressure = float(data["blood_pressure"])
        cholesterol = float(data["cholesterol"])
        smoking = int(data["smoking"])
        activity = int(data["activity"])
    except (ValueError, TypeError):
        return jsonify({"message": "Invalid input values. Use numbers for health metrics."}), 400

    bmi = weight / ((height / 100) ** 2) if height > 0 else 0.0
    features = [[age, bmi, glucose, blood_pressure, cholesterol, smoking, activity]]
    features_scaled = scaler.transform(features)

    probability = float(model.predict_proba(features_scaled)[0][1])
    prediction = predict_label(probability)
    suggestion = advice_for_level(prediction)

    record = {
        "age": age,
        "weight": weight,
        "height": height,
        "bmi": round(bmi, 2),
        "glucose": glucose,
        "blood_pressure": blood_pressure,
        "cholesterol": cholesterol,
        "smoking": smoking,
        "activity": activity,
        "probability": round(probability, 4),
        "prediction": prediction,
        "suggestion": suggestion,
        "createdAt": datetime.utcnow(),
    }

    collection.insert_one(record)
    record["createdAt"] = record["createdAt"].isoformat() + "Z"

    return jsonify(record)

@app.route("/history", methods=["GET"])
def history():
    records = []
    for doc in collection.find({}).sort("createdAt", -1).limit(20):
        doc["id"] = str(doc.pop("_id"))
        doc["createdAt"] = doc["createdAt"].isoformat() + "Z"
        records.append(doc)

    return jsonify(records)

@app.route("/data", methods=["GET"])
def data():
    pipeline = [
        {"$group": {"_id": "$prediction", "count": {"$sum": 1}}},
    ]
    counts = {entry["_id"]: entry["count"] for entry in collection.aggregate(pipeline)}
    return jsonify({
        "counts": {
            "Low": counts.get("Low", 0),
            "Medium": counts.get("Medium", 0),
            "High": counts.get("High", 0),
        },
        "total": sum(counts.values()),
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
