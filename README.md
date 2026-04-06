# AI Disease Predictor - Hackathon Project

A responsive web app for early disease risk prediction using AI/ML.

## Features

- **Responsive UI**: Modern Tailwind CSS interface with charts
- **AI Predictions**: Health risk assessment based on user inputs
- **Prediction History**: View past predictions with visualizations
- **No Authentication**: Direct access for quick demos

## Tech Stack

- **Frontend**: HTML, Tailwind CSS, JavaScript, Chart.js
- **Backend**: Node.js, Express.js
- **Deployment**: Ready for Vercel/Netlify

## Quick Start

1. **Clone the repo**
   ```bash
   git clone <your-repo-url>
   cd health-ai-project
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run locally**
   ```bash
   npm start
   ```
   Open http://localhost:5000

## Deployment

### Vercel (Recommended for Hackathons)

1. Connect your GitHub repo to Vercel
2. Deploy automatically - no config needed
3. Your app will be live at `your-project.vercel.app`

### Netlify

1. Drag & drop the project folder
2. Set build command: `npm start`
3. Deploy

## API Endpoints

- `POST /predict` - Get health risk prediction
- `GET /history` - Get prediction history
- `GET /` - Health check

## Sample Input

- Age: 45
- Weight: 78 kg
- Height: 170 cm
- Glucose: 115 mg/dL
- Blood Pressure: 135 mmHg
- Cholesterol: 220 mg/dL
- Smoking: No
- Activity: Moderate

## Project Structure

```
├── frontend/
│   ├── index.html
│   └── script.js
├── backend/
│   ├── server.js
│   └── package.json
├── model/
│   └── train_model.py (optional ML training)
└── README.md
```

## Demo

The app provides instant health risk predictions with visual charts and maintains a history of predictions for analysis.
