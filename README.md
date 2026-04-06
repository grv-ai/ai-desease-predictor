<<<<<<< HEAD
# AI Health Risk Prediction

This project is a beginner-friendly web app for early disease risk prediction.
It includes:
- `frontend/` — responsive Tailwind UI with charts and prediction history
- `backend/` — Flask REST API with CORS
- `model/` — ML model training and serialized model storage

## Project structure

- `frontend/index.html` — user interface
- `frontend/script.js` — frontend logic and API calls
- `backend/app.py` — Flask backend API
- `backend/requirements.txt` — Python dependencies
- `model/train_model.py` — generate synthetic data and train model
- `model/model.pkl` — serialized model file (created after training)

## Setup

### 0. Install Python

Download and install Python 3.11 from https://www.python.org/downloads/ or use:

```powershell
winget install Python.Python.3.11
```

Make sure to add Python to your PATH during installation.

### 1. Install Python dependencies

Open PowerShell in the project root and run:

```powershell
python -m pip install -r backend/requirements.txt
```

### 2. Create the ML model

Run:

```powershell
python model/train_model.py
```

This will generate `model/model.pkl`.

### 3. Configure environment variables

Copy the example file:

```powershell
copy backend\.env.example backend\.env
```

Edit `backend\.env` to set your MongoDB connection if needed.

### 4. Start MongoDB

Use a local MongoDB instance or MongoDB Atlas.
If local, the default connection string is `mongodb://localhost:27017`.

### 5. Run the backend

```powershell
python backend/app.py
```

The backend listens on `http://localhost:5000`.

### 6. Open the frontend

Open `frontend/index.html` in your browser.

## Sample test data

Use these values in the form:
- Age: `45`
- Weight: `78`
- Height: `170`
- Glucose: `115`
- Blood Pressure: `135`
- Cholesterol: `220`
- Smoking: `No`
- Physical Activity: `Moderate`

## Notes

- The frontend sends JSON to `/predict`
- Predictions are saved in MongoDB and shown in the history view
- The model is a simple logistic regression trained on synthetic data

## Troubleshooting

- If the UI cannot reach the backend, verify the backend is running on port `5000`
- If MongoDB is not available, set `MONGO_URI` and `MONGO_DB` as environment variables
- If `model/model.pkl` is missing, rerun `python model/train_model.py`
=======
# ai-desease-predictor
hackathon project
>>>>>>> 97b6e2e6f6fc5da2e6e39e0c24f6a8d9e54c8fe9
