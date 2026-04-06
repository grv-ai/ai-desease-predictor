const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, "../frontend")));

app.get("/",(req,res)=>{
 res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

app.post("/predict", (req,res)=>{
 const { age, weight, height, glucose, blood_pressure, cholesterol, smoking, activity } = req.body;

 // Validate inputs
 if (!age || !weight || !height || !glucose || !blood_pressure || !cholesterol || smoking === undefined || activity === undefined) {
  return res.status(400).json({ message: "All fields are required" });
 }

 const bmi = weight / ((height / 100) ** 2);

 // Enhanced risk calculation
 let riskScore = 0;

 // Age factor
 if (age > 60) riskScore += 0.4;
 else if (age > 45) riskScore += 0.2;
 else if (age > 30) riskScore += 0.1;

 // BMI factor
 if (bmi > 30) riskScore += 0.3;
 else if (bmi > 25) riskScore += 0.15;

 // Glucose factor
 if (glucose > 200) riskScore += 0.4;
 else if (glucose > 140) riskScore += 0.2;
 else if (glucose > 100) riskScore += 0.1;

 // Blood pressure factor
 if (blood_pressure > 180) riskScore += 0.4;
 else if (blood_pressure > 140) riskScore += 0.2;
 else if (blood_pressure > 120) riskScore += 0.1;

 // Cholesterol factor
 if (cholesterol > 300) riskScore += 0.4;
 else if (cholesterol > 240) riskScore += 0.2;
 else if (cholesterol > 200) riskScore += 0.1;

 // Smoking factor
 if (smoking === 1) riskScore += 0.2;

 // Activity factor (protective)
 if (activity === 0) riskScore += 0.1; // Low activity increases risk
 else if (activity === 1) riskScore += 0.05; // Moderate reduces risk slightly

 // Cap the risk score
 riskScore = Math.min(riskScore, 1.0);

 let prediction = "Low";
 let suggestion = "Keep up a healthy diet, stay active, and monitor your numbers regularly.";
 if (riskScore > 0.7) {
  prediction = "High";
  suggestion = "Please consult a medical professional and follow a healthy diet, exercise, and medication plan.";
 } else if (riskScore > 0.4) {
  prediction = "Medium";
  suggestion = "Maintain a balanced lifestyle with regular checkups and moderate exercise.";
 }

 res.json({
  age: parseFloat(age),
  weight: parseFloat(weight),
  height: parseFloat(height),
  bmi: parseFloat(bmi.toFixed(2)),
  glucose: parseFloat(glucose),
  blood_pressure: parseFloat(blood_pressure),
  cholesterol: parseFloat(cholesterol),
  smoking: parseInt(smoking),
  activity: parseInt(activity),
  probability: parseFloat(riskScore.toFixed(4)),
  prediction,
  suggestion,
  createdAt: new Date().toISOString() + "Z"
 });
});

app.get("/history", (req,res)=>{
 // Return empty history for now
 res.json([]);
});

app.listen(5000,()=>{
 console.log("🚀 Server running on http://localhost:5000");
});