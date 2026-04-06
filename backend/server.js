const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, "../frontend")));

app.get("/",(req,res)=>{
 res.send("Health AI Backend Running");
});

app.post("/predict", (req,res)=>{
 const { age, weight, height, glucose, blood_pressure, cholesterol, smoking, activity } = req.body;

 // Simple risk calculation (placeholder for ML model)
 let riskScore = 0;
 if (age > 50) riskScore += 0.3;
 if (glucose > 140) riskScore += 0.2;
 if (blood_pressure > 140) riskScore += 0.2;
 if (cholesterol > 200) riskScore += 0.2;
 if (smoking === 1) riskScore += 0.1;

 let prediction = "Low";
 let suggestion = "Keep up a healthy diet, stay active, and monitor your numbers regularly.";
 if (riskScore > 0.6) {
  prediction = "High";
  suggestion = "Please consult a medical professional and follow a healthy diet, exercise, and medication plan.";
 } else if (riskScore > 0.3) {
  prediction = "Medium";
  suggestion = "Maintain a balanced lifestyle with regular checkups and moderate exercise.";
 }

 const bmi = weight / ((height / 100) ** 2);

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